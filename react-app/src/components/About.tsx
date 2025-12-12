import { motion } from 'framer-motion';
import { FiUser } from 'react-icons/fi';
import type { Config } from '../types';

interface AboutProps {
  config: Config | null;
}

export default function About({ config }: AboutProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-6 h-full"
    >
      <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-3">
        <span className="p-2 rounded-lg bg-accent/10 text-accent">
          <FiUser className="w-5 h-5" />
        </span>
        About Me
      </h2>

      <div className="h-[2px] w-10 bg-gradient-to-r from-accent to-accent-light rounded-full mb-4" />

      <div className="text-text-secondary text-sm leading-relaxed space-y-4 overflow-y-auto max-h-[calc(100%-80px)] pr-2">
        <p>
          I am a recent graduate from{' '}
          <a
            href={config?.personal.college.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-light transition-colors font-medium"
          >
            {config?.personal.college.name || 'Bellevue College'}
          </a>{' '}
          and currently work as a Backend Software Engineer at T-Mobile on the Quantum team, focusing on AI technologies.
        </p>

        <p>
          I'm passionate about building scalable systems and exploring the intersection of user experience and artificial intelligence. My role involves developing scalable systems that can handle high traffic and high concurrency.
        </p>

        <p>
          When I'm not coding, I enjoy listening to music (life is better with a soundtrack), getting some{' '}
          <a
            href={config?.personal.favoriteRestaurant.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-light transition-colors font-medium"
          >
            {config?.personal.favoriteRestaurant.name || 'Italian food'}
          </a>
          , and absolutely destroying my friends in FIFA.
        </p>
      </div>
    </motion.section>
  );
}
