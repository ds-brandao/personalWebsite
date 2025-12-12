# Personal Website

A modern, responsive personal portfolio website built with **React**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

## Features

- **Modern React Architecture**: Component-based design with TypeScript for type safety
- **Tailwind CSS**: Utility-first styling with custom dark theme
- **Framer Motion Animations**: Smooth, performant animations throughout
- **Dynamic Typing Animation**: Hero section with rotating phrases
- **Blog System**: Markdown-based articles with tag filtering and modal reading
- **GitHub Integration**: Automatically fetches and displays GitHub repositories
- **Responsive Design**: Mobile-first layout with adaptive grid system
- **Docker Development**: Containerized development and production environments

## Tech Stack

- **Frontend**: React 18+, TypeScript, Vite
- **Styling**: Tailwind CSS with custom theme
- **Animations**: Framer Motion
- **Markdown**: react-markdown with GitHub Flavored Markdown
- **Icons**: react-icons (Feather Icons)
- **Build**: Vite, PostCSS
- **Server**: Nginx (production)
- **Container**: Docker with multi-stage builds

## Project Structure

```
├── react-app/                  # React application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Hero.tsx        # Typing animation hero section
│   │   │   ├── About.tsx       # About me section
│   │   │   ├── Articles.tsx    # Blog posts with filtering
│   │   │   ├── Projects.tsx    # GitHub repositories
│   │   │   ├── Contact.tsx     # Contact information
│   │   │   ├── Footer.tsx      # Footer with social links
│   │   │   └── ArticleModal.tsx # Full article reader
│   │   ├── hooks/              # Custom React hooks
│   │   │   └── useConfig.ts    # Data fetching hooks
│   │   ├── types/              # TypeScript type definitions
│   │   ├── App.tsx             # Main application component
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Global styles & Tailwind
│   ├── public/
│   │   ├── config/             # Configuration files
│   │   │   ├── config.json     # Personal info & tags
│   │   │   └── articles.json   # Blog post metadata
│   │   ├── blog-posts/         # Markdown blog posts
│   │   └── images/             # Static images
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── Dockerfile                  # Multi-stage Docker build
├── docker-compose.yaml         # Development environment
├── nginx.conf                  # Production server config
└── README.md
```

## Development Setup

### Prerequisites
- Node.js 18+ (for local development)
- Docker and Docker Compose (for containerized development)

### Local Development

1. **Clone and install**:
   ```bash
   git clone https://github.com/ds-brandao/personalWebsite.git
   cd personalWebsite/react-app
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access the website**: http://localhost:5173

### Docker Development

1. **Start with Docker Compose**:
   ```bash
   docker compose up dev
   ```

2. **Access the website**: http://localhost:5173

### Production Build

```bash
cd react-app
npm run build
```

Or with Docker:
```bash
docker build -t personal-website .
docker run -p 80:80 personal-website
```

## Configuration

### Personal Information

Update `react-app/public/config/config.json`:

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

1. **Create Markdown file** in `react-app/public/blog-posts/`:
   ```markdown
   # Article Title

   Your content here...
   ```

2. **Add metadata** to `react-app/public/config/articles.json`:
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

### Available Tags

| Tag | Color | Description |
|-----|-------|-------------|
| Security | Rose | Cybersecurity topics |
| Coding | Emerald | Programming |
| AI | Cyan | Artificial intelligence |
| Tutorial | Amber | How-to guides |
| Project | Purple | Projects |
| CI/CD | Blue | DevOps |
| Home Lab | Orange | Home lab |
| Systems Integration | Indigo | Integration |
| Life | Pink | Personal |

### Customizing the Hero

Edit `react-app/src/components/Hero.tsx`:
```typescript
const phrases = [
  "I'm Your Name",
  "I build amazing things",
  "I solve problems",
];
```

### Styling

The website uses Tailwind CSS with custom colors defined in `tailwind.config.js`:

```javascript
colors: {
  'bg': '#0a0a0a',
  'surface-1': '#141414',
  'accent': '#6366f1',
  // ...
}
```

## Deployment

### Static Hosting (Vercel, Netlify)

1. Connect your repository
2. Set build command: `cd react-app && npm install && npm run build`
3. Set publish directory: `react-app/dist`

### Docker/Container Platform

```bash
docker build -t personal-website .
docker run -d -p 80:80 personal-website
```

### GitHub Actions

The included workflow automatically builds and deploys on push to `main`.

## License

Open source for personal and educational use.
