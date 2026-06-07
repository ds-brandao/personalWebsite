# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a Next.js 16 personal portfolio/blog website. The entire application lives in `next-app/`. There are no databases, background workers, or external service dependencies required for development.

### Running the application

```bash
cd next-app
npm run dev
```

Dev server runs on `http://localhost:3000`. Use `--hostname 0.0.0.0` if you need external access.

### Key commands

All commands run from the `next-app/` directory:

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Prod server | `npm run start` |
| Workers preview (local workerd) | `npm run preview` |
| Deploy to Cloudflare | `npm run deploy` (needs wrangler auth) |

### Notes

- **Lint exits with code 1** due to pre-existing React Hooks warnings (`set-state-in-effect`, `purity`). These are known issues in the codebase, not environment problems.
- **No test suite exists** — there are no unit/integration tests configured. Validation is done via lint + build + manual testing.
- **GitHub API data** is fetched server-side with ISR (5-minute revalidation). If the GitHub API is unreachable, pages degrade gracefully with empty data. Set `GITHUB_TOKEN` in `.env.local` to raise the rate limit from 60 to 5,000 requests/hour.
- **Node.js 20+** is required. The environment ships with Node 22 which works fine.
- **Deployment target is Cloudflare Workers** (OpenNext adapter, see `wrangler.jsonc` + `open-next.config.ts`). There is no filesystem at request time in production: `lib/data.ts` imports config/articles JSON statically and reads markdown via the `ASSETS` binding (with an `fs` fallback for local Node/Docker). Don't add request-time `fs` calls to server components.
- **CI/CD**: `.github/workflows/deploy.yaml` — PRs upload preview versions, pushes to `main` deploy production (`dbrandao.com`). Needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` repo secrets.
