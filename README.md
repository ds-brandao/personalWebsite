# Portfolio Template

A modern, responsive developer portfolio and blog template built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**.

## Features

- **Blog System** — Markdown-based articles with tag filtering, carousel, and full-page reader
- **GitHub Integration** — Automatically fetches and displays your public repositories and recent commits
- **AI Project Analyses** — Optional pre-generated project insights using OpenAI
- **Dark / Light Theme** — Toggle between themes with smooth transitions
- **Responsive Design** — Mobile-first layout with adaptive navigation (bottom tab bar on mobile, top nav on desktop)
- **Featured Section** — Showcase press mentions or external links
- **Docker Ready** — Containerized development and production environments
- **Interactive Setup** — CLI script to configure your site in seconds

## Quick Start

1. **Download** the latest release from the [Releases page](../../releases)

2. **Extract and install**:
   ```bash
   cd portfolio-template/next-app
   npm install
   ```

3. **Run the setup wizard**:
   ```bash
   npm run setup
   ```
   This will prompt you for your name, GitHub username, social links, and more.

4. **Start the dev server**:
   ```bash
   npm run dev
   ```

5. **Open** http://localhost:3000

## Configuration

All site configuration lives in `next-app/public/config/config.json`. You can edit it manually or re-run `npm run setup`.

```json
{
  "site": {
    "title": "My Portfolio",
    "description": "Developer portfolio and blog built with Next.js"
  },
  "personal": {
    "name": "Your Name",
    "title": "Software Engineer",
    "college": { "name": "University", "url": "https://..." },
    "favoriteRestaurant": { "name": "Restaurant", "url": "https://..." }
  },
  "social": {
    "github": {
      "username": "your-username",
      "url": "https://github.com/your-username",
      "hiddenRepos": []
    },
    "email": "you@example.com",
    "linkedin": "https://linkedin.com/in/your-profile"
  },
  "tags": { ... },
  "featured": []
}
```

### Adding Blog Posts

1. Create a markdown file in `next-app/public/blog-posts/`:
   ```markdown
   # My Article Title

   Your content here...
   ```

2. Add an image to `next-app/public/images/blog/`

3. Add metadata to `next-app/public/config/articles.json`:
   ```json
   {
     "title": "My Article Title",
     "summary": "Brief description of the article",
     "markdown": "/blog-posts/my-article.md",
     "image": "/images/blog/my-image.jpg",
     "objectPosition": "center 50%",
     "tags": ["General"],
     "date": "2026-01-15"
   }
   ```

### Adding Featured Items

Add entries to the `featured` array in `config.json`:
```json
{
  "title": "Featured In Example Publication",
  "source": "Publication Name",
  "url": "https://example.com/article",
  "date": "2026-01-01"
}
```

### Hiding GitHub Repos

Add repo names to `social.github.hiddenRepos` in `config.json`:
```json
"hiddenRepos": ["private-repo", "old-project"]
```

## AI Project Analyses (Optional)

Generate AI-powered insights for your GitHub projects:

1. Create `next-app/.env.local`:
   ```
   OPENAI_API_KEY=your-key-here
   ```

2. Run the seed script:
   ```bash
   npm run seed
   ```

This creates `analyses.json` with rich project overviews displayed on the Projects page.

## Theming

The color theme is defined via CSS custom properties in `next-app/app/globals.css`. Edit the `:root` (light) and `.dark` (dark) sections to customize colors.

Key variables:
- `--primary` — Accent color (links, buttons, highlights)
- `--background` / `--foreground` — Base colors
- `--card` / `--card-foreground` — Card component colors
- `--muted` / `--muted-foreground` — Subdued text and backgrounds

## Deployment

### Docker (Recommended)

**Development:**
```bash
docker compose up dev
```

**Production:**
```bash
docker build -t my-portfolio .
docker run -d -p 80:3000 my-portfolio
```

### Standalone

```bash
cd next-app
npm run build
npm run start
```

## Project Structure

```
├── next-app/                     # Next.js application
│   ├── app/
│   │   ├── layout.tsx            # Root layout (dynamic metadata)
│   │   ├── globals.css           # Theme colors and typography
│   │   └── (tabs)/
│   │       ├── page.tsx          # Home page
│   │       ├── articles/         # Blog pages
│   │       └── projects/         # Projects page
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   └── ai-elements/         # AI analysis display components
│   ├── lib/
│   │   └── data.ts              # Server-side data fetching
│   ├── scripts/
│   │   ├── setup.ts             # Interactive setup wizard
│   │   └── seed-analyses.ts     # AI project analysis generator
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   └── public/
│       ├── config/              # Configuration files
│       │   ├── config.json      # Site & personal config
│       │   ├── articles.json    # Blog post metadata
│       │   └── analyses.json    # AI analyses (generated)
│       ├── blog-posts/          # Markdown blog posts
│       └── images/blog/         # Article images
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yaml          # Dev & production environments
└── .github/workflows/
    └── release.yaml             # Automated GitHub releases
```

## Tech Stack

- **Framework**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Animations**: Motion (Framer Motion)
- **Markdown**: react-markdown + GitHub Flavored Markdown
- **AI**: ai SDK + OpenAI (build-time only)
- **Container**: Docker with multi-stage builds

## License

Open source for personal and educational use.
