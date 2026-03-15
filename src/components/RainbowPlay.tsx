import { useState, useCallback, useEffect } from 'react';
import { Piano } from './Piano';
import { Mascot } from './Mascot';
import { KeyState } from '../types';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../hooks/useProgress';
import { useMidi } from '../hooks/useMidi';
import { useKeyboard } from '../hooks/useKeyboard';
import { useMicPitch } from '../hooks/useMicPitch';
import { getNoteById } from '../data/notes';

interface RainbowPlayProps {
  onBack: () => void;
}

type MascotMood = 'idle' | 'happy' | 'excited' | 'sad' | 'celebrate' | 'hint';

const ENCOURAGEMENTS = [
  'Beautiful! 🌟',
  'Lovely sound! 🎵',
  'Keep playing! ✨',
  'So musical! 🎶',
  'You\'re a star! ⭐',
  'Wonderful! 🌈',
  'Keep going! 🎹',
];

export function RainbowPlay({ onBack }: RainbowPlayProps) {
  const { playNote } = useAudio();
  const { startSession, endSession, recordKeyPress } = useProgress();
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({});
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [mascotMessage, setMascotMessage] = useState('Tap any key you like! 🎹');
  const [pressCount, setPressCount] = useState(0);

  useEffect(() => {
    startSession('rainbow');
    return () => {
      endSession({ mode: 'rainbow' });
    };
  }, [startSession, endSession]);

  const handleKeyPress = useCallback(async (noteId: string) => {
    const note = getNoteById(noteId);
    if (!note) return;

    recordKeyPress(noteId);
    setPressCount(c => c + 1);

    // Flash the pressed key
    setKeyStates(prev => ({ ...prev, [noteId]: 'correct' }));
    setTimeout(() => {
      setKeyStates(prev => {
        const next = { ...prev };
        delete next[noteId];
        return next;
      });
    }, 300);

    // Play the note
    await playNote(noteId);

    // Rotate encouragements
    const mood: MascotMood = Math.random() > 0.7 ? 'excited' : 'happy';
    setMascotMood(mood);
    setMascotMessage(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
    setTimeout(() => {
      setMascotMood('idle');
      setMascotMessage(`${note.animal} ${note.animalName}! 🎵`);
    }, 1500);
  }, [playNote, recordKeyPress]);

  // Physical keyboard (Casio via USB MIDI), computer keyboard, and microphone support
  const { isConnected: midiConnected, deviceName } = useMidi(handleKeyPress);
  useKeyboard(handleKeyPress);
  const { isListening: micListening, permissionDenied: micDenied, start: startMic, stop: stopMic } = useMicPitch(handleKeyPress);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 px-4 py-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 rounded-full transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl md:text-3xl font-black text-white">🌈 Rainbow Play</h1>
        <div className="bg-yellow-400 text-yellow-900 font-black px-3 py-1 rounded-full text-sm">
          {pressCount} 🎹
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {midiConnected && (
          <div className="bg-green-500/20 border border-green-400/50 rounded-full px-4 py-1 text-green-300 text-xs font-bold">
            🎹 {deviceName ?? 'Keyboard'} connected!
          </div>
        )}
        {micListening && (
          <div className="bg-orange-500/20 border border-orange-400/50 rounded-full px-4 py-1 text-orange-300 text-xs font-bold animate-pulse">
            🎤 Listening for piano...
          </div>
        )}
        <button
          onClick={micListening ? stopMic : startMic}
          className={`rounded-full px-4 py-1 text-xs font-bold border transition-colors ${
            micListening
              ? 'bg-orange-500/30 border-orange-400/60 text-orange-200 hover:bg-orange-500/50'
              : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
          }`}
        >
          {micListening ? '🎤 Stop Mic' : '🎤 Use Mic'}
        </button>
        {micDenied && (
          <span className="text-red-400 text-xs self-center">Mic access denied</span>
        )}
      </div>

      {/* Mascot */}
      <div className="mb-6">
        <Mascot mood={mascotMood} message={mascotMessage} />
      </div>

      {/* Instruction */}
      <div className="bg-white/10 rounded-2xl px-6 py-3 mb-6 text-center">
        <p className="text-white text-lg font-bold">
          Tap any colorful key to make music! 🎵
        </p>
      </div>

      {/* Piano */}
      <div className="w-full max-w-3xl bg-white/5 rounded-3xl p-4 shadow-2xl">
        <Piano
          keyStates={keyStates}
          onKeyPress={handleKeyPress}
          showAnimals={true}
          octaves={[3, 4, 5]}
        />
      </div>

      {/* Fun stat */}
      {pressCount > 0 && (
        <div className="mt-6 text-white/70 text-sm font-semibold">
          You pressed {pressCount} {pressCount === 1 ? 'key' : 'keys'}! 🌟
        </div>
      )}
    </div>
  );
}
