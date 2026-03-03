import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
}

interface SparkleProps {
  active: boolean;
  color?: string;
}

const COLORS = ['#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB', '#A29BFE', '#FD79A8', '#6C5CE7', '#ffffff'];

export function Sparkle({ active, color }: SparkleProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }
    const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50 + (Math.random() - 0.5) * 20,
      color: color ?? COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      angle: (i / 12) * 360,
      speed: 40 + Math.random() * 40,
    }));
    setParticles(newParticles);

    const t = setTimeout(() => setParticles([]), 600);
    return () => clearTimeout(t);
  }, [active, color]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: 'translate(-50%, -50%)',
            animation: `sparkle-fly 0.6s ease-out forwards`,
            '--angle': `${p.angle}deg`,
            '--speed': `${p.speed}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
