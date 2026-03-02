"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Mail, Linkedin, Github } from "lucide-react";
import { Config } from "@/types";

export function Hero({ config }: { config: Config }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const letterSpacing = useTransform(scrollYProgress, [0, 0.5], ["0em", "0.4em"]);
  const subtitleOpacity = useTransform(scrollYProgress, [0.15, 0.4], [0, 1]);
  const subtitleY = useTransform(scrollYProgress, [0.15, 0.4], [40, 0]);
  const socialsOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);
  const socialsY = useTransform(scrollYProgress, [0.3, 0.5], [30, 0]);
  const exitOpacity = useTransform(scrollYProgress, [0.6, 1], [1, 0]);
  const exitY = useTransform(scrollYProgress, [0.6, 1], [0, -120]);

  return (
    <div ref={containerRef} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <motion.div style={{ opacity: exitOpacity, y: exitY }} className="flex flex-col items-center">
          <motion.h1
            style={{ letterSpacing }}
            className="font-display text-[clamp(3rem,15vw,12rem)] font-black leading-[0.9] tracking-tight text-foreground whitespace-nowrap"
          >
            {config.personal.name}
          </motion.h1>

          <motion.p
            style={{ opacity: subtitleOpacity, y: subtitleY }}
            className="mt-6 text-lg md:text-2xl text-muted-foreground font-sans"
          >
            Software Engineer
          </motion.p>

          <motion.div
            style={{ opacity: socialsOpacity, y: socialsY }}
            className="flex items-center gap-4 mt-10"
          >
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
                className="p-3 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
