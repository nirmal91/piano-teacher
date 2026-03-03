import { useEffect, useRef } from 'react';
import { KEYBOARD_MAP } from '../data/notes';

/**
 * Maps computer keyboard keys to piano notes and calls onNotePress.
 * Uses the KEYBOARD_MAP from notes.ts (z/x/c = C3/D3/E3, a/s/d = C4/D4/E4, etc.)
 */
export function useKeyboard(onNotePress: (noteId: string) => void) {
  const onNotePressRef = useRef(onNotePress);

  // Keep ref current without re-registering the event listener
  useEffect(() => {
    onNotePressRef.current = onNotePress;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Ignore key-held-down events
      if (e.metaKey || e.ctrlKey || e.altKey) return; // Don't interfere with shortcuts
      const noteId = KEYBOARD_MAP[e.key.toLowerCase()];
      if (noteId) {
        e.preventDefault();
        onNotePressRef.current(noteId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
