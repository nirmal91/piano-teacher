import { useState, useCallback, useEffect, useRef } from 'react';
import { ProgressData, ProgressSession, AppMode } from '../types';

const STORAGE_KEY = 'piano-adventure-progress';

const DEFAULT_PROGRESS: ProgressData = {
  childName: '',
  sessions: [],
  favoriteKeys: {},
  songsAttempted: [],
  songsCompleted: [],
  glowRoundsCompleted: 0,
  totalPlayTimeSeconds: 0,
};

function loadProgress(): ProgressData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_PROGRESS, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULT_PROGRESS };
}

function saveProgress(data: ProgressData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>(loadProgress);
  const sessionStartRef = useRef<number>(Date.now());
  const currentModeRef = useRef<'rainbow' | 'glow' | 'song'>('rainbow');

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const startSession = useCallback((mode: 'rainbow' | 'glow' | 'song') => {
    sessionStartRef.current = Date.now();
    currentModeRef.current = mode;
  }, []);

  const recordKeyPress = useCallback((noteId: string) => {
    setProgress(prev => ({
      ...prev,
      favoriteKeys: {
        ...prev.favoriteKeys,
        [noteId]: (prev.favoriteKeys[noteId] ?? 0) + 1,
      },
    }));
  }, []);

  const endSession = useCallback((extra: Partial<ProgressSession> = {}) => {
    const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
    const session: ProgressSession = {
      date: new Date().toISOString().split('T')[0],
      durationSeconds,
      mode: currentModeRef.current,
      ...extra,
    };
    setProgress(prev => ({
      ...prev,
      sessions: [...prev.sessions.slice(-49), session], // keep last 50
      totalPlayTimeSeconds: prev.totalPlayTimeSeconds + durationSeconds,
    }));
  }, []);

  const recordSongAttempt = useCallback((songId: string) => {
    setProgress(prev => ({
      ...prev,
      songsAttempted: prev.songsAttempted.includes(songId)
        ? prev.songsAttempted
        : [...prev.songsAttempted, songId],
    }));
  }, []);

  const recordSongComplete = useCallback((songId: string) => {
    setProgress(prev => ({
      ...prev,
      songsCompleted: prev.songsCompleted.includes(songId)
        ? prev.songsCompleted
        : [...prev.songsCompleted, songId],
    }));
  }, []);

  const recordGlowComplete = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      glowRoundsCompleted: prev.glowRoundsCompleted + 1,
    }));
  }, []);

  const getFavoriteKey = useCallback((): string | null => {
    const entries = Object.entries(progress.favoriteKeys);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }, [progress.favoriteKeys]);

  const getWeekSessions = useCallback((): ProgressSession[] => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoff = sevenDaysAgo.toISOString().split('T')[0];
    return progress.sessions.filter(s => s.date >= cutoff);
  }, [progress.sessions]);

  const setChildName = useCallback((name: string) => {
    setProgress(prev => ({ ...prev, childName: name }));
  }, []);

  const clearProgress = useCallback(() => {
    setProgress({ ...DEFAULT_PROGRESS });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    progress,
    startSession,
    endSession,
    recordKeyPress,
    recordSongAttempt,
    recordSongComplete,
    recordGlowComplete,
    getFavoriteKey,
    getWeekSessions,
    setChildName,
    clearProgress,
  };
}
