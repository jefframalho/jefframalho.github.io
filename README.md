# Portfólio de Jefferson Ramalho

Site estático em HTML, CSS e JavaScript. Abra `index.html` no navegador para testar localmente.

## Editar contato e projetos

No final de `index.html`, localize o objeto `site`.

- `whatsapp` recebe o número com código do país e DDD, somente dígitos.
- `photo` recebe o caminho da foto profissional.
- `projects` reúne os textos, links públicos e imagens de cada projeto. Preencha `url` para mostrar o botão de acesso na página de detalhes. Preencha `image` com o caminho de uma captura autorizada, preferencialmente em WebP. Use capturas sem dados de clientes ou pacientes.
- `catalogo.html` mantém o catálogo anterior e o formulário de pedidos. `produtos.json` mantém o endereço usado pelo bot do Discord.

## Publicar

- **GitHub Pages** — Em Settings → Pages, selecione Deploy from a branch, `main` e `/ (root)`. Envie os arquivos para essa branch.
- **Netlify** — Importe o repositório, deixe o comando de build vazio e use `.` como pasta de publicação. Também é possível enviar a pasta do site pelo deploy manual.
