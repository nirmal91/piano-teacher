import { useEffect, useRef, useState, useCallback } from 'react';
import { ALL_NOTES } from '../data/notes';

// CTK-515 range: C2 (65 Hz) to C6 (1047 Hz) — give a little headroom
const MIN_FREQ = 58;
const MAX_FREQ = 1150;
const ONSET_THRESHOLD = 0.015;   // RMS level that means a note just started
const OFFSET_THRESHOLD = 0.008;  // RMS level that means the note has died
const MIN_ACTIVE_MS = 280;       // minimum time to stay "active" (prevents speaker echo re-triggering)

function getRMS(buf: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
  return Math.sqrt(sum / buf.length);
}

/**
 * Autocorrelation pitch detection, restricted to the CTK-515 frequency range.
 * Returns the detected fundamental frequency in Hz, or -1 if nothing clear.
 */
function detectPitch(buf: Float32Array, sampleRate: number): number {
  const minLag = Math.floor(sampleRate / MAX_FREQ);
  const maxLag = Math.min(Math.ceil(sampleRate / MIN_FREQ), Math.floor(buf.length / 2));
  const range = maxLag - minLag + 1;

  // Compute normalised autocorrelation for each lag
  const corrs = new Float32Array(range);
  for (let k = 0; k < range; k++) {
    const lag = minLag + k;
    let c = 0;
    const len = buf.length - lag;
    for (let i = 0; i < len; i++) c += buf[i] * buf[i + lag];
    corrs[k] = c / len;
  }

  // Pick the lag with the highest correlation (= the fundamental period)
  let maxC = 0;
  let maxK = -1;
  for (let k = 0; k < range; k++) {
    if (corrs[k] > maxC) {
      maxC = corrs[k];
      maxK = k;
    }
  }
  if (maxK < 0) return -1;

  const lag = minLag + maxK;

  // Sub-sample refinement via parabolic interpolation
  if (maxK > 0 && maxK < range - 1) {
    const y1 = corrs[maxK - 1];
    const y2 = corrs[maxK];
    const y3 = corrs[maxK + 1];
    const a = (y1 + y3 - 2 * y2) / 2;
    const b = (y3 - y1) / 2;
    if (a < 0) return sampleRate / (lag - b / (2 * a));
  }

  return sampleRate / lag;
}

function frequencyToNoteId(freq: number): string | null {
  if (freq <= 0) return null;
  // A4 = 440 Hz = MIDI 69
  const midi = Math.round(12 * Math.log2(freq / 440) + 69);
  return ALL_NOTES.find(n => n.midiNumber === midi)?.id ?? null;
}

/**
 * Listens to the laptop microphone and detects which piano note was played.
 * Calls onNotePress whenever a clear note onset is detected.
 *
 * Works by watching the RMS level:
 *   idle  → loud spike → detect pitch → fire note → active
 *   active → quiet again (after MIN_ACTIVE_MS) → idle → ready for next note
 *
 * The MIN_ACTIVE_MS cooldown prevents the speaker's own playback from
 * immediately re-triggering the mic.
 */
export function useMicPitch(onNotePress: (noteId: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const onNotePressRef = useRef(onNotePress);
  const micStateRef = useRef<'idle' | 'active'>('idle');
  const activeStartRef = useRef(0);
  const rafRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => { onNotePressRef.current = onNotePress; });

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    ctxRef.current?.close();
    streamRef.current = null;
    ctxRef.current = null;
    micStateRef.current = 'idle';
    setIsListening(false);
  }, []);

  const start = useCallback(async () => {
    setPermissionDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);

      const buf = new Float32Array(analyser.fftSize);
      setIsListening(true);

      const tick = () => {
        analyser.getFloatTimeDomainData(buf);
        const rms = getRMS(buf);

        if (micStateRef.current === 'idle') {
          if (rms > ONSET_THRESHOLD) {
            const freq = detectPitch(buf, ctx.sampleRate);
            const noteId = frequencyToNoteId(freq);
            if (noteId) {
              micStateRef.current = 'active';
              activeStartRef.current = Date.now();
              onNotePressRef.current(noteId);
            }
          }
        } else {
          // Stay active at least MIN_ACTIVE_MS to let speaker echo fade
          if (rms < OFFSET_THRESHOLD && Date.now() - activeStartRef.current > MIN_ACTIVE_MS) {
            micStateRef.current = 'idle';
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setPermissionDenied(true);
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { isListening, permissionDenied, start, stop };
}
