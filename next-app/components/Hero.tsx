"use client";

import { motion } from "motion/react";
import { Mail, Linkedin, Github } from "lucide-react";
import { Config } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

export function Hero({ config }: { config: Config }) {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <motion.h1
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="font-display text-[clamp(3rem,10vw,7rem)] font-black leading-[0.95] tracking-tight text-foreground"
      >
        {config.personal.name}
      </motion.h1>

      <motion.p
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-4 text-lg md:text-xl text-muted-foreground font-sans"
      >
        Software Engineer
      </motion.p>

      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex items-center gap-4 mt-8"
      >
        <a
          href={`mailto:${config.social.email}`}
          aria-label="Email"
          className="p-3 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        >
          <Mail className="w-5 h-5" />
        </a>
        <a
          href={config.social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="p-3 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        >
          <Linkedin className="w-5 h-5" />
        </a>
        <a
          href={config.social.github.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="p-3 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        >
          <Github className="w-5 h-5" />
        </a>
      </motion.div>

      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="absolute bottom-10"
      >
        <button
          onClick={() =>
            document.querySelector("#articles")?.scrollIntoView({ behavior: "smooth" })
          }
          aria-label="Scroll down"
          className="text-muted-foreground hover:text-foreground transition-colors animate-float"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      </motion.div>
    </section>
  );
}
