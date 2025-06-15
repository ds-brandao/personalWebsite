# Daniel Brandao's Personal Website

A modern, responsive personal website featuring a dynamic typing animation and blog system. Built as a single-page application with Docker containerization for easy development and deployment.

## 🌟 Features

- **Dynamic Typing Animation**: Hero section with rotating phrases including "I'm Daniel Brandao", "I code security solutions", "I build secure systems", and "I break things to fix them"
- **Blog System**: Markdown-based articles with tag filtering and modal reading experience
- **GitHub Integration**: Automatically fetches and displays GitHub repositories
- **Responsive Design**: Mobile-first CSS Grid layout with asymmetrical panel design
- **Tag-based Filtering**: Organized content filtering system with predefined categories
- **Docker Development**: Containerized development environment with live reloading

## 🏗️ Architecture

This website is built as a static single-page application with the following architecture:

### Core Components

- **`index.html`**: Main application file containing all HTML, CSS, and JavaScript
- **`config/config.json`**: Configuration file for personal information, social links, and tag definitions
- **`config/articles.json`**: Blog post metadata including titles, summaries, file paths, and tags
- **`blog-posts/`**: Directory containing Markdown blog post files
- **`images/`**: Static image assets for the website and blog posts
- **`nginx.conf`**: Web server configuration with CORS headers and GitHub API proxy
- **`Dockerfile` & `docker-compose.yaml`**: Container configuration for development

### Layout Structure

The website uses a CSS Grid layout with the following areas:
- **Articles Panel**: Left column displaying blog posts with filtering
- **About Panel**: Center-top section with personal information
- **Contact Panel**: Center-bottom section with social links
- **Projects Panel**: Right column showing GitHub repositories
- **Typing Animation**: Center section with rotating text phrases

## 📝 How Articles Are Written and Managed

### Writing Articles

1. **Create Markdown File**: Write your article in Markdown format and save it in the `blog-posts/` directory
   ```markdown
   # Article Title
   
   Your article content goes here...
   ```

2. **Add Article Metadata**: Update `config/articles.json` with your article information:
   ```json
   {
     "title": "Your Article Title",
     "summary": "Brief description of the article",
     "markdown": "/blog-posts/your-article.md",
     "image": "/images/blog/your-image.jpg",
     "objectPosition": "center 50%",
     "tags": ["Tag1", "Tag2"]
   }
   ```

### Article Configuration

- **`title`**: Display name for the article
- **`summary`**: Brief description shown in the article list
- **`markdown`**: Path to the Markdown file (relative to the website root)
- **`image`**: Path to the hero image for the article
- **`objectPosition`**: CSS object-position for image cropping (e.g., "center 75%")
- **`tags`**: Array of predefined tags for categorization

### Adding Images

Place article images in the `images/blog/` directory and reference them in the article metadata. The `objectPosition` property allows you to control how images are cropped and displayed.

## 🏷️ Tag System

Tags are predefined in `config/config.json` and provide categorization and filtering for articles.

### Tag Configuration

Each tag includes:
- **`color`**: CSS class name for styling
- **`description`**: Tooltip text explaining the tag's purpose

### Available Tags

The current tag system includes:
- **Security**: Cybersecurity and privacy topics
- **Coding**: Programming and software development
- **AI**: Artificial intelligence and machine learning
- **Tutorial**: Step-by-step guides and how-to content
- **Project**: Personal and professional projects
- **Intro**: Blog introductions and personal journey
- **CI/CD**: Continuous Integration/Continuous Deployment
- **Home Lab**: Home lab setup and experiments
- **Systems Integration**: Integration and automation topics
- **Life**: Personal reflections and experiences

### Adding New Tags

1. Add the tag definition to `config/config.json`:
   ```json
   "YourTag": {
     "color": "your-color-class",
     "description": "Description of what this tag represents"
   }
   ```

2. Add corresponding CSS styling for the color class in `index.html`

## 📊 Article Order

Articles are displayed in the order they appear in the `config/articles.json` array. The most recent or featured articles should be placed at the beginning of the array for prominence.

To reorder articles:
1. Open `config/articles.json`
2. Rearrange the article objects in your desired display order
3. Save the file - changes will be reflected immediately

## 🔗 Public Links and Social Media

### GitHub Repository
- **Repository**: [ds-brandao/mywebsite2](https://github.com/ds-brandao/mywebsite2)
- **GitHub Profile**: [ds-brandao](https://github.com/ds-brandao)

### Social Links
- **LinkedIn**: [Daniel Brandao](https://www.linkedin.com/in/dsbrandao/)
- **Email**: lounges.upstage_0y@icloud.com

These links are configured in `config/config.json` under the `social` section and are automatically integrated throughout the website.

## 🚀 Development Setup

### Prerequisites
- Docker and Docker Compose installed on your system

### Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ds-brandao/mywebsite2.git
   cd mywebsite2
   ```

2. **Start the development environment**:
   ```bash
   docker compose up --build
   ```

3. **Access the website**:
   - Website: http://localhost:3000
   - Direct Nginx: http://localhost (port 80)

### Development Features

- **Live Reloading**: Browser-sync automatically refreshes the page when files change
- **CORS Proxy**: Nginx proxies GitHub API calls to avoid CORS issues
- **Hot Reload**: Changes to HTML, CSS, JavaScript, JSON, and Markdown files trigger automatic reload

### File Structure
```
mywebsite2/
├── index.html              # Main application file
├── config/
│   ├── config.json         # Personal info and tags
│   └── articles.json       # Blog post metadata
├── blog-posts/             # Markdown blog posts
├── images/                 # Static image assets
├── nginx.conf              # Web server configuration
├── Dockerfile              # Container configuration
├── docker-compose.yaml     # Development environment
└── README.md               # This file
```

## 🛠️ Customization

### Personal Information

Update `config/config.json` with your personal details:
- Name and title
- College/education information
- Social media links
- Contact information

### Typing Animation

Modify the phrases in the typing animation by editing the `phrases` array in `index.html`:
```javascript
const phrases = ["I'm Your Name", "Your phrase here", "Another phrase", "Final phrase"];
```

### Styling

The website uses CSS custom properties (variables) for theming. Modify the `:root` section in `index.html` to change colors, fonts, and spacing.

## 📦 Deployment

This website can be deployed to any static hosting service or container platform:

1. **Static Hosting** (Netlify, Vercel, GitHub Pages):
   - Build: No build step required
   - Publish directory: `/` (root)

2. **Container Platform** (Docker, Kubernetes):
   - Use the provided Dockerfile
   - Expose port 80
   - Mount volumes for dynamic content updates

## 🤝 Contributing

This is a personal website template. Feel free to fork and adapt it for your own use. Key areas for enhancement:
- Additional tag categories
- Theme customization
- Mobile responsiveness improvements
- Performance optimizations

## 📄 License

This project is open source and available for personal and educational use.
