import { useState, useCallback } from 'react';
import { NoteDefinition, KeyState } from '../types';
import { Sparkle } from './Sparkle';

interface PianoKeyProps {
  note: NoteDefinition;
  state: KeyState;
  onPress: (noteId: string) => void;
  showAnimals?: boolean;
  size?: 'normal' | 'large';
}

export function PianoKey({ note, state, onPress, showAnimals = true, size = 'normal' }: PianoKeyProps) {
  const [pressed, setPressed] = useState(false);
  const [sparkleActive, setSparkleActive] = useState(false);

  const handlePress = useCallback(() => {
    setPressed(true);
    setSparkleActive(false);
    setTimeout(() => setSparkleActive(true), 10);
    setTimeout(() => setPressed(false), 200);
    onPress(note.id);
  }, [note.id, onPress]);

  if (note.isSharp) {
    const sharpStateClass = {
      normal: 'bg-gray-800',
      target: 'bg-yellow-400 shadow-[0_0_20px_6px_rgba(251,191,36,0.9)] animate-pulse',
      correct: 'bg-green-400',
      wrong: 'bg-red-400',
      hint: 'bg-green-500 shadow-[0_0_20px_6px_rgba(34,197,94,0.9)]',
    }[state];

    return (
      <div className="relative inline-block" style={{ zIndex: 10 }}>
        <button
          onPointerDown={handlePress}
          className={`
            relative
            ${size === 'large' ? 'w-8 h-20' : 'w-6 h-14'}
            rounded-b-md
            cursor-pointer select-none
            transition-all duration-100
            border border-gray-900
            ${sharpStateClass}
            ${pressed ? 'translate-y-1 shadow-inner' : 'shadow-lg'}
          `}
          style={{ touchAction: 'none' }}
          aria-label={note.displayName}
        >
          <Sparkle active={sparkleActive} />
        </button>
      </div>
    );
  }

  // White key states
  const whiteStateClass = {
    normal: '',
    target: 'shadow-[0_0_30px_10px_rgba(251,191,36,0.9)] animate-pulse scale-105',
    correct: 'brightness-110',
    wrong: 'brightness-75',
    hint: 'shadow-[0_0_30px_10px_rgba(34,197,94,0.9)] scale-105',
  }[state];

  const bgColor = state === 'normal' ? note.color
    : state === 'target' ? '#FFF176'
    : state === 'correct' ? '#A5F3A5'
    : state === 'wrong' ? '#FFAAAA'
    : state === 'hint' ? '#86EFAC'
    : note.color;

  return (
    <div className="relative inline-flex flex-col items-center">
      <button
        onPointerDown={handlePress}
        className={`
          relative
          ${size === 'large' ? 'w-16 h-40' : 'w-12 h-28'}
          rounded-b-xl
          cursor-pointer select-none
          transition-all duration-100
          border-2 border-white/30
          flex flex-col items-center justify-end pb-2
          ${whiteStateClass}
          ${pressed ? 'translate-y-1 shadow-inner' : 'shadow-[0_4px_8px_rgba(0,0,0,0.3)]'}
        `}
        style={{
          backgroundColor: bgColor,
          touchAction: 'none',
        }}
        aria-label={note.displayName}
      >
        {showAnimals && (
          <span
            className={`text-2xl transition-transform duration-100 select-none ${
              state === 'target' ? 'animate-bounce scale-125' : ''
            } ${pressed ? 'scale-125' : ''}`}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
          >
            {note.animal}
          </span>
        )}
        <Sparkle active={sparkleActive} color={note.color} />
      </button>
    </div>
  );
}
