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
- **AI Project Analyses** — Pre-generated project insights using OpenAI
- **Responsive Design** — Mobile-first layout with adaptive grid system
- **Docker Development** — Containerized development and production environments

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS with custom theme |
| **Animations** | Motion (Framer Motion) |
| **Markdown** | react-markdown with GitHub Flavored Markdown |
| **AI** | ai SDK + OpenAI (build-time only, via seed script) |
| **Build** | Turbopack (dev), Next.js standalone (production) |
| **Container** | Docker with multi-stage builds |

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
│   │   └── page.tsx            # Server component (data fetching)
│   ├── components/             # React components
│   │   ├── PageClient.tsx      # Main client layout
│   │   ├── ArticleCard.tsx     # Blog post cards
│   │   ├── Projects.tsx        # Project carousel
│   │   ├── ProjectDetail.tsx   # AI analysis + commits display
│   │   └── ai-elements/       # AI-generated UI components
│   ├── ai/
│   │   └── tools.ts            # AI tool definitions for analysis
│   ├── lib/
│   │   └── data.ts             # Server-side data fetching
│   ├── scripts/
│   │   └── seed-analyses.ts    # Pre-generate AI project analyses
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── public/
│   │   ├── config/             # Configuration files
│   │   │   ├── config.json     # Personal info & tags
│   │   │   ├── articles.json   # Blog post metadata
│   │   │   └── analyses.json   # Pre-generated AI analyses
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
    "name": "Your Name",
    "college": { "name": "University", "url": "https://..." },
    "favoriteRestaurant": { "name": "Restaurant", "url": "https://..." }
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

### AI Project Analyses (Optional)

To generate AI-powered project analyses, set your OpenAI API key and run the seed script:

```bash
cd next-app
echo "OPENAI_API_KEY=your-key-here" > .env.local
npm run seed
```

## Deployment

### Docker / Container Platform

```bash
docker build -t personal-website .
docker run -d -p 80:80 personal-website
```

### GitHub Actions

The included workflow (`.github/workflows/deploy.yml`) automatically builds and deploys on push to `main`.

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
