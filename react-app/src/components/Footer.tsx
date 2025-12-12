import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import type { Config } from '../types';

interface FooterProps {
  config: Config | null;
}

export default function Footer({ config }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: FiGithub,
      href: config?.social.github.url || '',
      label: 'GitHub',
    },
    {
      icon: FiLinkedin,
      href: config?.social.linkedin || '',
      label: 'LinkedIn',
    },
    {
      icon: FiMail,
      href: `mailto:${config?.social.email || ''}`,
      label: 'Email',
    },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="py-6 px-4 border-t border-white/5 bg-surface-1/50 backdrop-blur-sm mt-8"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-text-secondary text-sm">
          &copy; {currentYear} {config?.personal.name || 'Daniel Brandao'}
        </p>

        <div className="flex items-center gap-4">
          {socialLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('mailto:') ? undefined : '_blank'}
              rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
              aria-label={link.label}
              className="text-text-secondary hover:text-accent transition-colors p-2 hover:bg-accent/10 rounded-lg"
            >
              <link.icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
    </motion.footer>
  );
}
