# Primeiro Passo — vagas de estágio

Landing page responsiva para encontrar e divulgar vagas de estágio, feita com HTML, Tailwind CSS via CDN, CSS personalizado e JavaScript. As vagas são compartilhadas entre visitantes usando Supabase.

Projeto no GitHub: <https://github.com/danfae/linktree-daniel-rafael/tree/main/vagas-estagio>

## Arquivos

- `index.html`, `styles.css` e `app.js`: página, identidade visual e integração com o banco.
- `database.sql`: tabela pública de vagas e regras de acesso.

## Acesso público

Qualquer visitante pode consultar e cadastrar vagas. O banco só permite leitura e inserção anônimas; não permite editar ou apagar vagas pela página. O e-mail de contato aparece publicamente para que estudantes possam falar com a empresa.

A página usa uma chave Supabase publicável, própria para uso no navegador. A segurança dos dados depende das políticas de Row Level Security incluídas em `database.sql`.
