export type NoteId = string; // e.g. 'C4', 'Ds4', 'F4'

export interface NoteDefinition {
  id: NoteId;
  displayName: string;  // 'C', 'D', 'C#', etc.
  octave: number;
  isSharp: boolean;
  midiNumber: number;
  animal: string;       // emoji
  animalName: string;   // e.g. 'Froggy'
  color: string;        // hex color for white keys
  toneNote: string;     // format Tone.js needs, e.g. 'C4', 'Db4'
}

export interface Song {
  id: string;
  name: string;
  emoji: string;
  description: string;
  notes: NoteId[];
  bpm: number; // for preview playback
  difficulty: 1 | 2 | 3; // 1 = beginner (1-2 keys), 2 = medium, 3 = challenge
}

export type KeyState = 'normal' | 'target' | 'correct' | 'wrong' | 'hint';

export type AppMode = 'home' | 'rainbow' | 'glow' | 'song' | 'parent';

export interface GlowSequence {
  id: string;
  name: string;
  emoji: string;
  notes: NoteId[];
}

export interface ProgressSession {
  date: string;
  durationSeconds: number;
  mode: 'rainbow' | 'glow' | 'song';
  keysPressed?: number;
  correct?: number;
  attempts?: number;
  songId?: string;
  songCompleted?: boolean;
}

export interface ProgressData {
  childName: string;
  sessions: ProgressSession[];
  favoriteKeys: Record<NoteId, number>;
  songsAttempted: string[];
  songsCompleted: string[];
  glowRoundsCompleted: number;
  totalPlayTimeSeconds: number;
}
