import { useEffect, useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';
import { idToTone } from '../data/notes';

export function useAudio() {
  // Fallback synth — available instantly, no network needed
  const fallbackRef = useRef<Tone.PolySynth | null>(null);
  // High-quality Salamander piano sampler — loads from CDN in background
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const [isHighQuality, setIsHighQuality] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Create fallback synth immediately so the app is playable right away
    const fallback = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle8' },
      envelope: { attack: 0.01, decay: 0.25, sustain: 0.45, release: 1.2 },
      volume: -10,
    });
    const reverb = new Tone.Reverb({ decay: 1.2, wet: 0.15 }).toDestination();
    fallback.connect(reverb);
    fallbackRef.current = fallback;

    // Load high-quality piano samples in the background
    // Use a ref to avoid the stale closure bug with setTimeout
    const loadedRef = { current: false };

    const sampler = new Tone.Sampler({
      urls: {
        A0: 'A0.mp3', C1: 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3',
        A1: 'A1.mp3', C2: 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3',
        A2: 'A2.mp3', C3: 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3',
        A3: 'A3.mp3', C4: 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3',
        A4: 'A4.mp3', C5: 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3',
        A5: 'A5.mp3', C6: 'C6.mp3',
      },
      release: 1.5,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      onload: () => {
        loadedRef.current = true;
        samplerRef.current = sampler;
        setIsHighQuality(true);
      },
    }).toDestination();

    // If samples don't load within 15s, stay on fallback synth (not an error)
    const timeout = setTimeout(() => {
      if (!loadedRef.current) {
        setLoadError(true);
      }
    }, 15000);

    return () => {
      clearTimeout(timeout);
      try { sampler.dispose(); } catch { /* ignore */ }
      try { fallback.dispose(); } catch { /* ignore */ }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playNote = useCallback(async (noteId: string, duration = '4n') => {
    try {
      await Tone.start();
      const toneNote = idToTone(noteId);
      const instrument = samplerRef.current ?? fallbackRef.current;
      instrument?.triggerAttackRelease(toneNote, duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }, []);

  const playSequence = useCallback(async (noteIds: string[], bpm = 80) => {
    try {
      await Tone.start();
      const instrument = samplerRef.current ?? fallbackRef.current;
      if (!instrument) return;
      noteIds.forEach((noteId, i) => {
        const toneNote = idToTone(noteId);
        const time = i * (60 / bpm);
        instrument.triggerAttackRelease(toneNote, '4n', `+${time}`);
      });
    } catch (e) {
      console.warn('Sequence play error:', e);
    }
  }, []);

  const playSuccess = useCallback(async () => {
    await playSequence(['C4', 'E4', 'G4', 'C5'], 200);
  }, [playSequence]);

  const playComplete = useCallback(async () => {
    await playSequence(['C4', 'E4', 'G4', 'E4', 'G4', 'C5'], 160);
  }, [playSequence]);

  // isLoaded is always true — fallback synth is ready immediately
  return { isLoaded: true, loadError, isHighQuality, playNote, playSequence, playSuccess, playComplete };
}
