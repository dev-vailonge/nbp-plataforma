# NBP Plataforma

App Next.js 15 (App Router) + Tailwind v4 do portal e backoffice No Blank Page.

O HTML estático original está em `legacy/` (referência visual). O schema Postgres está em `supabase/` e no [RFC 001](docs/rfc-001-schema-nbp.md). O [design system](docs/design-system.md) documenta tokens e primitives (showcase em `/app/design-system`). As páginas usam mocks com o mesmo shape das tabelas `nbp_*`; o login chama `signInWithPassword` quando as env do Supabase existem.

## Desenvolvimento

```bash
cp .env.local.example .env.local   # opcional; sem env o middleware deixa passar /app e /admin
npm install
npm run dev
```

- `/` landing
- `/login` e `/cadastro`
- `/app/*` portal do membro
- `/app/design-system` tokens e primitives
- `/admin/login` e `/admin/*` backoffice

## Supabase

Projeto `dotyjpdafxwkmmgmxlrz`. Copie `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` de `.env.local.example`. Sem estas variáveis, o preview visual funciona sem sessão.
