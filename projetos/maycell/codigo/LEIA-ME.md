# Maycell – Sistema de Ordem de Serviço

Sistema para assistência técnica: abertura de OS, orçamento, status, aviso por WhatsApp, comprovante para imprimir e clientes. Os dados ficam em um banco **SQLite** no próprio computador.

## Como instalar (só uma vez)

1. Instale o **Python 3** em https://www.python.org/downloads/
   - Na instalação, marque a opção **"Add Python to PATH"**.
2. Descompacte a pasta `maycell` em um lugar fixo, por exemplo `C:\Maycell`.

Não precisa instalar mais nada.

## Como usar

1. Dê dois cliques em **`iniciar.bat`**.
2. Vai abrir uma janela preta e o navegador com o sistema em `http://localhost:8080`.
3. **Deixe a janela preta aberta** enquanto usa. Fechando ela, o sistema para.

Na primeira vez ele abre com dados de exemplo. Apague em **Ajustes → Apagar exemplos**.

### Usar pelo celular

Com o celular no **mesmo Wi-Fi** do computador, abra no navegador o endereço que aparece na janela preta, em "Celular no Wi-Fi" (algo como `http://192.168.0.10:8080`). Se o Windows perguntar sobre o firewall, clique em **Permitir**.

## Onde ficam os dados

| Arquivo / pasta | O que é |
|---|---|
| `maycell.db` | O banco de dados (OS, clientes, fotos, ajustes) |
| `backups/` | Cópia automática do banco, uma por dia, guardando os últimos 30 dias |

Para garantir, use também **Ajustes → Baixar backup** de vez em quando e guarde o arquivo no pen drive ou Google Drive.

Para restaurar uma cópia diária: feche o Maycell, apague `maycell.db` e copie um arquivo da pasta `backups` para o lugar dele, renomeando para `maycell.db`.

## Estrutura do banco

- `clientes` – nome, telefone, documento, endereço
- `ordens` – aparelho, defeito, estado, status, previsão, pagamento, desconto
- `itens` – peças e serviços de cada OS (descrição, tipo, quantidade, valor)
- `historico` – cada mudança de status com data e hora
- `fotos` – fotos do aparelho na entrada
- `config` – nome da loja, endereço, garantia e termo

Dá para abrir o `maycell.db` com o programa gratuito **DB Browser for SQLite** para ver ou exportar as tabelas.

## Trocar a porta

Se a porta 8080 já estiver em uso, crie a variável de ambiente `MAYCELL_PORTA` com outro número (ex.: 8090).
