import { Mail, Linkedin, Github } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Config } from "@/types";

export function Footer({ config }: { config: Config }) {
  return (
    <footer className="max-w-6xl mx-auto px-6 pb-12">
      <Separator className="mb-8" />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} {config.personal.name}</span>
        <div className="flex items-center gap-4">
          <a
            href={`mailto:${config.social.email}`}
            aria-label="Email"
            className="hover:text-foreground transition-colors"
          >
            <Mail className="w-4 h-4" />
          </a>
          <a
            href={config.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-foreground transition-colors"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a
            href={config.social.github.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
