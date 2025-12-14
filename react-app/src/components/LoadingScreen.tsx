import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  // Wave animation properties
  phase: number;
  waveAmplitude: number;
  waveSpeed: number;
}

interface LoadingScreenProps {
  onComplete: () => void;
  minDisplayTime?: number;
}

// DSB letter definitions as pixel art (each letter is roughly 7 wide x 9 tall)
const DSB_LETTERS = {
  D: [
    [1,1,1,1,1,0,0],
    [1,0,0,0,1,1,0],
    [1,0,0,0,0,1,0],
    [1,0,0,0,0,1,1],
    [1,0,0,0,0,0,1],
    [1,0,0,0,0,1,1],
    [1,0,0,0,0,1,0],
    [1,0,0,0,1,1,0],
    [1,1,1,1,1,0,0],
  ],
  S: [
    [0,1,1,1,1,1,0],
    [1,1,0,0,0,1,1],
    [1,1,0,0,0,0,0],
    [1,1,0,0,0,0,0],
    [0,1,1,1,1,1,0],
    [0,0,0,0,0,1,1],
    [0,0,0,0,0,1,1],
    [1,1,0,0,0,1,1],
    [0,1,1,1,1,1,0],
  ],
  B: [
    [1,1,1,1,1,0,0],
    [1,0,0,0,1,1,0],
    [1,0,0,0,0,1,0],
    [1,0,0,0,1,1,0],
    [1,1,1,1,1,0,0],
    [1,0,0,0,1,1,0],
    [1,0,0,0,0,1,0],
    [1,0,0,0,1,1,0],
    [1,1,1,1,1,0,0],
  ],
};

const COLORS = ['#ffffff', '#a5b4fc', '#818cf8', '#6366f1', '#c7d2fe'];

// Phase timing constants (in milliseconds)
const FORMING_DURATION = 1200;
const HOLDING_DURATION = 2800;
const PRE_EXIT_DURATION = 800;
const DISSOLVING_DURATION = 1200;

// Bright accent colors for pre-exit phase
const BRIGHT_COLORS = ['#ffffff', '#c7d2fe', '#a5b4fc', '#e0e7ff', '#f0f5ff'];

/**
 * Generates target positions for DSB letters
 */
function generateLetterTargets(
  canvasWidth: number,
  canvasHeight: number,
  particleSize: number
): { x: number; y: number }[] {
  const targets: { x: number; y: number }[] = [];
  const letters = ['D', 'S', 'B'] as const;
  const letterWidth = 7;
  const letterHeight = 9;
  const letterSpacing = 2;
  const totalWidth = letters.length * letterWidth + (letters.length - 1) * letterSpacing;
  
  // Scale factor based on canvas size
  const scale = Math.min(canvasWidth / 400, canvasHeight / 300) * particleSize;
  const startX = (canvasWidth - totalWidth * scale) / 2;
  const startY = (canvasHeight - letterHeight * scale) / 2;

  letters.forEach((letter, letterIndex) => {
    const letterData = DSB_LETTERS[letter];
    const offsetX = letterIndex * (letterWidth + letterSpacing) * scale;

    for (let row = 0; row < letterData.length; row++) {
      for (let col = 0; col < letterData[row].length; col++) {
        if (letterData[row][col] === 1) {
          targets.push({
            x: startX + offsetX + col * scale,
            y: startY + row * scale,
          });
        }
      }
    }
  });

  return targets;
}

/**
 * Creates initial particles with random positions and wave properties
 */
function createParticles(
  targets: { x: number; y: number }[],
  canvasWidth: number,
  canvasHeight: number
): Particle[] {
  return targets.map((target) => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    targetX: target.x,
    targetY: target.y,
    vx: 0,
    vy: 0,
    size: 3 + Math.random() * 2,
    opacity: 0.3 + Math.random() * 0.7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    // Wave properties for organic movement
    phase: Math.random() * Math.PI * 2,
    waveAmplitude: 2 + Math.random() * 4,
    waveSpeed: 0.8 + Math.random() * 0.4,
  }));
}

/**
 * Easing function for smooth animation
 */
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

/**
 * Calculates wave offset for organic particle movement
 */
function calculateWaveOffset(
  time: number,
  particle: Particle,
  baseX: number
): { x: number; y: number } {
  const timeOffset = time * 0.001 * particle.waveSpeed;
  // Use particle's x-position to create wave propagation effect across letters
  const spatialOffset = baseX * 0.008;
  
  const waveX = Math.sin(timeOffset + particle.phase + spatialOffset) * particle.waveAmplitude;
  const waveY = Math.cos(timeOffset * 0.7 + particle.phase) * particle.waveAmplitude * 0.6;
  
  return { x: waveX, y: waveY };
}

