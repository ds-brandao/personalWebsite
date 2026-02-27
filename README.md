# Personal Website

A modern, responsive personal portfolio website built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Motion**.

## Features

- **Next.js Server-Side Rendering**: Fast initial page loads with server-side data fetching
- **Tailwind CSS**: Utility-first styling with custom dark theme
- **Motion Animations**: Smooth, performant animations throughout
- **Blog System**: Markdown-based articles with tag filtering and modal reading
- **GitHub Integration**: Automatically fetches and displays GitHub repositories
- **AI Project Analyses**: Pre-generated project insights using OpenAI
- **Responsive Design**: Mobile-first layout with adaptive grid system
- **Docker Development**: Containerized development and production environments

## Tech Stack

- **Framework**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS with custom theme
- **Animations**: Motion (Framer Motion)
- **Markdown**: react-markdown with GitHub Flavored Markdown
- **AI**: ai SDK + OpenAI (build-time only, via seed script)
- **Build**: Turbopack (dev), Next.js standalone (production)
- **Container**: Docker with multi-stage builds

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

## Development Setup

### Prerequisites
- Node.js 20+ (for local development)
- Docker and Docker Compose (for containerized development)

### Local Development

1. **Clone and install**:
   ```bash
   git clone https://github.com/ds-brandao/personalWebsite.git
   cd personalWebsite/next-app
   npm install
   ```

2. **Set up environment**:
   ```bash
   # Create .env.local with your OpenAI API key (needed for seed script only)
   echo "OPENAI_API_KEY=your-key-here" > .env.local
   ```

3. **Generate AI analyses** (optional):
   ```bash
   npm run seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Access the website**: http://localhost:3000

### Docker Development

1. **Start with Docker Compose**:
   ```bash
   docker compose up dev
   ```

2. **Access the website**: http://localhost:3000

### Production Build

```bash
cd next-app
npm run build
npm run start
```

Or with Docker:
```bash
docker build -t personal-website .
docker run -p 80:80 personal-website
```

## Configuration

### Personal Information

Update `next-app/public/config/config.json`:

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

1. **Create Markdown file** in `next-app/public/blog-posts/`:
   ```markdown
   # Article Title

   Your content here...
   ```

2. **Add metadata** to `next-app/public/config/articles.json`:
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

## Deployment

### Docker/Container Platform

```bash
docker build -t personal-website .
docker run -d -p 80:80 personal-website
```

### GitHub Actions

The included workflow automatically builds and deploys on push to `main`.

## License

Open source for personal and educational use.
