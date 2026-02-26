"use client";

import { motion } from "motion/react";
import { Config } from "@/types";
import { Mail, Linkedin, Github, ChevronDown } from "lucide-react";

interface HeroProps {
  config: Config;
}

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function Hero({ config }: HeroProps) {
  const { personal, social } = config;

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-6"
      >
        <motion.h1
          variants={fadeUp}
          className="font-display font-bold gradient-text text-[clamp(3rem,10vw,10rem)] leading-none"
        >
          {personal.name}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-text-secondary text-xl md:text-2xl font-sans"
        >
          Software Engineer
        </motion.p>

        <motion.div variants={fadeUp} className="flex gap-4 mt-4">
          <a
            href={`mailto:${social.email}`}
            className="p-3 rounded-full bg-surface-2 text-text-secondary hover:text-ember hover:bg-surface-3 transition-colors"
            aria-label="Email"
          >
            <Mail size={20} />
          </a>
          <a
            href={social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-surface-2 text-text-secondary hover:text-ember hover:bg-surface-3 transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin size={20} />
          </a>
          <a
            href={social.github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-surface-2 text-text-secondary hover:text-ember hover:bg-surface-3 transition-colors"
            aria-label="GitHub"
          >
            <Github size={20} />
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-10"
      >
        <button
          onClick={() =>
            document
              .getElementById("articles")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="text-text-muted hover:text-ember transition-colors"
          aria-label="Scroll down"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown size={28} />
          </motion.div>
        </button>
      </motion.div>
    </div>
  );
}
