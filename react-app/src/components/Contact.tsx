import { motion } from 'framer-motion';
import { FiMail, FiLinkedin, FiGithub, FiUser } from 'react-icons/fi';
import type { Config } from '../types';

interface ContactProps {
  config: Config | null;
}

export default function Contact({ config }: ContactProps) {
  const contacts = [
    {
      icon: FiMail,
      title: 'Email',
      label: 'Email me',
      href: `mailto:${config?.social.email || ''}`,
      newTab: false,
    },
    {
      icon: FiLinkedin,
      title: 'LinkedIn',
      label: 'Connect',
      href: config?.social.linkedin || '',
      newTab: true,
    },
    {
      icon: FiGithub,
      title: 'GitHub',
      label: 'Follow',
      href: config?.social.github.url || '',
      newTab: true,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-3">
        <span className="p-2 rounded-lg bg-accent/10 text-accent">
          <FiUser className="w-5 h-5" />
        </span>
        Contact
      </h2>

      <div className="h-[2px] w-10 bg-gradient-to-r from-accent to-accent-light rounded-full mb-4" />

      <div className="grid grid-cols-3 gap-3">
        {contacts.map((contact, index) => (
          <motion.a
            key={contact.title}
            href={contact.href}
            target={contact.newTab ? '_blank' : undefined}
            rel={contact.newTab ? 'noopener noreferrer' : undefined}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            className="bg-surface-2/50 border border-white/5 rounded-xl p-4 text-center group glass-card-hover"
          >
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <contact.icon className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-sm font-medium text-text-primary mb-1">{contact.title}</h3>
            <p className="text-xs text-accent group-hover:text-accent-light transition-colors">
              {contact.label}
            </p>
          </motion.a>
        ))}
      </div>
    </motion.section>
  );
}
