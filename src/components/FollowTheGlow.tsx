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
import { GLOW_SEQUENCES } from '../data/songs';
import { getNoteById, getOctavesForNotes } from '../data/notes';

interface FollowTheGlowProps {
  onBack: () => void;
}

type MascotMood = 'idle' | 'happy' | 'excited' | 'sad' | 'celebrate' | 'hint';

export function FollowTheGlow({ onBack }: FollowTheGlowProps) {
  const { playNote, playComplete } = useAudio();
  const { startSession, endSession, recordGlowComplete, recordKeyPress } = useProgress();

  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [noteIndex, setNoteIndex] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({});
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [mascotMessage, setMascotMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState('');
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sequence = GLOW_SEQUENCES[sequenceIndex % GLOW_SEQUENCES.length];
  const targetNoteId = sequence.notes[noteIndex];
  const targetNote = getNoteById(targetNoteId);
  // Show only the octaves the sequence actually uses — keeps the keyboard simple
  const octaves = getOctavesForNotes(sequence.notes);

  useEffect(() => {
    startSession('glow');
    return () => endSession({ mode: 'glow' });
  }, [startSession, endSession]);

  // Set target key to glow
  useEffect(() => {
    if (!targetNoteId) return;
    setKeyStates({ [targetNoteId]: wrongAttempts >= 3 ? 'hint' : 'target' });
    setMascotMood(wrongAttempts >= 3 ? 'hint' : 'idle');
    setMascotMessage(
      wrongAttempts >= 3
        ? `Tap the green one! 🟢`
        : `Tap the shiny ${targetNote?.animal ?? ''}!`
    );
  }, [targetNoteId, wrongAttempts, targetNote]);

  const advanceNote = useCallback(async (noteId: string) => {
    if (isTransitioning) return;
    const nextNoteIndex = noteIndex + 1;

    if (nextNoteIndex >= sequence.notes.length) {
      // Sequence complete!
      setIsTransitioning(true);
      setKeyStates({ [noteId]: 'correct' });
      setMascotMood('celebrate');
      setMascotMessage('YOU DID IT! 🎉');
      recordGlowComplete();
      await playComplete();
      setCelebrationMsg(`${sequence.emoji} ${sequence.name} - Amazing!`);
      setShowCelebration(true);
    } else {
      setKeyStates({ [noteId]: 'correct' });
      setMascotMood('happy');
      setMascotMessage('Great! Next one! ⭐');
      setTimeout(() => {
        setNoteIndex(nextNoteIndex);
        setWrongAttempts(0);
        setIsTransitioning(false);
      }, 400);
    }
  }, [isTransitioning, noteIndex, sequence, playComplete, recordGlowComplete]);

  const handleKeyPress = useCallback(async (noteId: string) => {
    if (isTransitioning) return;

    recordKeyPress(noteId);
    setAttempts(a => a + 1);
    await playNote(noteId);

    if (noteId === targetNoteId) {
      setCorrect(c => c + 1);
      setWrongAttempts(0);
      await advanceNote(noteId);
    } else {
      // Wrong key
      setWrongAttempts(w => w + 1);
      setKeyStates(prev => ({ ...prev, [noteId]: 'wrong' }));
      setMascotMood('sad');
      setMascotMessage('Try again! You got this! 💪');
      setTimeout(() => {
        setKeyStates({ [targetNoteId]: wrongAttempts + 1 >= 3 ? 'hint' : 'target' });
        setMascotMood('idle');
        setMascotMessage(`Find the shiny ${targetNote?.animal ?? ''}! ✨`);
      }, 600);
    }
  }, [isTransitioning, targetNoteId, playNote, advanceNote, wrongAttempts, targetNote, recordKeyPress]);

  // Physical keyboard (Casio via USB MIDI), computer keyboard, and microphone support
  const { isConnected: midiConnected, deviceName } = useMidi(handleKeyPress);
  useKeyboard(handleKeyPress);
  const { isListening: micListening, permissionDenied: micDenied, start: startMic, stop: stopMic } = useMicPitch(handleKeyPress);

  const handleCelebrationDone = useCallback(() => {
    setShowCelebration(false);
    // Move to next sequence
    const nextSeqIdx = sequenceIndex + 1;
    setSequenceIndex(nextSeqIdx);
    setNoteIndex(0);
    setWrongAttempts(0);
    setIsTransitioning(false);
    setMascotMood('idle');
    setMascotMessage('');
  }, [sequenceIndex]);

  const progress = sequence ? noteIndex / sequence.notes.length : 0;

  return (
    <div className="flex flex-col items-center min-h-screen bg-linear-to-b from-indigo-900 via-purple-900 to-pink-900 px-4 py-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 rounded-full transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-xl md:text-2xl font-black text-white">⭐ Follow the Glow</h1>
        <div className="text-white/70 text-sm font-bold">
          {correct}/{attempts > 0 ? attempts : '-'}
        </div>
      </div>

      {/* Input source badges */}
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

      {/* Sequence info */}
      {sequence && (
        <div className="bg-white/10 rounded-2xl px-6 py-3 mb-4 text-center">
          <div className="text-3xl mb-1">{sequence.emoji}</div>
          <div className="text-white font-black text-lg">{sequence.name}</div>
        </div>
      )}

      {/* Progress bar */}
      {sequence && (
        <div className="w-full max-w-sm bg-white/20 rounded-full h-4 mb-4 overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Note progress dots */}
      {sequence && (
        <div className="flex gap-2 mb-4 flex-wrap justify-center">
          {sequence.notes.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < noteIndex ? 'bg-green-400 scale-100'
                : i === noteIndex ? 'bg-yellow-400 scale-125 animate-pulse'
                : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}

      {/* Mascot */}
      <div className="mb-4">
        <Mascot mood={mascotMood} message={mascotMessage || `Tap the shiny ${targetNote?.animal ?? ''}!`} />
      </div>

      {/* Piano — only shows the octaves this sequence needs */}
      <div className="w-full max-w-3xl bg-white/5 rounded-3xl p-4 shadow-2xl">
        <Piano
          keyStates={keyStates}
          onKeyPress={handleKeyPress}
          showAnimals={true}
          focusNoteId={targetNoteId}
          octaves={octaves}
        />
      </div>

      <Celebration
        show={showCelebration}
        message={celebrationMsg}
        onDone={handleCelebrationDone}
      />
    </div>
  );
}
