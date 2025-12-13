import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLinkedin, FiGithub } from 'react-icons/fi';
import type { Config } from '../types';

const phrases = [
  "I'm Daniel Brandao",
  "I code security solutions",
  "I build secure systems",
  "I break things to fix them"
];

interface HeroProps {
  config: Config | null;
}

export default function Hero({ config }: HeroProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const contacts = [
    {
      icon: FiMail,
      href: `mailto:${config?.social.email || ''}`,
      label: 'Email',
      newTab: false,
    },
    {
      icon: FiLinkedin,
      href: config?.social.linkedin || '',
      label: 'LinkedIn',
      newTab: true,
    },
    {
      icon: FiGithub,
      href: config?.social.github.url || '',
      label: 'GitHub',
      newTab: true,
    },
  ];

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < currentPhrase.length) {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentPhraseIndex]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="apple-glass-card p-5 relative overflow-hidden">
        {/* Light refraction effect at top */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/10 to-transparent rounded-t-3xl" />
        {/* Subtle edge highlight */}
        <div className="absolute inset-x-4 top-[1px] h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-4">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-lg md:text-xl font-bold text-text-primary h-7 mb-1">
                <span className="gradient-text">{currentText}</span>
                <span className="inline-block w-[2px] h-4 md:h-5 bg-accent ml-1 animate-blink rounded-sm" />
              </h1>
            </motion.div>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-text-secondary text-xs font-medium"
            >
              Software Engineer
            </motion.p>
          </div>

          {/* Divider */}
          <div className="relative h-[1px] w-full mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>

          {/* About Section */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-text-secondary text-xs leading-relaxed space-y-1.5 mb-4">
              <p>
                Backend Software Engineer at T-Mobile (Quantum team), focusing on AI. Graduate from{' '}
                <a
                  href={config?.personal.college.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-light transition-colors font-medium"
                >
                  {config?.personal.college.name || 'Bellevue College'}
                </a>.
              </p>
              <p className="text-text-secondary/80">
                Passionate about scalable systems & AI/UX intersection.
              </p>
            </div>

            {/* Contact Icons */}
            <div className="flex items-center justify-center gap-3">
              {contacts.map((contact, index) => (
                <motion.a
                  key={contact.label}
                  href={contact.href}
                  target={contact.newTab ? '_blank' : undefined}
                  rel={contact.newTab ? 'noopener noreferrer' : undefined}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
                  className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-text-primary/80 hover:text-white hover:bg-white/20 hover:border-white/30 hover:scale-105 transition-all shadow-sm"
                  title={contact.label}
                >
                  <contact.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