export default function LoadingScreen({ onComplete, minDisplayTime = 6000 }: LoadingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const phaseRef = useRef<'forming' | 'holding' | 'pre-exit' | 'dissolving'>('forming');
  const phaseStartRef = useRef<number>(Date.now());
  const [isVisible, setIsVisible] = useState(true);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const initializeParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const targets = generateLetterTargets(canvas.width, canvas.height, 8);
    particlesRef.current = createParticles(targets, canvas.width, canvas.height);
    phaseRef.current = 'forming';
    phaseStartRef.current = Date.now();
    
    // Calculate center of letters for pre-exit scale effect
    if (targets.length > 0) {
      const sumX = targets.reduce((acc, t) => acc + t.x, 0);
      const sumY = targets.reduce((acc, t) => acc + t.y, 0);
      centerRef.current = { x: sumX / targets.length, y: sumY / targets.length };
    }
  }, []);

  const updateFormingPhase = useCallback((particle: Particle, progress: number, time: number) => {
    const easedProgress = easeOutQuart(progress);
    
    // Move toward target
    particle.x += (particle.targetX - particle.x) * easedProgress * 0.08;
    particle.y += (particle.targetY - particle.y) * easedProgress * 0.08;
    
    // Add wave oscillation during approach (diminishes as particle gets closer)
    const distanceToTarget = Math.sqrt(
      Math.pow(particle.x - particle.targetX, 2) + 
      Math.pow(particle.y - particle.targetY, 2)
    );
    const waveStrength = Math.min(1, distanceToTarget / 100) * (1 - easedProgress * 0.5);
    const waveOffset = calculateWaveOffset(time, particle, particle.targetX);
    
    particle.x += waveOffset.x * waveStrength * 1.5;
    particle.y += waveOffset.y * waveStrength * 1.5;
  }, []);

  const updatePreExitPhase = useCallback((particle: Particle, progress: number, time: number) => {
    const center = centerRef.current;
    
    // Use eased progress for smoother transitions
    const easedProgress = easeOutQuart(progress);
    
    // Scale factor increases smoothly from 1.0 to 1.08 during pre-exit
    const scaleFactor = 1 + easedProgress * 0.08;
    
    // Calculate scaled position from center
    const baseX = particle.targetX;
    const baseY = particle.targetY;
    const scaledX = center.x + (baseX - center.x) * scaleFactor;
    const scaledY = center.y + (baseY - center.y) * scaleFactor;
    
    // Smoothly intensify wave motion (starts at 1.0 to match holding phase)
    const waveOffset = calculateWaveOffset(time, particle, baseX);
    const waveIntensity = 1 + easedProgress * 0.5;
    
    particle.x = scaledX + waveOffset.x * waveIntensity;
    particle.y = scaledY + waveOffset.y * waveIntensity;
    
    // Gradually shift color toward brighter accent using probability
    // Probability increases smoothly from 0% to 15% per frame
    const colorShiftProbability = easedProgress * 0.15;
    if (Math.random() < colorShiftProbability) {
      particle.color = BRIGHT_COLORS[Math.floor(Math.random() * BRIGHT_COLORS.length)];
    }
    
    // Smoothly increase opacity for glow buildup
    particle.opacity = Math.min(1, 0.7 + easedProgress * 0.3);
  }, []);

  const updateDissolvingPhase = useCallback((particle: Particle, elapsed: number, time: number) => {
    const center = centerRef.current;
    
    // Initialize velocity on first dissolve frame - faster burst from center
    if (particle.vx === 0 && particle.vy === 0) {
      // Direction from center for dramatic outward burst
      const dx = particle.x - center.x;
      const dy = particle.y - center.y;
      
      // Base outward direction with some randomness
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.8;
      const speed = 6 + Math.random() * 6; // Faster burst (was 2-6, now 6-12)
      
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed - 1.5; // Slight upward bias
    }

    // Base movement with faster initial speed
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.96; // Slightly more friction for dramatic deceleration
    particle.vy *= 0.96;
    particle.vy += 0.05; // Subtle gravity effect
    
    // Add wave motion to dispersal for curved wave paths
    const waveOffset = calculateWaveOffset(time, particle, particle.x);
    const waveDecay = Math.max(0, 1 - elapsed / 600);
    particle.x += waveOffset.x * 0.4 * waveDecay;
    particle.y += waveOffset.y * 0.4 * waveDecay;
    
    // Fade out with slight delay for trail effect
    const fadeDelay = 150; // Start fading after 150ms
    const fadeProgress = Math.max(0, (elapsed - fadeDelay) / (DISSOLVING_DURATION - fadeDelay));
    particle.opacity = Math.max(0, 1 - fadeProgress);
    
    // Shrink particles as they disperse for trail effect
    particle.size = Math.max(1, particle.size * 0.995);
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const time = Date.now();
    const elapsed = time - phaseStartRef.current;
    const particles = particlesRef.current;

    // Phase transitions
    if (phaseRef.current === 'forming' && elapsed > FORMING_DURATION) {
      phaseRef.current = 'holding';
      phaseStartRef.current = time;
    } else if (phaseRef.current === 'holding' && elapsed > HOLDING_DURATION) {
      phaseRef.current = 'pre-exit';
      phaseStartRef.current = time;
    } else if (phaseRef.current === 'pre-exit' && elapsed > PRE_EXIT_DURATION) {
      phaseRef.current = 'dissolving';
      phaseStartRef.current = time;
      // Reset velocities for dissolving phase
      particles.forEach((p) => {
        p.vx = 0;
        p.vy = 0;
      });
    } else if (phaseRef.current === 'dissolving' && elapsed > DISSOLVING_DURATION) {
      setIsVisible(false);
      return;
    }

    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach((particle) => {
      if (phaseRef.current === 'forming') {
        const progress = Math.min(elapsed / FORMING_DURATION, 1);
        updateFormingPhase(particle, progress, time);
      } else if (phaseRef.current === 'holding') {
        // Wave oscillation around target position during holding
        const waveOffset = calculateWaveOffset(time, particle, particle.targetX);
        particle.x = particle.targetX + waveOffset.x;
        particle.y = particle.targetY + waveOffset.y;
      } else if (phaseRef.current === 'pre-exit') {
        const progress = Math.min(elapsed / PRE_EXIT_DURATION, 1);
        updatePreExitPhase(particle, progress, time);
      } else if (phaseRef.current === 'dissolving') {
        updateDissolvingPhase(particle, elapsed, time);
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw glow effect around formed letters during holding and pre-exit phases
    if (phaseRef.current === 'holding' || phaseRef.current === 'pre-exit') {
      let glowIntensity: number;
      let glowRadius: number;
      let pulseSpeed: number;
      
      // Base values that match between phases for smooth transition
      const baseGlowIntensity = 0.1;
      const basePulseAmplitude = 0.05;
      const basePulseSpeed = 500;
      const baseGlowRadius = 3;
      
      if (phaseRef.current === 'holding') {
        // Subtle pulsing glow during holding
        pulseSpeed = basePulseSpeed;
        glowIntensity = baseGlowIntensity + Math.sin(time / pulseSpeed) * basePulseAmplitude;
        glowRadius = baseGlowRadius;
      } else {
        // Smoothly intensifying glow during pre-exit
        const progress = Math.min(elapsed / PRE_EXIT_DURATION, 1);
        const easedProgress = easeOutQuart(progress);
        
        // Smoothly transition pulse speed from 500ms to 150ms
        pulseSpeed = basePulseSpeed - easedProgress * 350;
        
        // Smoothly increase base intensity and pulse amplitude
        const intensityBoost = easedProgress * 0.3;
        const amplitudeBoost = easedProgress * 0.15;
        glowIntensity = (baseGlowIntensity + intensityBoost) + 
                        Math.sin(time / pulseSpeed) * (basePulseAmplitude + amplitudeBoost);
        
        // Smoothly grow glow radius from 3x to 5x
        glowRadius = baseGlowRadius + easedProgress * 2;
      }
      
      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * glowRadius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * glowRadius
        );
        gradient.addColorStop(0, `rgba(99, 102, 241, ${glowIntensity})`);
        gradient.addColorStop(0.5, `rgba(165, 180, 252, ${glowIntensity * 0.5})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
      });
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [minDisplayTime, updateFormingPhase, updatePreExitPhase, updateDissolvingPhase]);

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
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Call onComplete when visibility changes to false
  // Reduced delay to create overlap with main content fade-in
  useEffect(() => {
    if (!isVisible) {
      const timeout = setTimeout(onComplete, 100);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ backgroundColor: '#0a0a0f' }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />
          
          {/* Subtle loading indicator */}
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent"
                  animate={{
                    y: [0, -6, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

