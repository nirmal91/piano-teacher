import { NoteDefinition } from '../types';

// Animals and colors cycle every 7 white keys (one octave)
const OCTAVE_ANIMALS = [
  { animal: '🐸', animalName: 'Froggy',  color: '#FF6B6B' }, // C
  { animal: '🐶', animalName: 'Doggy',   color: '#FF9F43' }, // D
  { animal: '🐱', animalName: 'Kitty',   color: '#FECA57' }, // E
  { animal: '🐰', animalName: 'Bunny',   color: '#48DBFB' }, // F
  { animal: '🐨', animalName: 'Koala',   color: '#A29BFE' }, // G
  { animal: '🦊', animalName: 'Foxy',    color: '#FD79A8' }, // A
  { animal: '🦋', animalName: 'Flutter', color: '#6C5CE7' }, // B
];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Casio CTK-515: 49 keys, C2 to C6
// MIDI note 36 = C2, 84 = C6
function buildNotes(): NoteDefinition[] {
  const notes: NoteDefinition[] = [];
  let whiteKeyIndex = 0; // tracks which octave-animal to assign

  for (let midi = 36; midi <= 84; midi++) {
    const noteIndex = (midi - 12) % 12; // 0=C, 1=C#, etc.
    const octave = Math.floor((midi - 12) / 12);
    const noteName = NOTE_NAMES[noteIndex];
    const isSharp = noteName.includes('#');

    // Tone.js uses 'Db' etc. for flats — we use sharps throughout
    const toneNote = noteName.replace('#', '#') + octave;

    let animal = '♪';
    let animalName = noteName;
    let color = '#ddd';

    if (!isSharp) {
      const whiteNoteNames = ['C','D','E','F','G','A','B'];
      const idx = whiteNoteNames.indexOf(noteName);
      const animalData = OCTAVE_ANIMALS[idx];
      animal = animalData.animal;
      animalName = animalData.animalName;
      color = animalData.color;
      whiteKeyIndex++;
    }

    notes.push({
      id: `${noteName.replace('#', 's')}${octave}`, // e.g. 'C4', 'Cs4'
      displayName: noteName,
      octave,
      isSharp,
      midiNumber: midi,
      animal,
      animalName,
      color,
      toneNote,
    });
  }

  return notes;
}

export const ALL_NOTES: NoteDefinition[] = buildNotes();

export const WHITE_NOTES = ALL_NOTES.filter(n => !n.isSharp);
export const BLACK_NOTES = ALL_NOTES.filter(n => n.isSharp);

export function getNoteById(id: NoteId): NoteDefinition | undefined {
  return ALL_NOTES.find(n => n.id === id);
}

// Helper: convert note ID like 'C4' or 'Cs4' to Tone.js format
export function idToTone(id: string): string {
  const note = ALL_NOTES.find(n => n.id === id);
  return note ? note.toneNote : id;
}

// Returns the sorted unique octaves needed to display a set of notes.
// Useful for showing the minimal piano range for a lesson.
export function getOctavesForNotes(noteIds: string[]): number[] {
  const octaveSet = new Set<number>();
  noteIds.forEach(id => {
    const note = getNoteById(id);
    if (note) octaveSet.add(note.octave);
  });
  return Array.from(octaveSet).sort((a, b) => a - b);
}

// Computer keyboard → note mapping (two octave layout, C3-C5)
export const KEYBOARD_MAP: Record<string, string> = {
  // Lower octave (C3-B3) — bottom row
  'z': 'C3', 'x': 'D3', 'c': 'E3', 'v': 'F3', 'b': 'G3', 'n': 'A3', 'm': 'B3',
  // Upper octave (C4-B4) — home row
  'a': 'C4', 's': 'D4', 'd': 'E4', 'f': 'F4', 'g': 'G4', 'h': 'A4', 'j': 'B4',
  // Even upper (C5) — q row
  'q': 'C5', 'w': 'D5', 'e': 'E5', 'r': 'F5', 't': 'G5',
};

type NoteId = string;
