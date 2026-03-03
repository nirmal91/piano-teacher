import { useRef, useEffect } from 'react';
import { NoteDefinition, KeyState } from '../types';
import { PianoKey } from './PianoKey';
import { ALL_NOTES } from '../data/notes';

interface PianoProps {
  keyStates: Record<string, KeyState>;
  onKeyPress: (noteId: string) => void;
  showAnimals?: boolean;
  focusNoteId?: string; // auto-scroll to this note
  /** Which octaves to show. Default: 3,4,5 (C3-C5) */
  octaves?: number[];
}

export function Piano({
  keyStates,
  onKeyPress,
  showAnimals = true,
  focusNoteId,
  octaves = [3, 4, 5],
}: PianoProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter notes to shown octaves
  const visibleNotes = ALL_NOTES.filter(n => octaves.includes(n.octave));

  // Scroll so target key is visible
  useEffect(() => {
    if (!focusNoteId || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-note="${focusNoteId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [focusNoteId]);

  // Build layout: group white keys, overlay black keys absolutely
  // We render white keys in a flex row, then black keys positioned on top
  const whiteNotes = visibleNotes.filter(n => !n.isSharp);
  const blackNotes = visibleNotes.filter(n => n.isSharp);

  const WHITE_KEY_WIDTH = 52; // px
  const BLACK_KEY_WIDTH = 32; // px
  const BLACK_KEY_HEIGHT = 112; // px

  // Map each black note to its pixel x position relative to the first white key
  function getBlackKeyX(blackNote: NoteDefinition): number {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const whiteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

    // Find which white key comes just before this black key
    const noteIdx = noteNames.indexOf(blackNote.displayName);
    const prevWhiteNote = whiteNotes.find(w => {
      const wIdx = noteNames.indexOf(w.displayName);
      return w.octave === blackNote.octave && wIdx === noteIdx - 1;
    });

    if (!prevWhiteNote) return 0;
    const prevWhiteIdx = whiteNotes.indexOf(prevWhiteNote);
    return prevWhiteIdx * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH * 0.65 - BLACK_KEY_WIDTH / 2;
  }

  const totalWidth = whiteNotes.length * WHITE_KEY_WIDTH;

  return (
    <div className="w-full overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div
        ref={containerRef}
        className="relative mx-auto"
        style={{ width: totalWidth, height: 180 }}
      >
        {/* White keys */}
        {whiteNotes.map((note, i) => (
          <div
            key={note.id}
            data-note={note.id}
            className="absolute top-0 bottom-0"
            style={{ left: i * WHITE_KEY_WIDTH, width: WHITE_KEY_WIDTH - 2, zIndex: 1 }}
          >
            <PianoKey
              note={note}
              state={keyStates[note.id] ?? 'normal'}
              onPress={onKeyPress}
              showAnimals={showAnimals}
            />
          </div>
        ))}

        {/* Black keys — rendered on top */}
        {blackNotes.map(note => {
          const x = getBlackKeyX(note);
          return (
            <div
              key={note.id}
              data-note={note.id}
              className="absolute top-0"
              style={{ left: x, width: BLACK_KEY_WIDTH, height: BLACK_KEY_HEIGHT, zIndex: 10 }}
            >
              <PianoKey
                note={note}
                state={keyStates[note.id] ?? 'normal'}
                onPress={onKeyPress}
                showAnimals={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
