type MascotMood = 'idle' | 'happy' | 'excited' | 'sad' | 'celebrate' | 'hint';

interface MascotProps {
  mood: MascotMood;
  message?: string;
}

const MOOD_EMOJI: Record<MascotMood, string> = {
  idle: '😺',
  happy: '😸',
  excited: '🤩',
  sad: '😿',
  celebrate: '🥳',
  hint: '🙀',
};

const MOOD_MESSAGE: Record<MascotMood, string> = {
  idle: 'Let\'s play! 🎹',
  happy: 'YAY! Great job! 🌟',
  excited: 'WOW! Amazing! ✨',
  sad: 'Try again! You can do it! 💪',
  celebrate: 'HOORAY! You did it! 🎉🎊',
  hint: 'Tap the shiny one! 👆',
};

const MOOD_ANIMATION: Record<MascotMood, string> = {
  idle: 'animate-float',
  happy: 'animate-bounce',
  excited: 'animate-spin',
  sad: 'animate-wiggle',
  celebrate: 'animate-bounce',
  hint: 'animate-pulse',
};

export function Mascot({ mood, message }: MascotProps) {
  const displayMessage = message ?? MOOD_MESSAGE[mood];
  const animation = MOOD_ANIMATION[mood];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Speech bubble */}
      <div
        className="
          relative bg-white rounded-2xl px-4 py-2 shadow-lg
          text-gray-800 font-bold text-sm md:text-base
          max-w-48 text-center
          before:content-[''] before:absolute before:bottom-[-10px] before:left-1/2
          before:-translate-x-1/2 before:border-8 before:border-transparent
          before:border-t-white
        "
      >
        {displayMessage}
      </div>

      {/* Cat face */}
      <div
        className={`text-6xl md:text-7xl select-none ${animation} cursor-default`}
        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
      >
        {MOOD_EMOJI[mood]}
      </div>
    </div>
  );
}
