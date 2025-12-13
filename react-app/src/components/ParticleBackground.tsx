import { useCallback } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Container, Engine, ISourceOptions } from '@tsparticles/engine';

export default function ParticleBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (_container: Container | undefined) => {
    // Particles loaded
  }, []);

  const options: ISourceOptions = {
    fullScreen: false,
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 60,
    particles: {
      number: {
        value: 100,
        density: {
          enable: true,
          width: 1920,
          height: 1080,
        },
      },
      color: {
        value: ['#ffffff', '#a5b4fc', '#818cf8', '#6366f1'],
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: { min: 0.1, max: 0.8 },
        animation: {
          enable: true,
          speed: 0.5,
          minimumValue: 0.1,
          sync: false,
        },
      },
      size: {
        value: { min: 0.5, max: 2.5 },
        animation: {
          enable: true,
          speed: 1,
          minimumValue: 0.3,
          sync: false,
        },
      },
      move: {
        enable: true,
        speed: 0.3,
        direction: 'none',
        random: true,
        straight: false,
        outModes: {
          default: 'out',
        },
        attract: {
          enable: false,
        },
      },
      zIndex: {
        value: { min: 0, max: 100 },
        opacityRate: 1,
        sizeRate: 1,
        velocityRate: 1,
      },
    },
    interactivity: {
      detectsOn: 'window',
      events: {
        onHover: {
          enable: true,
          mode: 'grab',
        },
        resize: {
          enable: true,
        },
      },
      modes: {
        grab: {
          distance: 120,
          links: {
            opacity: 0.2,
            color: '#6366f1',
          },
        },
      },
    },
    detectRetina: true,
  };

  return (
    <Particles
      id="starfield-particles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={options}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

