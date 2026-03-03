import { useEffect, useRef, useState, useCallback } from 'react';
import { ALL_NOTES } from '../data/notes';

function midiNoteToId(midiNumber: number): string | null {
  const note = ALL_NOTES.find(n => n.midiNumber === midiNumber);
  return note?.id ?? null;
}

/**
 * Listens for Web MIDI input (e.g. Casio CTK-515 via USB).
 * Calls onNotePress whenever a Note On message is received.
 * isConnected is true when at least one MIDI input device is present.
 */
export function useMidi(onNotePress: (noteId: string) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const onNotePressRef = useRef(onNotePress);

  // Keep ref up to date so we don't need to re-attach MIDI listeners
  useEffect(() => {
    onNotePressRef.current = onNotePress;
  });

  const updateConnectionStatus = useCallback((access: MIDIAccess) => {
    const inputs = Array.from(access.inputs.values());
    setIsConnected(inputs.length > 0);
    setDeviceName(inputs[0]?.name ?? null);

    for (const input of inputs) {
      input.onmidimessage = (event: MIDIMessageEvent) => {
        const data = event.data;
        if (!data || data.length < 3) return;

        const status = data[0] & 0xf0; // Strip MIDI channel
        const noteNumber = data[1];
        const velocity = data[2];

        // Note On with velocity > 0 (velocity = 0 is treated as Note Off)
        if (status === 0x90 && velocity > 0) {
          const noteId = midiNoteToId(noteNumber);
          if (noteId) {
            onNotePressRef.current(noteId);
          }
        }
      };
    }
  }, []);

  useEffect(() => {
    // Feature-detect Web MIDI (Chrome/Edge only — Safari/Firefox don't support it)
    if (!('requestMIDIAccess' in navigator)) return;

    let midiAccess: MIDIAccess | null = null;

    navigator
      .requestMIDIAccess({ sysex: false })
      .then(access => {
        midiAccess = access;
        updateConnectionStatus(access);

        access.onstatechange = () => {
          updateConnectionStatus(access);
        };
      })
      .catch(() => {
        // MIDI not available — silently skip
      });

    return () => {
      if (midiAccess) {
        for (const input of midiAccess.inputs.values()) {
          input.onmidimessage = null;
        }
      }
    };
  }, [updateConnectionStatus]);

  return { isConnected, deviceName };
}
