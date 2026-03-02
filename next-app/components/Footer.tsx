"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Mail, Linkedin, Github } from "lucide-react";
import { Config } from "@/types";

export function Footer({ config }: { config: Config }) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.3"],
  });

  const bgOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const contentOpacity = useTransform(scrollYProgress, [0.3, 0.8], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.3, 0.8], [40, 0]);

  return (
    <footer ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Dark overlay that fades in */}
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 bg-claude-noir"
      />

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 flex flex-col items-center text-center gap-8"
      >
        <h2 className="font-display text-4xl md:text-6xl font-bold text-claude-taupe">
          {config.personal.name}
        </h2>

        <div className="flex items-center gap-6">
          {[
            { href: `mailto:${config.social.email}`, label: "Email", Icon: Mail },
            { href: config.social.linkedin, label: "LinkedIn", Icon: Linkedin },
            { href: config.social.github.url, label: "GitHub", Icon: Github },
          ].map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              aria-label={label}
              className="p-3 rounded-full border border-claude-muted-brown text-claude-taupe hover:text-claude-rust hover:border-claude-rust transition-colors"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>

        <span className="text-sm text-claude-muted-brown">
          &copy; {new Date().getFullYear()} {config.personal.name}
        </span>
      </motion.div>
    </footer>
  );
}
