# by samantha brown

Source for **bysamanthabrown.com**: a React + Vite site whose words and photos are edited in a built-in editor (stored in Supabase) and which deploys to Netlify on every push to `main`.

- Working on the site with Claude Code: see [CLAUDE.md](CLAUDE.md).
- Design decisions: see [docs/design](docs/design).

```bash
npm install
npm run dev
```

Needs a `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`).
