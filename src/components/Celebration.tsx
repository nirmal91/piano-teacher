import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  emoji?: string;
}

interface CelebrationProps {
  show: boolean;
  message?: string;
  onDone?: () => void;
}

const CONFETTI_COLORS = ['#FF6B6B','#FF9F43','#FECA57','#48DBFB','#A29BFE','#FD79A8','#6C5CE7'];
const EMOJIS = ['⭐','🌟','✨','🎉','🎊','🎈','💫','🎵','🎶'];

export function Celebration({ show, message = 'Amazing! 🎉', onDone }: CelebrationProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      setPieces([]);
      return;
    }

    setVisible(true);
    const newPieces: ConfettiPiece[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 8 + Math.random() * 14,
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1,
      emoji: Math.random() > 0.6 ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : undefined,
    }));
    setPieces(newPieces);

    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 3000);

    return () => clearTimeout(t);
  }, [show, onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Confetti pieces */}
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${p.x}%`,
            width: p.emoji ? 'auto' : p.size,
            height: p.emoji ? 'auto' : p.size,
            backgroundColor: p.emoji ? 'transparent' : p.color,
            fontSize: p.emoji ? p.size + 8 : undefined,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Center message */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="
            bg-white/90 backdrop-blur rounded-3xl px-8 py-6
            text-center shadow-2xl
            animate-bounce-in
          "
        >
          <div className="text-5xl mb-2">🎉</div>
          <div className="text-2xl md:text-3xl font-black text-purple-700">{message}</div>
          <div className="text-4xl mt-2">⭐⭐⭐</div>
        </div>
      </div>
    </div>
  );
}
