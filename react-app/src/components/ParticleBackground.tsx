import { useEffect, useState, useRef, useCallback } from 'react';

interface WaveParticle {
  x: number;
  y: number;
  baseY: number;
  size: number;
  opacity: number;
  speed: number;
  waveIndex: number;
  phase: number;
  color: string;
}

const COLORS = ['#ffffff', '#a5b4fc', '#818cf8', '#6366f1', '#c7d2fe'];

/**
 * Creates particles distributed along wave curves
 */
function createWaveParticles(width: number, height: number, count: number): WaveParticle[] {
  const particles: WaveParticle[] = [];
  const waveCount = 6; // Number of wave bands
  const particlesPerWave = Math.floor(count / waveCount);

  for (let wave = 0; wave < waveCount; wave++) {
    const baseY = (height / (waveCount + 1)) * (wave + 1);
    
    for (let i = 0; i < particlesPerWave; i++) {
      const x = (width / particlesPerWave) * i + Math.random() * 20 - 10;
      const phase = Math.random() * Math.PI * 2;
      
      particles.push({
        x,
        y: baseY,
        baseY,
        size: 1 + Math.random() * 2.5,
        opacity: 0.2 + Math.random() * 0.5,
        speed: 0.3 + Math.random() * 0.4,
        waveIndex: wave,
        phase,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
  }

  return particles;
}

/**
 * Updates particle positions for wave animation
 */
function updateParticle(
  particle: WaveParticle,
  time: number,
  width: number,
  amplitude: number
): void {
  // Move horizontally
  particle.x += particle.speed;
  
  // Wrap around screen
  if (particle.x > width + 20) {
    particle.x = -20;
  }

  // Calculate wave Y position using sine
  const frequency = 0.003 + particle.waveIndex * 0.001;
  const waveAmplitude = amplitude * (0.8 + particle.waveIndex * 0.1);
  particle.y = particle.baseY + Math.sin(particle.x * frequency + time * 0.001 + particle.phase) * waveAmplitude;
}

/**
 * Draws a single particle
 */
function drawParticle(ctx: CanvasRenderingContext2D, particle: WaveParticle): void {
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.fillStyle = particle.color;
  ctx.globalAlpha = particle.opacity;
  ctx.fill();
  ctx.globalAlpha = 1;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<WaveParticle[]>([]);
  const animationRef = useRef<number>(0);
  const [isReady, setIsReady] = useState(false);

  const initializeParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    particlesRef.current = createWaveParticles(canvas.width, canvas.height, 400);
    setIsReady(true);
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const time = Date.now();
    const amplitude = canvas.height * 0.08;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current.forEach((particle) => {
      updateParticle(particle, time, canvas.width, amplitude);
      drawParticle(ctx, particle);
    });

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeParticles();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [initializeParticles]);

  // Start animation
  useEffect(() => {
    if (!isReady) return;

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isReady, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
