# Briefing do Convite

Formulário público (`/`) que coleta os dados de um casal, tela por tela, para montar um convite
de casamento. As respostas (texto + fotos) são enviadas para armazenamento privado no Vercel Blob
e só podem ser lidas em `/admin`, com senha.

## Configuração (uma vez só, no painel da Vercel)

1. **Criar o Blob store**: no projeto na Vercel, vá em `Storage` → `Create Database` → `Blob`,
   crie e conecte ao projeto. Isso adiciona a variável `BLOB_READ_WRITE_TOKEN` automaticamente.
2. **Definir a senha do painel**: em `Settings` → `Environment Variables`, adicione
   `ADMIN_PASSWORD` com a senha que você quiser usar para abrir `/admin`. Redeploy depois de
   salvar (a Vercel costuma pedir isso).

Sem esses dois passos, o formulário abre normalmente mas o envio (`/api/submit`) e o painel
(`/api/list`) retornam erro.

## Estrutura

- `index.html` — formulário público, mobile-first, sem nenhuma menção a Claude/prompt.
- `admin.html` — painel privado (senha via `ADMIN_PASSWORD`) que lista as respostas.
- `api/submit.js` — recebe o envio do formulário e grava em `submissions/<id>.json` no Blob.
- `api/list.js` — lê todas as submissions do Blob; exige o header `x-admin-key` com a senha.

## Fotos

Cada foto é comprimida no navegador (máx. 1400px, JPEG) antes de ser enviada, para caber
tranquilamente no limite de tamanho de requisição das funções da Vercel.
