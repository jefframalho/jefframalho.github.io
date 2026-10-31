"""
Maycell - Sistema de Ordem de Serviço
Servidor local em Python (sem instalar nada além do Python 3.8+) com banco SQLite.

Como usar:  python maycell.py
Depois abra no navegador:  http://localhost:8080
"""
import json
import os
import re
import shutil
import socket
import sqlite3
import sys
import threading
import webbrowser
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

PASTA = os.path.dirname(os.path.abspath(__file__))
ARQ_BANCO = os.path.join(PASTA, "maycell.db")
PASTA_BACKUP = os.path.join(PASTA, "backups")
PASTA_TELA = os.path.join(PASTA, "static")
PORTA = int(os.environ.get("MAYCELL_PORTA", "8080"))
STATUS = {"recebido", "analise", "aguardando", "conserto", "pronto", "entregue", "sem"}

CFG_PADRAO = {
    "loja": "Maycell Assistência Técnica",
    "tel": "",
    "end": "",
    "doc": "",
    "garantia": 90,
    "termo": "Garantia de {dias} dias sobre o serviço executado e as peças trocadas, a partir da data de entrega. "
             "A garantia não cobre quedas, contato com líquidos, tela quebrada após a entrega ou lacre violado. "
             "Aparelhos não retirados em até 90 dias após o aviso de conclusão poderão ter destinação conforme a lei.",
    "exemplo": False,
}


# ---------------------------------------------------------------- banco
def agora():
    return datetime.now().astimezone().isoformat(timespec="seconds")


def conectar():
    con = sqlite3.connect(ARQ_BANCO, timeout=10)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con


