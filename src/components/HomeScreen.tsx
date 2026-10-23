import { AppMode } from '../types';
import { useProgress } from '../hooks/useProgress';
import { SONGS } from '../data/songs';
import { getNoteById } from '../data/notes';

interface HomeScreenProps {
  onSelectMode: (mode: AppMode) => void;
  isLoadingAudio?: boolean;
}

export function HomeScreen({ onSelectMode, isLoadingAudio }: HomeScreenProps) {
  const { progress, getFavoriteKey } = useProgress();
  const favoriteKeyId = getFavoriteKey();
  const favoriteNote = favoriteKeyId ? getNoteById(favoriteKeyId) : null;
  const totalKeys = Object.values(progress.favoriteKeys).reduce((a, b) => a + b, 0);
  const name = progress.childName || null;

  const modes = [
    {
      id: 'rainbow' as AppMode,
      emoji: '🌈',
      title: 'Rainbow Play',
      subtitle: 'Tap any key!',
      bg: 'from-red-500 to-pink-600',
      border: 'border-red-400',
      shadow: 'shadow-red-500/50',
    },
    {
      id: 'glow' as AppMode,
      emoji: '⭐',
      title: 'Follow the Glow',
      subtitle: 'Tap the shiny one!',
      bg: 'from-yellow-500 to-orange-500',
      border: 'border-yellow-400',
      shadow: 'shadow-yellow-500/50',
    },
    {
      id: 'song' as AppMode,
      emoji: '🎵',
      title: 'Magic Songs',
      subtitle: 'Learn a tune!',
      bg: 'from-green-500 to-teal-500',
      border: 'border-green-400',
      shadow: 'shadow-green-500/50',
    },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-linear-to-b from-purple-950 via-indigo-950 to-blue-950 px-4 py-8">
      {/* Title */}
      <div className="text-center mb-6 animate-float">
        <div className="text-6xl mb-2">🎹</div>
        <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
          {name ? `${name}'s Piano!` : 'Piano Adventure!'}
        </h1>
        <p className="text-purple-300 text-lg font-bold mt-1">Let's make music! 🌟</p>
      </div>

      {/* Audio quality indicator */}
      {isLoadingAudio && (
        <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1 mb-4 text-white/40 text-xs font-semibold animate-pulse">
          🎵 Loading piano sounds...
        </div>
      )}

      {/* Stats strip */}
      {totalKeys > 0 && (
        <div className="bg-white/10 rounded-2xl px-6 py-3 mb-6 flex gap-6 text-center">
          <div>
            <div className="text-2xl font-black text-yellow-400">{totalKeys}</div>
            <div className="text-white/60 text-xs font-bold">Keys Pressed</div>
          </div>
          <div>
            <div className="text-2xl font-black text-green-400">{progress.songsCompleted.length}</div>
            <div className="text-white/60 text-xs font-bold">Songs Done</div>
          </div>
          <div>
            <div className="text-2xl font-black text-blue-400">{progress.glowRoundsCompleted}</div>
            <div className="text-white/60 text-xs font-bold">Glow Rounds</div>
          </div>
        </div>
      )}

      {/* Favorite key */}
      {favoriteNote && (
        <div className="bg-white/10 rounded-2xl px-6 py-3 mb-6 text-center">
          <p className="text-white/80 text-sm font-bold">
            Favorite key: {favoriteNote.animal}{' '}
            <span className="text-white">{favoriteNote.animalName}!</span>
          </p>
        </div>
      )}

      {/* Mode buttons */}
      <div className="w-full max-w-sm grid grid-cols-1 gap-5 mb-8">
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => onSelectMode(m.id)}
            className={`
              bg-linear-to-r ${m.bg}
              border-2 ${m.border}
              rounded-3xl p-6
              text-left flex items-center gap-5
              shadow-xl ${m.shadow}
              active:scale-95 hover:scale-105
              transition-all duration-150
              w-full
            `}
          >
            <span className="text-5xl animate-float" style={{ animationDelay: '0.2s' }}>
              {m.emoji}
            </span>
            <div>
              <div className="text-white font-black text-xl">{m.title}</div>
              <div className="text-white/80 text-sm font-semibold">{m.subtitle}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Parent button */}
      <button
        onClick={() => onSelectMode('parent')}
        className="text-white/40 hover:text-white/70 text-sm font-semibold transition-colors mt-2"
      >
        👨 Parent View
      </button>
    </div>
  );
}
