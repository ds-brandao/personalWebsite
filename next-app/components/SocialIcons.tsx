"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SocialIconsProps {
  github: string;
  linkedin: string;
  email: string;
}

const socials = [
  { key: "github", icon: Github, label: "GitHub" },
  { key: "linkedin", icon: Linkedin, label: "LinkedIn" },
  { key: "email", icon: Mail, label: "Email" },
] as const;

export function SocialIcons({ github, linkedin, email }: SocialIconsProps) {
  const urls: Record<string, string> = {
    github,
    linkedin,
    email: `mailto:${email}`,
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 mt-3">
        {socials.map(({ key, icon: Icon, label }) => (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:text-primary"
                asChild
              >
                <a
                  href={urls[key]}
                  target={key === "email" ? undefined : "_blank"}
                  rel={key === "email" ? undefined : "noopener noreferrer"}
                >
                  <Icon className="size-5" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
