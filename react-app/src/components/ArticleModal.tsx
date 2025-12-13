import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import mermaid from 'mermaid';
import type { Article } from '../types';

// Initialize mermaid with base theme and custom CSS for black text
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    darkMode: false,
    background: '#ffffff',
    primaryColor: '#ffffff',
    primaryTextColor: '#000000',
    primaryBorderColor: '#374151',
    lineColor: '#374151',
    secondaryColor: '#f3f4f6',
    tertiaryColor: '#e5e7eb',
    nodeTextColor: '#000000',
    textColor: '#000000',
    mainBkg: '#ffffff',
    nodeBorder: '#374151',
    clusterBkg: '#f9fafb',
    clusterBorder: '#9ca3af',
    edgeLabelBackground: '#ffffff',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
  },
  themeCSS: `
    * { color: #000000 !important; }
    text, tspan, span { fill: #000000 !important; color: #000000 !important; }
    .nodeLabel, .edgeLabel, .label { color: #000000 !important; fill: #000000 !important; }
    .node rect, .node polygon { fill: #ffffff !important; stroke: #374151 !important; }
    .cluster rect { fill: #f3f4f6 !important; stroke: #9ca3af !important; }
    .edgePath path { stroke: #374151 !important; }
    foreignObject div { color: #000000 !important; }
  `,
});

// Counter for unique mermaid diagram IDs
let mermaidIdCounter = 0;

function generateMermaidId(): string {
  mermaidIdCounter += 1;
  return `mermaid-${mermaidIdCounter}-${Date.now()}`;
}

interface ArticleModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

function getTagClass(tag: string): string {
  const normalizedTag = tag.toLowerCase().replace(/[\/\s]/g, '-');
  const tagClasses: Record<string, string> = {
    'security': 'tag-security',
    'coding': 'tag-coding',
    'ai': 'tag-ai',
    'tutorial': 'tag-tutorial',
    'project': 'tag-project',
    'intro': 'tag-intro',
    'ci-cd': 'tag-ci\\/cd',
    'home-lab': 'tag-home-lab',
    'systems-integration': 'tag-systems-integration',
    'life': 'tag-life',
    'celery': 'tag-celery',
  };
  return tagClasses[normalizedTag] || 'tag-intro';
}

interface MermaidDiagramProps {
  code: string;
}