def criar_tabelas():
    with conectar() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS config (
            chave TEXT PRIMARY KEY,
            valor TEXT
        );
        CREATE TABLE IF NOT EXISTS clientes (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            nome      TEXT NOT NULL,
            telefone  TEXT DEFAULT '',
            documento TEXT DEFAULT '',
            endereco  TEXT DEFAULT '',
            criado_em TEXT,
            exemplo   INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS ordens (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id  INTEGER NOT NULL REFERENCES clientes(id),
            tipo        TEXT, marca TEXT, modelo TEXT, serie TEXT, senha TEXT,
            defeito     TEXT, estado TEXT, acessorios TEXT,
            status      TEXT NOT NULL DEFAULT 'recebido',
            previsao    TEXT, pagamento TEXT,
            desconto    REAL DEFAULT 0,
            obs         TEXT,
            criado_em   TEXT, entregue_em TEXT,
            exemplo     INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS itens (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            ordem_id   INTEGER NOT NULL REFERENCES ordens(id) ON DELETE CASCADE,
            descricao  TEXT, tipo TEXT, quantidade REAL, valor REAL
        );
        CREATE TABLE IF NOT EXISTS historico (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            ordem_id INTEGER NOT NULL REFERENCES ordens(id) ON DELETE CASCADE,
            status   TEXT, em TEXT
        );
        CREATE TABLE IF NOT EXISTS fotos (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            ordem_id INTEGER NOT NULL REFERENCES ordens(id) ON DELETE CASCADE,
            dados    TEXT
        );
        CREATE INDEX IF NOT EXISTS ix_ordens_status ON ordens(status);
        CREATE INDEX IF NOT EXISTS ix_ordens_cliente ON ordens(cliente_id);
        """)


def ler_cfg(con):
    cfg = dict(CFG_PADRAO)
    for r in con.execute("SELECT chave, valor FROM config"):
        cfg[r["chave"]] = json.loads(r["valor"])
    return cfg


def gravar_cfg(con, dados):
    for k in CFG_PADRAO:
        if k in dados:
            con.execute("INSERT OR REPLACE INTO config (chave, valor) VALUES (?, ?)", (k, json.dumps(dados[k])))


def so_digitos(s):
    return re.sub(r"\D", "", s or "")


# ---------------------------------------------------------------- conversões
def cliente_json(r):
    return {"id": r["id"], "nome": r["nome"], "tel": r["telefone"], "doc": r["documento"],
            "end": r["endereco"], "ex": r["exemplo"]}


def ordem_json(con, r, com_fotos=False):
    o = {
        "id": r["id"], "num": r["id"], "clienteId": r["cliente_id"],
        "tipo": r["tipo"] or "", "marca": r["marca"] or "", "modelo": r["modelo"] or "",
        "serie": r["serie"] or "", "senha": r["senha"] or "", "defeito": r["defeito"] or "",
        "estado": r["estado"] or "", "acessorios": r["acessorios"] or "", "status": r["status"],
        "previsao": r["previsao"] or "", "pagamento": r["pagamento"] or "", "desconto": r["desconto"] or 0,
        "obs": r["obs"] or "", "criadoEm": r["criado_em"], "entregueEm": r["entregue_em"] or "", "ex": r["exemplo"],
        "itens": [{"d": i["descricao"], "t": i["tipo"], "q": i["quantidade"], "v": i["valor"]}
                  for i in con.execute("SELECT * FROM itens WHERE ordem_id=? ORDER BY id", (r["id"],))],
        "historico": [{"s": h["status"], "em": h["em"]}
                      for h in con.execute("SELECT * FROM historico WHERE ordem_id=? ORDER BY id", (r["id"],))],
    }
    if com_fotos:
        o["fotos"] = [f["dados"] for f in con.execute("SELECT dados FROM fotos WHERE ordem_id=? ORDER BY id", (r["id"],))]
    else:
        o["nFotos"] = con.execute("SELECT COUNT(*) FROM fotos WHERE ordem_id=?", (r["id"],)).fetchone()[0]
    return o


def num(v, padrao=0.0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return padrao


# ---------------------------------------------------------------- regras
def achar_ou_criar_cliente(con, c):
    nome = (c.get("nome") or "").strip()
    tel = (c.get("tel") or "").strip()
    end = (c.get("end") or "").strip()
    if not nome:
        raise ValueError("Informe o nome do cliente.")
    linha = None
    if so_digitos(tel):
        for r in con.execute("SELECT * FROM clientes"):
            if so_digitos(r["telefone"]) == so_digitos(tel):
                linha = r
                break
    if linha is None:
        linha = con.execute("SELECT * FROM clientes WHERE lower(nome)=lower(?)", (nome,)).fetchone()
    if linha is None:
        cur = con.execute("INSERT INTO clientes (nome, telefone, endereco, criado_em) VALUES (?,?,?,?)",
                          (nome, tel, end, agora()))
        return cur.lastrowid
    con.execute("UPDATE clientes SET nome=?, telefone=?, endereco=? WHERE id=?", (nome, tel, end, linha["id"]))
    return linha["id"]


def gravar_detalhes(con, oid, o):
    con.execute("DELETE FROM itens WHERE ordem_id=?", (oid,))
    for i in o.get("itens") or []:
        d = (i.get("d") or "").strip()
        if not d and not num(i.get("v")):
            continue
        con.execute("INSERT INTO itens (ordem_id, descricao, tipo, quantidade, valor) VALUES (?,?,?,?,?)",
                    (oid, d, "peca" if i.get("t") == "peca" else "servico", num(i.get("q"), 1), num(i.get("v"))))
    if "fotos" in o:
        con.execute("DELETE FROM fotos WHERE ordem_id=?", (oid,))
        for f in (o.get("fotos") or [])[:4]:
            if isinstance(f, str) and f.startswith("data:image/"):
                con.execute("INSERT INTO fotos (ordem_id, dados) VALUES (?,?)", (oid, f))


def validar(o):
    if not (o.get("modelo") or "").strip():
        raise ValueError("Informe o modelo do aparelho.")
    if not (o.get("defeito") or "").strip():
        raise ValueError("Informe o defeito relatado.")
    if o.get("status", "recebido") not in STATUS:
        raise ValueError("Status inválido.")


CAMPOS = ["tipo", "marca", "modelo", "serie", "senha", "defeito", "estado", "acessorios", "previsao", "pagamento", "obs"]


def criar_ordem(con, o):
    validar(o)
    cid = achar_ou_criar_cliente(con, o.get("cliente") or {})
    t = agora()
    status = o.get("status") or "recebido"
    cur = con.execute(
        f"INSERT INTO ordens (cliente_id, {', '.join(CAMPOS)}, status, desconto, criado_em, entregue_em) "
        f"VALUES (?, {', '.join('?' * len(CAMPOS))}, ?, ?, ?, ?)",
        [cid] + [(o.get(k) or "").strip() for k in CAMPOS] + [status, num(o.get("desconto")), t,
                                                             t if status == "entregue" else None])
    oid = cur.lastrowid
    con.execute("INSERT INTO historico (ordem_id, status, em) VALUES (?,?,?)", (oid, status, t))
    gravar_detalhes(con, oid, o)
    return oid


def atualizar_ordem(con, oid, o):
    atual = con.execute("SELECT * FROM ordens WHERE id=?", (oid,)).fetchone()
    if not atual:
        raise LookupError("OS não encontrada.")
    validar(o)
    cid = achar_ou_criar_cliente(con, o.get("cliente") or {})
    status = o.get("status") or atual["status"]
    entregue_em = atual["entregue_em"]
    if status != atual["status"]:
        t = agora()
        con.execute("INSERT INTO historico (ordem_id, status, em) VALUES (?,?,?)", (oid, status, t))
        if status == "entregue":
            entregue_em = t
    con.execute(
        f"UPDATE ordens SET cliente_id=?, {', '.join(k + '=?' for k in CAMPOS)}, status=?, desconto=?, entregue_em=? WHERE id=?",
        [cid] + [(o.get(k) or "").strip() for k in CAMPOS] + [status, num(o.get("desconto")), entregue_em, oid])
    gravar_detalhes(con, oid, o)


def tudo(con):
    cfg = ler_cfg(con)
    return {
        "cfg": cfg,
        "exemplo": bool(cfg.get("exemplo")),
        "clientes": [cliente_json(r) for r in con.execute("SELECT * FROM clientes ORDER BY nome")],
        "os": [ordem_json(con, r) for r in con.execute("SELECT * FROM ordens ORDER BY id DESC")],
        "info": {"arquivo": ARQ_BANCO, "rede": endereco_rede()},
    }


def backup_completo(con):
    d = tudo(con)
    d["os"] = [ordem_json(con, r, com_fotos=True) for r in con.execute("SELECT * FROM ordens ORDER BY id")]
    d.pop("info", None)
    d["versao"] = 1
    return d


def zerar(con):
    con.executescript("DELETE FROM fotos; DELETE FROM historico; DELETE FROM itens; DELETE FROM ordens; DELETE FROM clientes;"
                      "DELETE FROM sqlite_sequence WHERE name IN ('ordens','clientes','itens','historico','fotos');")


def restaurar(con, d):
    if not isinstance(d, dict) or "os" not in d or "clientes" not in d:
        raise ValueError("Arquivo de backup inválido.")
    zerar(con)
    ids = {}
    for c in d["clientes"]:
        cur = con.execute("INSERT INTO clientes (nome, telefone, documento, endereco, criado_em, exemplo) VALUES (?,?,?,?,?,?)",
                          (c.get("nome") or "Sem nome", c.get("tel") or "", c.get("doc") or "", c.get("end") or "", agora(), 1 if c.get("ex") else 0))
        ids[str(c.get("id"))] = cur.lastrowid
    for o in sorted(d["os"], key=lambda x: x.get("num") or 0):
        cid = ids.get(str(o.get("clienteId")))
        if cid is None:
            continue
        cur = con.execute(
            f"INSERT INTO ordens (id, cliente_id, {', '.join(CAMPOS)}, status, desconto, criado_em, entregue_em, exemplo) "
            f"VALUES (?, ?, {', '.join('?' * len(CAMPOS))}, ?, ?, ?, ?, ?)",
            [o.get("num"), cid] + [o.get(k) or "" for k in CAMPOS] +
            [o.get("status") if o.get("status") in STATUS else "recebido", num(o.get("desconto")),
             o.get("criadoEm") or agora(), o.get("entregueEm") or None, 1 if o.get("ex") else 0])
        oid = cur.lastrowid
        for h in o.get("historico") or []:
            con.execute("INSERT INTO historico (ordem_id, status, em) VALUES (?,?,?)", (oid, h.get("s"), h.get("em")))
        gravar_detalhes(con, oid, o)
    if isinstance(d.get("cfg"), dict):
        gravar_cfg(con, d["cfg"])


def carregar_exemplos(con):
    base = datetime.now().astimezone()
    t = lambda dias: (base - timedelta(days=dias)).isoformat(timespec="seconds")
    clientes = [("Maria José Silva", "(88) 99812-3344", "Rua São José, 120"),
                ("Antônio Carlos Pereira", "(88) 99654-1020", ""),
                ("Francisca Lima", "(88) 99701-5588", ""),
                ("José Wellington Alves", "(88) 99933-2177", "Sítio Boa Vista"),
                ("Raimunda Souza", "(88) 99210-4466", "")]
    cid = []
    for n, tel, end in clientes:
        cid.append(con.execute("INSERT INTO clientes (nome, telefone, endereco, criado_em, exemplo) VALUES (?,?,?,?,1)",
                               (n, tel, end, t(15))).lastrowid)
    fluxo = ["recebido", "analise", "aguardando", "conserto", "pronto", "entregue"]
    ordens = [
        (0, "Celular", "Samsung", "Galaxy A32", "Tela quebrada após queda, touch funcionando parcialmente", "entregue", 9,
         [("Tela A32 com aro", "peca", 320), ("Mão de obra – troca de tela", "servico", 60)], {"pagamento": "Pix", "estado": "Tampa traseira com riscos", "acessorios": "Capinha"}),
        (1, "Celular", "Motorola", "Moto G22", "Não carrega, só funciona com o cabo em certa posição", "pronto", 4,
         [("Conector de carga", "peca", 45), ("Mão de obra", "servico", 40)], {}),
        (2, "Celular", "Apple", "iPhone 11", "Bateria descarregando muito rápido, desliga com 30%", "aguardando", 3,
         [("Bateria iPhone 11", "peca", 280), ("Mão de obra", "servico", 70)], {"acessorios": "Chip Claro"}),
        (3, "Notebook", "Positivo", "Motion Q464C", "Muito lento, demora 10 min para ligar", "conserto", 6,
         [("SSD 240 GB", "peca", 190), ("Formatação + instalação do Windows", "servico", 80)],
         {"previsao": (base - timedelta(days=1)).strftime("%Y-%m-%d"), "acessorios": "Carregador"}),
        (4, "Celular", "Xiaomi", "Redmi Note 10", "Caiu na água, não liga", "analise", 1, [], {"estado": "Sinais de oxidação na gaveta do chip"}),
        (0, "Caixa de som", "JBL", "Flip 5", "Não liga, mesmo carregada", "recebido", 0, [], {}),
        (1, "Celular", "Samsung", "Galaxy J7 Prime", "Não liga, curto na placa", "sem", 12, [("Taxa de diagnóstico", "servico", 30)], {}),
    ]
    for ci, tipo, marca, modelo, defeito, status, dias, itens, extra in ordens:
        etapas = ["recebido", "analise", "sem"] if status == "sem" else fluxo[:fluxo.index(status) + 1]
        datas = [t(max(0, dias - i * (dias / len(etapas)))) for i in range(len(etapas))]
        oid = con.execute(
            "INSERT INTO ordens (cliente_id, tipo, marca, modelo, defeito, estado, acessorios, status, previsao, pagamento, "
            "criado_em, entregue_em, exemplo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)",
            (cid[ci], tipo, marca, modelo, defeito, extra.get("estado", ""), extra.get("acessorios", ""), status,
             extra.get("previsao", ""), extra.get("pagamento", ""), datas[0], datas[-1] if status == "entregue" else None)).lastrowid
        for s, em in zip(etapas, datas):
            con.execute("INSERT INTO historico (ordem_id, status, em) VALUES (?,?,?)", (oid, s, em))
        for d, tp, v in itens:
            con.execute("INSERT INTO itens (ordem_id, descricao, tipo, quantidade, valor) VALUES (?,?,?,1,?)", (oid, d, tp, v))
    gravar_cfg(con, {"exemplo": True})


def apagar_exemplos(con):
    con.execute("DELETE FROM ordens WHERE exemplo=1")
    con.execute("DELETE FROM clientes WHERE exemplo=1 AND id NOT IN (SELECT cliente_id FROM ordens)")
    gravar_cfg(con, {"exemplo": False})


def backup_diario():
    """Copia o banco para a pasta backups uma vez por dia e mantém os últimos 30."""
    if not os.path.exists(ARQ_BANCO):
        return
    os.makedirs(PASTA_BACKUP, exist_ok=True)
    destino = os.path.join(PASTA_BACKUP, f"maycell-{datetime.now():%Y-%m-%d}.db")
    if not os.path.exists(destino):
        origem = sqlite3.connect(ARQ_BANCO)
        copia = sqlite3.connect(destino)
        origem.backup(copia)
        copia.close()
        origem.close()
    arquivos = sorted(f for f in os.listdir(PASTA_BACKUP) if f.startswith("maycell-") and f.endswith(".db"))
    for velho in arquivos[:-30]:
        os.remove(os.path.join(PASTA_BACKUP, velho))


def endereco_rede():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("10.255.255.255", 1))
        ip = s.getsockname()[0]
        s.close()
        return f"http://{ip}:{PORTA}"
    except OSError:
        return ""


# ---------------------------------------------------------------- servidor HTTP
TIPOS = {".html": "text/html; charset=utf-8", ".js": "application/javascript", ".css": "text/css",
         ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon"}


class Maycell(BaseHTTPRequestHandler):
    server_version = "Maycell/1.0"

    def log_message(self, fmt, *args):  # deixa a janela limpa
        pass

    def responder(self, codigo, dados, extra=None):
        corpo = json.dumps(dados, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        self.send_header("Cache-Control", "no-store")
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(corpo)

    def corpo(self):
        n = int(self.headers.get("Content-Length") or 0)
        if n > 40 * 1024 * 1024:
            raise ValueError("Envio grande demais.")
        return json.loads(self.rfile.read(n) or b"{}")

    def arquivo(self, caminho):
        nome = "index.html" if caminho in ("", "/") else caminho.lstrip("/")
        cheio = os.path.normpath(os.path.join(PASTA_TELA, nome))
        if not cheio.startswith(PASTA_TELA) or not os.path.isfile(cheio):
            cheio = os.path.join(PASTA_TELA, "index.html")
        with open(cheio, "rb") as f:
            dados = f.read()
        self.send_response(200)
        self.send_header("Content-Type", TIPOS.get(os.path.splitext(cheio)[1], "application/octet-stream"))
        self.send_header("Content-Length", str(len(dados)))
        self.end_headers()
        self.wfile.write(dados)

    def tratar(self, metodo):
        rota = urlparse(self.path).path.rstrip("/")
        if not rota.startswith("/api"):
            if metodo == "GET":
                return self.arquivo(rota)
            return self.responder(404, {"erro": "Rota não encontrada."})
        try:
            with conectar() as con:
                m = re.fullmatch(r"/api/os/(\d+)", rota)
                if metodo == "GET" and rota == "/api/tudo":
                    return self.responder(200, tudo(con))
                if metodo == "GET" and m:
                    r = con.execute("SELECT * FROM ordens WHERE id=?", (int(m[1]),)).fetchone()
                    if not r:
                        return self.responder(404, {"erro": "OS não encontrada."})
                    return self.responder(200, ordem_json(con, r, com_fotos=True))
                if metodo == "POST" and rota == "/api/os":
                    oid = criar_ordem(con, self.corpo())
                    return self.responder(201, {"id": oid})
                if metodo == "PUT" and m:
                    atualizar_ordem(con, int(m[1]), self.corpo())
                    return self.responder(200, {"id": int(m[1])})
                if metodo == "DELETE" and m:
                    con.execute("DELETE FROM ordens WHERE id=?", (int(m[1]),))
                    return self.responder(200, {"ok": True})
                if metodo == "PUT" and rota == "/api/config":
                    gravar_cfg(con, self.corpo())
                    return self.responder(200, {"ok": True})
                if metodo == "GET" and rota == "/api/backup":
                    nome = f"maycell-backup-{datetime.now():%Y-%m-%d}.json"
                    return self.responder(200, backup_completo(con), {"Content-Disposition": f'attachment; filename="{nome}"'})
                if metodo == "POST" and rota == "/api/restaurar":
                    restaurar(con, self.corpo())
                    return self.responder(200, {"ok": True})
                if metodo == "POST" and rota == "/api/exemplos/apagar":
                    apagar_exemplos(con)
                    return self.responder(200, {"ok": True})
                if metodo == "POST" and rota == "/api/zerar":
                    zerar(con)
                    gravar_cfg(con, {"exemplo": False})
                    return self.responder(200, {"ok": True})
            return self.responder(404, {"erro": "Rota não encontrada."})
        except LookupError as e:
            return self.responder(404, {"erro": str(e)})
        except (ValueError, json.JSONDecodeError) as e:
            return self.responder(400, {"erro": str(e) or "Dados inválidos."})
        except Exception as e:  # noqa
            print("Erro:", repr(e))
            return self.responder(500, {"erro": "Erro interno. Veja a janela do Maycell."})

    def do_GET(self):
        self.tratar("GET")

    def do_POST(self):
        self.tratar("POST")

    def do_PUT(self):
        self.tratar("PUT")

    def do_DELETE(self):
        self.tratar("DELETE")


def main():
    novo = not os.path.exists(ARQ_BANCO)
    criar_tabelas()
    if novo:
        with conectar() as con:
            carregar_exemplos(con)
    backup_diario()
    try:
        servidor = ThreadingHTTPServer(("0.0.0.0", PORTA), Maycell)
    except OSError:
        print(f"A porta {PORTA} já está em uso. O Maycell talvez já esteja aberto em http://localhost:{PORTA}")
        input("Pressione Enter para sair...")
        sys.exit(1)
    local = f"http://localhost:{PORTA}"
    print("=" * 56)
    print("  MAYCELL - Ordem de Serviço")
    print("=" * 56)
    print(f"  Neste computador:   {local}")
    rede = endereco_rede()
    if rede:
        print(f"  Celular no Wi-Fi:   {rede}")
    print(f"  Banco de dados:     {ARQ_BANCO}")
    print("\n  Deixe esta janela aberta enquanto usa o sistema.")
    print("  Para fechar, pressione Ctrl+C ou feche a janela.\n")
    if "--sem-navegador" not in sys.argv:
        threading.Timer(1.0, lambda: webbrowser.open(local)).start()
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nMaycell encerrado.")


if __name__ == "__main__":
    main()
