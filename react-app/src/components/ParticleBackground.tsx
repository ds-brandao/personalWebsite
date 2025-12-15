import { useEffect, useRef, useCallback } from 'react';

// Color palette from the website theme
const COLORS = ['#ffffff', '#a5b4fc', '#818cf8', '#6366f1', '#c7d2fe'];

interface WavePoint {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
}

interface ScatterParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

/**
 * Creates a perspective wave field with converging lines and halftone particles
 * matching the reference image style
 */
export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const scatterParticlesRef = useRef<ScatterParticle[]>([]);

  // Initialize scatter particles for halftone effect
  const initScatterParticles = useCallback((width: number, height: number) => {
    const particles: ScatterParticle[] = [];
    const count = Math.floor((width * height) / 8000); // Density based on screen size

    for (let i = 0; i < count; i++) {
      // Concentrate particles more toward edges and bottom
      const edgeBias = Math.random();
      let x: number, y: number;

      if (edgeBias < 0.3) {
        // Left edge cluster
        x = Math.random() * width * 0.25;
        y = height * 0.4 + Math.random() * height * 0.6;
      } else if (edgeBias < 0.6) {
        // Right edge cluster
        x = width * 0.75 + Math.random() * width * 0.25;
        y = height * 0.4 + Math.random() * height * 0.6;
      } else if (edgeBias < 0.8) {
        // Bottom area
        x = Math.random() * width;
        y = height * 0.7 + Math.random() * height * 0.3;
      } else {
        // Scattered throughout
        x = Math.random() * width;
        y = height * 0.3 + Math.random() * height * 0.7;
      }

      particles.push({
        x,
        y,
        size: 1 + Math.random() * 3,
        opacity: 0.1 + Math.random() * 0.4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.1,
        life: Math.random() * 1000,
        maxLife: 500 + Math.random() * 1000,
      });
    }

    scatterParticlesRef.current = particles;
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    timeRef.current += 0.02;
    const time = timeRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Vanishing point at top center
    const vanishX = width / 2;
    const vanishY = height * 0.15;

    // Draw perspective wave lines
    const waveLineCount = 25;
    const wavePoints: WavePoint[] = [];

    for (let line = 0; line < waveLineCount; line++) {
      // Perspective: lines get closer together as they approach vanishing point
      const t = line / waveLineCount;
      const perspectiveY = vanishY + (height - vanishY) * Math.pow(t, 1.5);

      // Line width decreases toward vanishing point
      const lineSpread = width * 0.6 + width * 0.8 * t;
      const startX = vanishX - lineSpread / 2;
      const endX = vanishX + lineSpread / 2;

      // Wave parameters - amplitude increases toward bottom
      const waveAmplitude = 5 + 25 * Math.pow(t, 1.2);
      const waveFrequency = 0.008 + 0.004 * t;
      const wavePhase = time + line * 0.3;

      // Point density along the line - more points for lower (closer) lines
      const pointCount = Math.floor(30 + 80 * t);

      for (let p = 0; p < pointCount; p++) {
        const px = p / pointCount;
        const x = startX + (endX - startX) * px;

        // Sine wave with slight variation
        const waveOffset = Math.sin(x * waveFrequency + wavePhase) * waveAmplitude;
        const y = perspectiveY + waveOffset;

        // Size increases toward bottom (perspective)
        const baseSize = 1 + 2.5 * t;

        // Opacity varies - slightly less at edges
        const edgeFade = 1 - Math.pow(Math.abs(px - 0.5) * 2, 3) * 0.3;
        const opacity = (0.2 + 0.5 * t) * edgeFade;

        // Color selection - more white toward the center/top
        const colorIndex = Math.floor(Math.random() * COLORS.length);
        const color = t < 0.3 ? COLORS[0] : COLORS[colorIndex];

        wavePoints.push({
          x,
          y,
          size: baseSize,
          opacity,
          color,
        });
      }
    }

    // Draw wave points
    wavePoints.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      ctx.fillStyle = point.color;
      ctx.globalAlpha = point.opacity;
      ctx.fill();
    });

    // Update and draw scatter particles (halftone effect at edges)
    scatterParticlesRef.current.forEach((particle) => {
      // Gentle movement
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life += 1;

      // Subtle breathing effect
      const breathe = Math.sin(particle.life * 0.02) * 0.3 + 0.7;

      // Wrap around or reset
      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < height * 0.3) particle.y = height - 10;
      if (particle.y > height + 10) particle.y = height * 0.3;

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * breathe, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.opacity * breathe;
      ctx.fill();
    });

    // Draw additional converging lines (perspective guide lines)
    const lineCount = 15;
    for (let i = 0; i < lineCount; i++) {
      const t = i / (lineCount - 1);
      const bottomX = width * t;

      // Draw dots along the perspective line
      const dotCount = Math.floor(15 + 30 * (1 - Math.abs(t - 0.5) * 2));

      for (let d = 0; d < dotCount; d++) {
        const dt = d / dotCount;
        const x = vanishX + (bottomX - vanishX) * Math.pow(dt, 0.8);
        const y = vanishY + (height - vanishY) * Math.pow(dt, 1.2);

        // Wave displacement
        const waveDisplace = Math.sin(x * 0.01 + time + d * 0.1) * (10 * dt);

        // Size and opacity based on distance
        const size = 0.5 + 2 * dt;
        const opacity = 0.1 + 0.3 * dt;

        // Only draw if not too close to wave lines (avoid overlap)
        const skipDraw = Math.random() > 0.3;
        if (!skipDraw) {
          ctx.beginPath();
          ctx.arc(x, y + waveDisplace, size, 0, Math.PI * 2);
          ctx.fillStyle = COLORS[Math.floor(Math.random() * COLORS.length)];
          ctx.globalAlpha = opacity * 0.5;
          ctx.fill();
        }
      }
    }

    ctx.globalAlpha = 1;
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initScatterParticles(canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [initScatterParticles]);

  // Start animation
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
