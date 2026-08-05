export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
export type AccidentalDisplay = 'sharps' | 'flats'

export const NOTE_NAMES_SHARP = [
  'C',
  'C♯',
  'D',
  'D♯',
  'E',
  'F',
  'F♯',
  'G',
  'G♯',
  'A',
  'A♯',
  'B',
] as const

export const NOTE_NAMES_FLAT = [
  'C',
  'D♭',
  'D',
  'E♭',
  'E',
  'F',
  'G♭',
  'G',
  'A♭',
  'A',
  'B♭',
  'B',
] as const

export const PITCH_CLASSES = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
] as const satisfies readonly PitchClass[]

export const INTERVAL_NAMES = [
  'R',
  '♭2',
  '2',
  '♭3',
  '3',
  '4',
  '♭5',
  '5',
  '♭6',
  '6',
  '♭7',
  '7',
] as const

/** Parse scientific pitch like "E2", "F#1", "Bb3" into MIDI note number. */
export function noteNameToMidi(name: string): number {
  const match = name.match(/^([A-Ga-g])([#b♯♭]?)(-?\d+)$/)
  if (!match) {
    throw new Error(`Invalid note name: ${name}`)
  }

  const letter = match[1]?.toUpperCase()
  if (!letter) {
    throw new Error(`Invalid note name: ${name}`)
  }
  const accidental = match[2] ?? ''
  const octave = Number(match[3])

  const letterOffsets: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  }

  let pc = letterOffsets[letter] ?? 0
  if (accidental === '#' || accidental === '♯') pc += 1
  if (accidental === 'b' || accidental === '♭') pc -= 1

  // MIDI: C4 = 60 → C0 = 12 → formula: (octave + 1) * 12 + pc
  return (octave + 1) * 12 + ((pc + 12) % 12)
}

export function midiToPitchClass(midi: number): PitchClass {
  return (((midi % 12) + 12) % 12) as PitchClass
}

export function pitchClassName(
  pc: number,
  display: AccidentalDisplay = 'sharps',
): string {
  const names = display === 'flats' ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP
  return names[((pc % 12) + 12) % 12] ?? 'C'
}

export function midiToNoteName(
  midi: number,
  display: AccidentalDisplay = 'sharps',
): string {
  const pc = midiToPitchClass(midi)
  const octave = Math.floor(midi / 12) - 1
  return `${pitchClassName(pc, display)}${octave}`
}

export function intervalName(root: number, note: number): string {
  const interval = (((note - root) % 12) + 12) % 12
  return INTERVAL_NAMES[interval] ?? 'R'
}
