import { useState, useCallback, useEffect } from 'react';
import { Piano } from './Piano';
import { Mascot } from './Mascot';
import { Celebration } from './Celebration';
import { KeyState } from '../types';
import { useAudio } from '../hooks/useAudio';
import { useProgress } from '../hooks/useProgress';
import { useMidi } from '../hooks/useMidi';
import { useKeyboard } from '../hooks/useKeyboard';
import { useMicPitch } from '../hooks/useMicPitch';
import { SONGS } from '../data/songs';
import { getNoteById, getOctavesForNotes } from '../data/notes';

interface MagicSongProps {
  onBack: () => void;
}

type Phase = 'pick' | 'preview' | 'play' | 'done';
type MascotMood = 'idle' | 'happy' | 'excited' | 'sad' | 'celebrate' | 'hint';

export function MagicSong({ onBack }: MagicSongProps) {
  const { playNote, playSequence } = useAudio();
  const { startSession, endSession, recordSongAttempt, recordSongComplete, recordKeyPress } = useProgress();

  const [phase, setPhase] = useState<Phase>('pick');
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [noteIndex, setNoteIndex] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({});
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [mascotMessage, setMascotMessage] = useState('Pick a song to learn! 🎵');
  const [showCelebration, setShowCelebration] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const song = SONGS.find(s => s.id === selectedSongId) ?? null;
  const targetNoteId = song ? song.notes[noteIndex] : null;
  const targetNote = targetNoteId ? getNoteById(targetNoteId) : null;
  // Show only the octaves the current song needs
  const octaves = song ? getOctavesForNotes(song.notes) : [4];

  useEffect(() => {
    startSession('song');
    return () => endSession({ mode: 'song' });
  }, [startSession, endSession]);

  // Glow target key during play phase
  useEffect(() => {
    if (phase !== 'play' || !targetNoteId) return;
    setKeyStates({ [targetNoteId]: wrongAttempts >= 3 ? 'hint' : 'target' });
  }, [phase, targetNoteId, wrongAttempts]);

  const handleSongPick = useCallback(async (songId: string) => {
    setSelectedSongId(songId);
    recordSongAttempt(songId);
    setPhase('preview');
    setMascotMood('excited');
    setMascotMessage('Listen first! 🎵');

    const s = SONGS.find(s => s.id === songId);
    if (s) {
      await playSequence(s.notes, s.bpm);
      await new Promise(r => setTimeout(r, (s.notes.length / (s.bpm / 60)) * 1000 + 500));
    }
    setPhase('play');
    setNoteIndex(0);
    setWrongAttempts(0);
    setMascotMood('idle');
    setMascotMessage('Now you try! Tap the shiny key! ⭐');
  }, [playSequence, recordSongAttempt]);

  const handleKeyPress = useCallback(async (noteId: string) => {
    if (phase !== 'play' || isTransitioning || !song || !targetNoteId) return;

    recordKeyPress(noteId);
    await playNote(noteId);

    if (noteId === targetNoteId) {
      // Correct!
      setIsTransitioning(true);
      setKeyStates({ [noteId]: 'correct' });
      setMascotMood('happy');
      setMascotMessage('Yes! Perfect! 🌟');
      setWrongAttempts(0);

      const nextNoteIndex = noteIndex + 1;

      if (nextNoteIndex >= song.notes.length) {
        // Song complete!
        recordSongComplete(song.id);
        setMascotMood('celebrate');
        setMascotMessage('YOU FINISHED THE SONG! 🎉🎊');
        setTimeout(() => {
          setShowCelebration(true);
        }, 400);
      } else {
        setTimeout(() => {
          setNoteIndex(nextNoteIndex);
          setIsTransitioning(false);
          setMascotMood('idle');
          setMascotMessage(`Keep going! ${nextNoteIndex + 1} of ${song.notes.length} ✨`);
        }, 400);
      }
    } else {
      // Wrong
      setWrongAttempts(w => w + 1);
      setKeyStates(prev => ({ ...prev, [noteId]: 'wrong' }));
      setMascotMood('sad');
      setMascotMessage('Not that one! Try again! 💪');
      setTimeout(() => {
        setKeyStates({ [targetNoteId]: wrongAttempts + 1 >= 3 ? 'hint' : 'target' });
        setMascotMood('idle');
        setMascotMessage(`Find the shiny ${targetNote?.animal ?? ''}! ✨`);
      }, 600);
    }
  }, [phase, isTransitioning, song, targetNoteId, noteIndex, wrongAttempts, targetNote,
      playNote, recordKeyPress, recordSongComplete]);

  // Physical keyboard (Casio via USB MIDI), computer keyboard, and microphone support
  const { isConnected: midiConnected, deviceName } = useMidi(handleKeyPress);
  useKeyboard(handleKeyPress);
  const { isListening: micListening, permissionDenied: micDenied, start: startMic, stop: stopMic } = useMicPitch(handleKeyPress);

  const handleCelebrationDone = useCallback(() => {
    setShowCelebration(false);
    setPhase('pick');
    setSelectedSongId(null);
    setNoteIndex(0);
    setWrongAttempts(0);
    setIsTransitioning(false);
    setMascotMood('idle');
    setMascotMessage('Pick another song! 🎵');
  }, []);

  const handlePlayAgain = useCallback(() => {
    if (!song) return;
    setPhase('preview');
    setNoteIndex(0);
    setWrongAttempts(0);
    setIsTransitioning(false);
    handleSongPick(song.id);
  }, [song, handleSongPick]);

  // Song picker
  if (phase === 'pick') {
    return (
      <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-green-900 via-teal-900 to-blue-900 px-4 py-6">
        <div className="w-full flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 rounded-full transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-black text-white">🎵 Magic Songs</h1>
          <div className="w-16" />
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

        <div className="mb-6">
          <Mascot mood="idle" message={mascotMessage} />
        </div>

        <div className="w-full max-w-md grid grid-cols-1 gap-4">
          {SONGS.map(s => (
            <button
              key={s.id}
              onClick={() => handleSongPick(s.id)}
              className="
                bg-white/10 hover:bg-white/20 active:scale-95
                rounded-2xl p-5 text-left transition-all duration-150
                border-2 border-white/20 hover:border-white/40
                flex items-center gap-4
              "
            >
              <div className="text-4xl">{s.emoji}</div>
              <div className="flex-1">
                <div className="text-white font-black text-lg">{s.name}</div>
                <div className="text-white/60 text-sm">{s.description}</div>
                <div className="text-yellow-400 text-sm mt-0.5">
                  {'⭐'.repeat(s.difficulty)}{'☆'.repeat(3 - s.difficulty)}
                </div>
              </div>
              <div className="text-2xl">▶️</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Preview / Play phase
  const progress = song ? noteIndex / song.notes.length : 0;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-green-900 via-teal-900 to-blue-900 px-4 py-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={() => { setPhase('pick'); setSelectedSongId(null); }}
          className="bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 rounded-full transition-colors"
        >
          ← Songs
        </button>
        <div className="text-center">
          <div className="text-2xl">{song?.emoji}</div>
          <div className="text-white font-black text-sm">{song?.name}</div>
        </div>
        <button
          onClick={handlePlayAgain}
          className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-2 rounded-full text-sm transition-colors"
        >
          🔄 Again
        </button>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-3">
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

      {/* Phase banner */}
      {phase === 'preview' && (
        <div className="bg-yellow-400/20 border-2 border-yellow-400 rounded-2xl px-6 py-3 mb-4 text-center w-full max-w-sm">
          <div className="text-yellow-300 font-black text-lg animate-pulse">
            🎵 Listen to the song...
          </div>
        </div>
      )}

      {/* Progress */}
      {phase === 'play' && song && (
        <>
          <div className="w-full max-w-sm bg-white/20 rounded-full h-4 mb-3 overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="flex gap-2 mb-3 flex-wrap justify-center">
            {song.notes.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i < noteIndex ? 'bg-green-400'
                  : i === noteIndex ? 'bg-yellow-400 scale-125 animate-pulse'
                  : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Mascot */}
      <div className="mb-4">
        <Mascot mood={mascotMood} message={mascotMessage} />
      </div>

      {/* Piano — only shows the octaves the song needs */}
      <div className="w-full max-w-3xl bg-white/5 rounded-3xl p-4 shadow-2xl">
        <Piano
          keyStates={phase === 'play' ? keyStates : {}}
          onKeyPress={handleKeyPress}
          showAnimals={true}
          focusNoteId={targetNoteId ?? undefined}
          octaves={octaves}
        />
      </div>

      <Celebration
        show={showCelebration}
        message={`${song?.emoji} You played ${song?.name}! 🎊`}
        onDone={handleCelebrationDone}
      />
    </div>
  );
}
