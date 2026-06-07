import { Github, Linkedin, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialIconsProps {
  github: string;
  linkedin: string;
  email?: string;
  size?: "default" | "sm";
}

export function SocialIcons({ github, linkedin, email, size = "default" }: SocialIconsProps) {
  const socials = [
    { href: github, icon: Github, label: "GitHub", external: true },
    { href: linkedin, icon: Linkedin, label: "LinkedIn", external: true },
    ...(email
      ? [{ href: `mailto:${email}`, icon: Mail, label: "Email", external: false }]
      : []),
  ];

  return (
    <div className="flex gap-2">
      {socials.map(({ href, icon: Icon, label, external }) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className={cn(
            "grid place-items-center rounded-[11px] border border-border bg-card text-muted-foreground transition-all duration-350 ease-snap hover:-translate-y-0.75 hover:border-primary-line hover:text-primary hover:shadow-[var(--shadow-lift)]",
            size === "sm" ? "size-8.5" : "size-10"
          )}
        >
          <Icon className={size === "sm" ? "size-4" : "size-4.5"} strokeWidth={1.7} />
        </a>
      ))}
    </div>
  );
}
