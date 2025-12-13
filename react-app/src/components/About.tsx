import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLinkedin, FiGithub } from 'react-icons/fi';
import type { Config } from '../types';

interface AboutProps {
  config: Config | null;
}

export default function About({ config }: AboutProps) {
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

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <span className="p-1 rounded-md bg-accent/10 text-accent">
            <FiUser className="w-3.5 h-3.5" />
          </span>
          About Me
        </h2>
        
        {/* Contact Icons */}
        <div className="flex items-center gap-1">
          {contacts.map((contact) => (
            <a
              key={contact.label}
              href={contact.href}
              target={contact.newTab ? '_blank' : undefined}
              rel={contact.newTab ? 'noopener noreferrer' : undefined}
              className="p-1.5 rounded-md bg-surface-2/50 text-text-secondary hover:text-accent hover:bg-accent/10 transition-all"
              title={contact.label}
            >
              <contact.icon className="w-3.5 h-3.5" />
            </a>
          ))}
        </div>
      </div>

      <div className="h-[1px] w-6 bg-gradient-to-r from-accent to-accent-light rounded-full mb-2" />

      <div className="text-text-secondary text-xs leading-relaxed space-y-1.5">
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

        <p>
          Passionate about scalable systems & AI/UX intersection.
        </p>
      </div>
    </motion.section>
  );
}
