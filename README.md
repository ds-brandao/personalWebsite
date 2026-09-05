# Personal Website

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy Website](https://github.com/ds-brandao/personalWebsite/actions/workflows/deploy.yml/badge.svg)](https://github.com/ds-brandao/personalWebsite/actions/workflows/deploy.yml)

A modern, responsive personal portfolio website built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Motion**. Fork it, customize it, and make it your own.

## Features

- **Streaming Server Rendering** — Home content appears independently of GitHub requests
- **Tailwind CSS** — Utility-first styling with custom dark theme
- **Motion Animations** — Smooth, performant animations throughout
- **Static Blog** — Prerendered Markdown articles with tag filtering and dedicated reader pages
- **GitHub Integration** — Automatically fetches and displays GitHub repositories
- **Responsive Design** — Mobile-first layout with adaptive grid system
- **Docker Development** — Containerized development and production environments

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS with custom theme |
| **Animations** | Motion (Framer Motion) |
| **Markdown** | react-markdown with GitHub Flavored Markdown |
| **Build** | Turbopack (dev), OpenNext for Cloudflare (production) |
| **Deploy** | Cloudflare Workers via GitHub Actions |
| **Container** | Docker with multi-stage builds (local testing) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Docker](https://www.docker.com/) and Docker Compose (optional, for containerized development)

### Local Development

```bash
# Clone the repository
git clone https://github.com/ds-brandao/personalWebsite.git
cd personalWebsite/next-app
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Development

```bash
docker compose up dev
```

### Production Build

```bash
# With Node.js
cd next-app
npm run build
npm run start

# With Docker
docker build -t personal-website .
docker run -p 80:80 personal-website
```

## Project Structure

```
├── next-app/                   # Next.js application
│   ├── app/
│   │   ├── (tabs)/             # Home, Articles, Projects routes
│   │   ├── globals.css         # Design tokens (warm-neutral light/dark)
│   │   └── fonts.ts            # Schibsted Grotesk, Hanken Grotesk, JetBrains Mono
│   ├── components/             # React components
│   │   ├── Hero.tsx            # Home hero
│   │   ├── ProjectGrid.tsx     # Project cards + commits panel
│   │   ├── ArticleCard.tsx     # Blog post cards
│   │   └── ActivityFeed.tsx    # Unified recent activity feed
│   ├── lib/
│   │   ├── config.ts           # Bundled personal configuration
│   │   ├── articles.ts         # Article lookup, Markdown, reading-time summaries
│   │   ├── github.ts           # Cached, bounded GitHub requests
│   │   ├── activity.ts         # Recent-activity composition
│   │   └── navigation.ts       # Shared routes and active-route matching
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── public/
│   │   ├── config/             # Configuration files
│   │   │   ├── config.json     # Personal info & tags
│   │   │   └── articles.json   # Blog post metadata
│   │   ├── blog-posts/         # Markdown blog posts
│   │   └── images/             # Static images
│   └── package.json
├── Dockerfile                  # Multi-stage Docker build
├── docker-compose.yaml         # Development environment
└── README.md
```

## Rendering and data flow

- `public/config/` and `public/blog-posts/` are the application's content source. Configuration is synchronous; article reads are asynchronous and shared within a server render.
- `/articles` and every configured `/articles/[slug]` page are prerendered at build time. Publishing an article requires a rebuild, and an unknown slug returns 404. Markdown parsing and syntax highlighting stay on the server; only interactive controls and Mermaid diagrams need browser code.
- Home and Projects stream their slow GitHub sections behind the existing skeletons. Repository and commit requests keep their five-minute cache, have a five-second timeout per request, and degrade to empty data when unavailable. Home's project and activity sections share the same data snapshot; only fields used by the UI reach client components.
- A deployed Cloudflare Worker reads Markdown through `ASSETS`; development, prerendering, and local Node/Docker use asynchronous file reads. Missing configured Markdown fails visibly instead of producing an empty article.
- Desktop and mobile navigation share their route definitions and theme toggle. The existing layout, theme colors, and animations are retained; reduced-motion preferences are respected, and scroll reveals progressively enhance already-visible HTML.

## Customization

### Personal Information

Edit `next-app/public/config/config.json` to set your name, social links, and tags:

```json
{
  "personal": {
    "name": "Your Name"
  },
  "social": {
    "github": { "username": "your-username", "url": "https://github.com/..." },
    "email": "your@email.com",
    "linkedin": "https://linkedin.com/in/..."
  },
  "tags": { ... }
}
```

### Adding Blog Posts

1. Create a Markdown file in `next-app/public/blog-posts/`
2. Add metadata to `next-app/public/config/articles.json`:

```json
{
  "title": "Article Title",
  "summary": "Brief description",
  "markdown": "/blog-posts/article.md",
  "image": "/images/blog/article.jpg",
  "objectPosition": "center 50%",
  "tags": ["Tag1", "Tag2"]
}
```

### GitHub API Rate Limits (Optional)

Repository and commit data is fetched anonymously (60 requests/hour). To raise the limit to 5,000/hour, provide a token:

```bash
cd next-app
echo "GITHUB_TOKEN=your-token-here" > .env.local
```

## Deployment

The site deploys to **Cloudflare Workers** via the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare).

### GitHub Actions (automatic)

`.github/workflows/deploy.yaml`:
- **Push to `main`** → production deploy to `dbrandao.com` + smoke test
- **Pull requests** → preview version with its own shareable URL (production untouched)

Requires two repository secrets: `CLOUDFLARE_API_TOKEN` (the "Edit Cloudflare Workers" token template) and `CLOUDFLARE_ACCOUNT_ID`.

### Manual deploy

```bash
cd next-app
npx wrangler login        # once
npm run deploy            # opennextjs-cloudflare build && deploy
```

### Local Workers runtime

Test the production build in workerd locally (no deploy):

```bash
cd next-app
npm run preview
```

### One-time account setup

1. KV namespace `personal-website-inc-cache` backs the incremental cache (5-minute GitHub data revalidation); its id is bound in `wrangler.jsonc`
2. `npx wrangler secret put GITHUB_TOKEN` — raises the GitHub API limit for the Worker
3. The Worker owns the `dbrandao.com` and `www.dbrandao.com` custom domains (www 301s to the apex). The former Zero Trust tunnel DNS record was removed at cutover.

### Docker (local testing only)

```bash
docker build -t personal-website .
docker run -d -p 3100:3000 personal-website
```

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please make sure your code:
- Passes linting (`npm run lint` in `next-app/`)
- Builds successfully (`npm run build` in `next-app/`)
- Follows the existing code style

## Reporting Issues

Found a bug or have a feature request? [Open an issue](https://github.com/ds-brandao/personalWebsite/issues/new) with a clear description and steps to reproduce.

## License

This project is licensed under the [MIT License](LICENSE).
