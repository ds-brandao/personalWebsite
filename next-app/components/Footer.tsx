import { Config } from "@/types";
import { Mail, Linkedin, Github } from "lucide-react";

interface FooterProps {
  config: Config;
}

export function Footer({ config }: FooterProps) {
  const { social } = config;

  return (
    <footer className="border-t border-surface-3/30 py-8 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-text-muted text-sm">
          &copy; {new Date().getFullYear()} {config.personal.name}
        </p>
        <div className="flex gap-4">
          <a
            href={`mailto:${social.email}`}
            className="text-text-muted hover:text-ember transition-colors"
            aria-label="Email"
          >
            <Mail size={16} />
          </a>
          <a
            href={social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-ember transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin size={16} />
          </a>
          <a
            href={social.github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-ember transition-colors"
            aria-label="GitHub"
          >
            <Github size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
}
