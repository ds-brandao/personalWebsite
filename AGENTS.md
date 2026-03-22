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
| AI seed (optional) | `npm run seed` (requires `OPENAI_API_KEY` in `.env.local`) |

### Notes

- **Lint exits with code 1** due to pre-existing React Hooks warnings (`set-state-in-effect`, `purity`). These are known issues in the codebase, not environment problems.
- **No test suite exists** — there are no unit/integration tests configured. Validation is done via lint + build + manual testing.
- **GitHub API data** is fetched server-side with ISR (5-minute revalidation). If the GitHub API is unreachable, pages degrade gracefully with empty data.
- **AI analyses** (`public/config/analyses.json`) are pre-generated and committed. The `npm run seed` script only needs to run if you want to regenerate them (requires `OPENAI_API_KEY`).
- **Node.js 20+** is required. The environment ships with Node 22 which works fine.
