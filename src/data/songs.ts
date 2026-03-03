import { Song, GlowSequence } from '../types';

export const SONGS: Song[] = [
  {
    id: 'cuckoo',
    name: 'Cuckoo Bird',
    emoji: '🐦',
    description: 'Just 2 keys! Start here!',
    notes: ['C4', 'G3', 'C4', 'G3', 'C4'],
    bpm: 60,
    difficulty: 1,
  },
  {
    id: 'hot-buns',
    name: 'Hot Cross Buns',
    emoji: '🍞',
    description: '3 keys — very easy!',
    notes: ['E4', 'D4', 'C4', 'E4', 'D4', 'C4'],
    bpm: 72,
    difficulty: 1,
  },
  {
    id: 'happy-song',
    name: 'Happy Song',
    emoji: '😊',
    description: '3 keys, up and up!',
    notes: ['C4', 'D4', 'E4', 'C4', 'D4', 'E4', 'E4'],
    bpm: 80,
    difficulty: 1,
  },
  {
    id: 'mary',
    name: 'Mary Mary',
    emoji: '🌸',
    description: '4 keys',
    notes: ['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4'],
    bpm: 72,
    difficulty: 2,
  },
  {
    id: 'little-star',
    name: 'Twinkle Star',
    emoji: '⭐',
    description: '4 keys — a classic!',
    notes: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4'],
    bpm: 72,
    difficulty: 2,
  },
  {
    id: 'ode-joy',
    name: 'Ode to Joy',
    emoji: '🎶',
    description: '5 keys — challenge!',
    notes: ['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'D4'],
    bpm: 80,
    difficulty: 3,
  },
];

// Sequences for "Follow the Glow" mode — ordered from simplest to more complex
export const GLOW_SEQUENCES: GlowSequence[] = [
  // Level 1 — single key, just explore
  {
    id: 'just-froggy',
    name: 'Find Froggy!',
    emoji: '🐸',
    notes: ['C4', 'C4', 'C4', 'C4'],
  },
  {
    id: 'just-c',
    name: 'Hello C!',
    emoji: '🟢',
    notes: ['C4', 'C4', 'C4'],
  },
  // Level 2 — two keys
  {
    id: 'c-d',
    name: 'Two Hops',
    emoji: '🐇',
    notes: ['C4', 'D4', 'C4', 'D4', 'C4'],
  },
  {
    id: 'c-e',
    name: 'Jump!',
    emoji: '🐸',
    notes: ['C4', 'E4', 'C4', 'E4'],
  },
  // Level 3 — three keys
  {
    id: 'c-to-e',
    name: 'Three Friends',
    emoji: '🌟',
    notes: ['C4', 'D4', 'E4'],
  },
  {
    id: 'e-d-c',
    name: 'Going Home',
    emoji: '🏠',
    notes: ['E4', 'D4', 'C4', 'D4', 'E4'],
  },
  // Level 4 — four/five keys
  {
    id: 'c-to-g',
    name: 'Five Steps',
    emoji: '🌈',
    notes: ['C4', 'D4', 'E4', 'F4', 'G4'],
  },
  {
    id: 'ceg',
    name: 'Magic Bounce',
    emoji: '✨',
    notes: ['C4', 'E4', 'G4', 'E4', 'C4'],
  },
  {
    id: 'ged',
    name: 'Going Down',
    emoji: '🎢',
    notes: ['G4', 'E4', 'C4', 'E4', 'G4'],
  },
  // Level 5 — longer patterns
  {
    id: 'cdefg',
    name: 'Rainbow Scale',
    emoji: '🌈',
    notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'F4', 'E4', 'D4', 'C4'],
  },
  {
    id: 'pattern1',
    name: 'Zigzag',
    emoji: '⚡',
    notes: ['C4', 'E4', 'D4', 'F4', 'E4', 'G4'],
  },
  // Level 6 — full octave challenges
  {
    id: 'c-to-a',
    name: 'Big Climb!',
    emoji: '🏔️',
    notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
  },
  {
    id: 'full-octave',
    name: 'All Keys!',
    emoji: '🎊',
    notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'],
  },
];
