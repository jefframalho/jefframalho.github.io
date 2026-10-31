# Maycell · Sistema de Ordem de Serviço

Sistema para assistências técnicas de celular, eletrônicos e informática controlarem os aparelhos que entram para conserto.

**🔗 Testar online:** https://jefframalho.github.io/projetos/maycell/
**⬇️ Baixar o programa:** [maycell.zip](maycell.zip)

## O que faz

- Abre ordens de serviço com cliente, aparelho, IMEI, senha, defeito, estado de entrada, acessórios e fotos
- Monta o orçamento com peças e mão de obra, desconto e total automático
- Controla o status: Recebido → Em análise → Aguardando aprovação → Em conserto → Pronto → Entregue
- Gera a mensagem pronta para o WhatsApp em cada etapa (orçamento, aviso de pronto, garantia)
- Painel com OS em aberto, atrasadas, prontas para retirada e faturamento do mês
- Comprovante para imprimir, com termo de garantia e assinatura
- Cadastro automático de clientes, com histórico de serviços
- Backup automático diário do banco

## Tecnologias

`Python` · `SQLite` · `HTML` · `CSS` · `JavaScript`

O servidor usa só a biblioteca padrão do Python: não precisa instalar nenhum pacote.

## Estrutura

```
codigo/
├── maycell.py        servidor HTTP + API REST + banco SQLite
├── static/index.html interface (painel, ordens, clientes, ajustes)
├── iniciar.bat       abre o sistema no Windows com dois cliques
└── LEIA-ME.md        manual de instalação e uso
```

### Banco de dados

| Tabela | Conteúdo |
|---|---|
| `clientes` | nome, telefone, documento, endereço |
| `ordens` | aparelho, defeito, status, previsão, pagamento, desconto |
| `itens` | peças e serviços de cada OS |
| `historico` | cada mudança de status com data e hora |
| `fotos` | fotos do aparelho na entrada |
| `config` | dados da loja, garantia e termo |

### API

| Método | Rota | Ação |
|---|---|---|
| GET | `/api/tudo` | ajustes, clientes e ordens |
| GET | `/api/os/{id}` | uma OS completa, com fotos |
| POST | `/api/os` | abre uma OS (cria o cliente se não existir) |
| PUT | `/api/os/{id}` | atualiza a OS e registra a mudança de status |
| DELETE | `/api/os/{id}` | exclui a OS |
| PUT | `/api/config` | salva os dados da loja |
| GET | `/api/backup` | baixa um backup completo em JSON |
| POST | `/api/restaurar` | restaura um backup |

## Rodar

```bash
cd codigo
python maycell.py
```

Abra http://localhost:8080. No Windows, basta dar dois cliques em `iniciar.bat`.

---

Feito por [Jefferson Ramalho](https://jefframalho.github.io) · Mauriti, CE
