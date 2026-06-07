# Personal Website

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy Website](https://github.com/ds-brandao/personalWebsite/actions/workflows/deploy.yml/badge.svg)](https://github.com/ds-brandao/personalWebsite/actions/workflows/deploy.yml)

A modern, responsive personal portfolio website built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Motion**. Fork it, customize it, and make it your own.

## Features

- **Next.js Server-Side Rendering** — Fast initial page loads with server-side data fetching
- **Tailwind CSS** — Utility-first styling with custom dark theme
- **Motion Animations** — Smooth, performant animations throughout
- **Blog System** — Markdown-based articles with tag filtering and modal reading
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
│   │   └── data.ts             # Server-side data fetching
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

1. `npx wrangler r2 bucket create personal-website-inc-cache` — backs the incremental cache (5-minute GitHub data revalidation)
2. `npx wrangler secret put GITHUB_TOKEN` — raises the GitHub API limit for the Worker
3. Remove the old Zero Trust tunnel public hostname for `dbrandao.com` (the Worker's custom domain can't attach while the tunnel's DNS record exists)

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