const MermaidDiagram = ({ code }: MermaidDiagramProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef<string>(generateMermaidId());

  useEffect(() => {
    let isCancelled = false;
    
    const processsvgForBlackText = (svgString: string): string => {
      // Create a temporary container to parse the SVG
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, 'image/svg+xml');
      const svg = doc.querySelector('svg');
      
      if (!svg) return svgString;
      
      // Force black text on all text elements
      svg.querySelectorAll('text, tspan').forEach((el) => {
        el.setAttribute('fill', '#000000');
        el.removeAttribute('style');
      });
      
      // Force black text on foreignObject content (used by mermaid for labels)
      svg.querySelectorAll('foreignObject *').forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.color = '#000000';
        }
      });
      
      // Style spans inside foreignObject
      svg.querySelectorAll('foreignObject span, foreignObject div, foreignObject p').forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.color = '#000000';
        }
      });
      
      // Serialize back to string
      const serializer = new XMLSerializer();
      return serializer.serializeToString(svg);
    };
    
    const renderDiagram = async () => {
      if (!code) return;
      
      // Generate a fresh ID for each render attempt
      const currentId = generateMermaidId();
      idRef.current = currentId;
      
      try {
        const { svg } = await mermaid.render(currentId, code);
        
        if (!isCancelled) {
          // Post-process SVG to ensure black text
          const processedSvg = processsvgForBlackText(svg);
          setSvgContent(processedSvg);
          setError(null);
        }
        
        // Clean up the temporary element mermaid creates
        const tempElement = document.getElementById(currentId);
        if (tempElement) {
          tempElement.remove();
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Mermaid render error:', err);
          setError('Failed to render diagram');
          setSvgContent('');
        }
      }
    };

    renderDiagram();
    
    return () => {
      isCancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <div className="my-8 p-6 rounded-xl border border-red-500/30 bg-red-500/10">
        <p className="text-red-400 text-sm mb-2">Diagram rendering failed</p>
        <pre className="text-xs text-gray-400 overflow-x-auto">{code}</pre>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div className="my-8 p-6 rounded-xl border border-white/10 bg-[#1a1a1a]/50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="relative group my-8">
        <div 
          className="mermaid-rendered overflow-x-auto bg-white p-6 rounded-xl border border-gray-200 flex justify-center"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white/70 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm border border-white/10"
          title="Expand diagram"
        >
          <FiMaximize2 className="w-5 h-5" />
        </button>
      </div>

      {createPortal(
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8"
              onClick={() => setIsExpanded(false)}
            >
              <div className="relative w-full h-full flex items-center justify-center overflow-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[10000]"
                >
                  <FiMinimize2 className="w-6 h-6" />
                </button>
                
                <div 
                  className="mermaid-lightbox flex items-center justify-center [&>svg]:max-w-[95vw] [&>svg]:max-h-[90vh] [&>svg]:w-auto [&>svg]:h-auto"
                  onClick={e => e.stopPropagation()}
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default function ArticleModal({ article, isOpen, onClose }: ArticleModalProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (article?.markdown && isOpen) {
      setLoading(true);
      setImageLoaded(false);
      fetch(article.markdown)
        .then(res => res.text())
        .then(text => {
          setContent(text);
          setLoading(false);
        })
        .catch(() => {
          setContent('Failed to load article content.');
          setLoading(false);
        });
    }
  }, [article, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);


  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && article && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md overflow-y-auto py-8 px-4 md:px-8"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className="relative w-full max-w-[95vw] xl:max-w-[1400px] bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/5 flex flex-col max-h-[95vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="fixed top-4 right-4 md:top-8 md:right-8 z-50 p-3 bg-[#252525]/80 backdrop-blur-md border border-white/15 rounded-full text-text-primary hover:bg-accent/20 hover:border-accent/40 transition-all shadow-lg group"
              aria-label="Close modal"
            >
              <FiX className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Scrollable Container */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {/* Hero Image with Progressive Loading */}
              {article.image && (
                <div className="relative h-[400px] md:h-[500px] w-full shrink-0">
                  {/* Thumbnail placeholder (blurred, shown immediately) */}
                  {article.thumbnail && !imageLoaded && (
                    <img
                      src={article.thumbnail}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-sm scale-105"
                      style={{ objectPosition: article.objectPosition || 'center 35%' }}
                    />
                  )}
                  {/* Full quality image (loads in background, fades in when ready) */}
                  <img
                    src={article.image}
                    alt={article.title}
                    onLoad={() => setImageLoaded(true)}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ objectPosition: article.objectPosition || 'center 35%' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/60 to-transparent" />
                  
                  {/* Hero Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 z-10 max-w-7xl mx-auto w-full">
                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {article.tags.map(tag => (
                          <span key={tag} className={`tag-base ${getTagClass(tag)} backdrop-blur-md bg-black/30 text-sm py-1.5 px-4`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg tracking-tight">
                      {article.title}
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-gray-200 max-w-3xl drop-shadow-md leading-relaxed font-light">
                      {article.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6 md:p-12 lg:p-16 w-full bg-[#1a1a1a] min-h-[50vh]">
                {loading ? (
                  <div className="flex items-center justify-center py-24">
                    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                <article className="markdown-content-reader w-full mx-auto">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
                    components={{
                      // Custom rendering for code blocks
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        let isMermaid = match && match[1] === 'mermaid';

                        // Fallback detection for mermaid diagrams
                        if (!isMermaid) {
                          const content = String(children).trim();
                          if (
                            content.startsWith('flowchart') ||
                            content.startsWith('sequenceDiagram') ||
                            content.startsWith('classDiagram') ||
                            content.startsWith('erDiagram') ||
                            content.startsWith('gantt') ||
                            content.startsWith('pie') ||
                            content.startsWith('gitGraph')
                          ) {
                            isMermaid = true;
                          }
                        }

                        if (isMermaid) {
                          return (
                            <MermaidDiagram code={String(children).replace(/\n$/, '')} />
                          );
                        }

                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                        // Custom link rendering
                      a({ href, children }) {
                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-accent-light underline underline-offset-2 transition-colors"
                          >
                            {children}
                          </a>
                        );
                      },
                      // Custom image rendering
                      img({ src, alt }) {
                        return (
                          <img
                            src={src}
                            alt={alt || ''}
                            loading="lazy"
                            className="rounded-xl my-8 max-w-full shadow-lg border border-white/5"
                          />
                        );
                      },
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </article>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
