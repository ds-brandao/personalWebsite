import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const phrases = [
  "I'm Daniel Brandao",
  "I code security solutions",
  "I build secure systems",
  "I break things to fix them"
];

export default function Hero() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
      <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent-light/10 animate-gradient" />

        {/* Glowing orbs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent-light/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

        <div className="relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2 min-h-[2.5rem]">
              <span className="gradient-text">{currentText}</span>
              <span className="inline-block w-[3px] h-6 md:h-8 bg-accent ml-1 animate-blink rounded-sm" />
            </h1>
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-text-secondary text-sm md:text-base font-medium"
          >
            Software Engineer | Problem Solver
          </motion.p>

          {/* Decorative elements */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="flex justify-center gap-3 mt-6"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-accent-light animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.4s' }} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
