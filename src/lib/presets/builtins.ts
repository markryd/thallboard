import { noteNameToMidi } from '@/lib/music/notes'

export type StringCount = 6 | 7 | 8 | 9

export type TuningPreset = {
  id: string
  name: string
  stringCount: StringCount
  frets: number
  /** string 0 = lowest / thickest (guitar string N); last = highest / thinnest (guitar string 1) */
  openNotes: number[]
  detune: number
  builtin?: boolean
}

function midi(...names: string[]): number[] {
  return names.map(noteNameToMidi)
}

const STD_6 = midi('E2', 'A2', 'D3', 'G3', 'B3', 'E4')
const DROP_D_6 = midi('D2', 'A2', 'D3', 'G3', 'B3', 'E4')
const DROP_C_6 = midi('C2', 'G2', 'C3', 'F3', 'A3', 'D4')
const DROP_B_6 = midi('B1', 'F#2', 'B2', 'E3', 'G#3', 'C#4')
const DROP_A_6 = midi('A1', 'E2', 'A2', 'D3', 'F#3', 'B3')
const STD_7 = midi('B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4')
const DROP_A_7 = midi('A1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4')
const STD_8 = midi('F#1', 'B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4')
const DROP_E_8 = midi('E1', 'B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4')
const STD_9 = midi('C#1', 'F#1', 'B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4')
const DROP_B_9 = midi('B0', 'F#1', 'B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4')

export const BUILTIN_PRESETS: TuningPreset[] = [
  // 6-string
  {
    id: '6-std-e',
    name: '6 · Std E',
    stringCount: 6,
    frets: 24,
    openNotes: STD_6,
    detune: 0,
    builtin: true,
  },
  {
    id: '6-drop-d',
    name: '6 · Drop D',
    stringCount: 6,
    frets: 24,
    openNotes: DROP_D_6,
    detune: 0,
    builtin: true,
  },
  {
    id: '6-drop-c',
    name: '6 · Drop C',
    stringCount: 6,
    frets: 24,
    openNotes: DROP_C_6,
    detune: 0,
    builtin: true,
  },
  {
    id: '6-drop-b',
    name: '6 · Drop B',
    stringCount: 6,
    frets: 24,
    openNotes: DROP_B_6,
    detune: 0,
    builtin: true,
  },
  {
    id: '6-drop-a',
    name: '6 · Drop A',
    stringCount: 6,
    frets: 24,
    openNotes: DROP_A_6,
    detune: 0,
    builtin: true,
  },
  {
    id: '6-std-d',
    name: '6 · Std D (−2)',
    stringCount: 6,
    frets: 24,
    openNotes: STD_6,
    detune: -2,
    builtin: true,
  },
  {
    id: '6-std-csharp',
    name: '6 · Std C♯ (−3)',
    stringCount: 6,
    frets: 24,
    openNotes: STD_6,
    detune: -3,
    builtin: true,
  },
  {
    id: '6-std-c',
    name: '6 · Std C (−4)',
    stringCount: 6,
    frets: 24,
    openNotes: STD_6,
    detune: -4,
    builtin: true,
  },

  // 7-string (user tunings)
  {
    id: '7-std-b',
    name: '7 · Std B',
    stringCount: 7,
    frets: 24,
    openNotes: STD_7,
    detune: 0,
    builtin: true,
  },
  {
    id: '7-drop-a',
    name: '7 · Drop A',
    stringCount: 7,
    frets: 24,
    openNotes: DROP_A_7,
    detune: 0,
    builtin: true,
  },
  {
    id: '7-std-asharp',
    name: '7 · Std A♯ (−1)',
    stringCount: 7,
    frets: 24,
    openNotes: STD_7,
    detune: -1,
    builtin: true,
  },
  {
    id: '7-drop-gsharp',
    name: '7 · Drop G♯ (−1)',
    stringCount: 7,
    frets: 24,
    openNotes: DROP_A_7,
    detune: -1,
    builtin: true,
  },
  {
    id: '7-drop-fsharp',
    name: '7 · Drop F♯ (−3)',
    stringCount: 7,
    frets: 24,
    openNotes: DROP_A_7,
    detune: -3,
    builtin: true,
  },
  {
    id: '7-std-g',
    name: '7 · Std G (−4)',
    stringCount: 7,
    frets: 24,
    openNotes: STD_7,
    detune: -4,
    builtin: true,
  },
  {
    id: '7-drop-f',
    name: '7 · Drop F (−4)',
    stringCount: 7,
    frets: 24,
    openNotes: DROP_A_7,
    detune: -4,
    builtin: true,
  },
  {
    id: '7-std-fsharp',
    name: '7 · Std F♯ (−5)',
    stringCount: 7,
    frets: 24,
    openNotes: STD_7,
    detune: -5,
    builtin: true,
  },
  {
    id: '7-drop-e',
    name: '7 · Drop E (−5)',
    stringCount: 7,
    frets: 24,
    openNotes: DROP_A_7,
    detune: -5,
    builtin: true,
  },
  {
    id: '7-std-f',
    name: '7 · Std F (−6)',
    stringCount: 7,
    frets: 24,
    openNotes: STD_7,
    detune: -6,
    builtin: true,
  },
  {
    id: '7-drop-dsharp',
    name: '7 · Drop D♯ (−6)',
    stringCount: 7,
    frets: 24,
    openNotes: DROP_A_7,
    detune: -6,
    builtin: true,
  },

  // 8-string (user tunings)
  {
    id: '8-std-fsharp',
    name: '8 · Std F♯',
    stringCount: 8,
    frets: 24,
    openNotes: STD_8,
    detune: 0,
    builtin: true,
  },
  {
    id: '8-drop-e',
    name: '8 · Drop E',
    stringCount: 8,
    frets: 24,
    openNotes: DROP_E_8,
    detune: 0,
    builtin: true,
  },
  {
    id: '8-std-f',
    name: '8 · Std F (−1)',
    stringCount: 8,
    frets: 24,
    openNotes: STD_8,
    detune: -1,
    builtin: true,
  },
  {
    id: '8-drop-dsharp',
    name: '8 · Drop D♯ (−1)',
    stringCount: 8,
    frets: 24,
    openNotes: DROP_E_8,
    detune: -1,
    builtin: true,
  },
  {
    id: '8-std-e',
    name: '8 · Std E (−2)',
    stringCount: 8,
    frets: 24,
    openNotes: STD_8,
    detune: -2,
    builtin: true,
  },
  {
    id: '8-drop-d',
    name: '8 · Drop D (−2)',
    stringCount: 8,
    frets: 24,
    openNotes: DROP_E_8,
    detune: -2,
    builtin: true,
  },
  {
    id: '8-std-dsharp',
    name: '8 · Std D♯ (−3)',
    stringCount: 8,
    frets: 24,
    openNotes: STD_8,
    detune: -3,
    builtin: true,
  },
  {
    id: '8-drop-csharp',
    name: '8 · Drop C♯ (−3)',
    stringCount: 8,
    frets: 24,
    openNotes: DROP_E_8,
    detune: -3,
    builtin: true,
  },
  {
    id: '8-std-d',
    name: '8 · Std D (−4)',
    stringCount: 8,
    frets: 24,
    openNotes: STD_8,
    detune: -4,
    builtin: true,
  },
  {
    id: '8-drop-c',
    name: '8 · Drop C (−4)',
    stringCount: 8,
    frets: 24,
    openNotes: DROP_E_8,
    detune: -4,
    builtin: true,
  },

  // 9-string
  {
    id: '9-std-csharp',
    name: '9 · Std C♯',
    stringCount: 9,
    frets: 24,
    openNotes: STD_9,
    detune: 0,
    builtin: true,
  },
  {
    id: '9-drop-b',
    name: '9 · Drop B',
    stringCount: 9,
    frets: 24,
    openNotes: DROP_B_9,
    detune: 0,
    builtin: true,
  },
  {
    id: '9-std-c',
    name: '9 · Std C (−1)',
    stringCount: 9,
    frets: 24,
    openNotes: STD_9,
    detune: -1,
    builtin: true,
  },
  {
    id: '9-drop-asharp',
    name: '9 · Drop A♯ (−1)',
    stringCount: 9,
    frets: 24,
    openNotes: DROP_B_9,
    detune: -1,
    builtin: true,
  },
  {
    id: '9-std-b',
    name: '9 · Std B (−2)',
    stringCount: 9,
    frets: 24,
    openNotes: STD_9,
    detune: -2,
    builtin: true,
  },
  {
    id: '9-drop-a',
    name: '9 · Drop A (−2)',
    stringCount: 9,
    frets: 24,
    openNotes: DROP_B_9,
    detune: -2,
    builtin: true,
  },
  {
    id: '9-std-asharp',
    name: '9 · Std A♯ (−3)',
    stringCount: 9,
    frets: 24,
    openNotes: STD_9,
    detune: -3,
    builtin: true,
  },
  {
    id: '9-drop-gsharp',
    name: '9 · Drop G♯ (−3)',
    stringCount: 9,
    frets: 24,
    openNotes: DROP_B_9,
    detune: -3,
    builtin: true,
  },
  {
    id: '9-std-a',
    name: '9 · Std A (−4)',
    stringCount: 9,
    frets: 24,
    openNotes: STD_9,
    detune: -4,
    builtin: true,
  },
  {
    id: '9-drop-g',
    name: '9 · Drop G (−4)',
    stringCount: 9,
    frets: 24,
    openNotes: DROP_B_9,
    detune: -4,
    builtin: true,
  },
]

/** Default to 7-string Std B (primary extended-range tuning). */
export const DEFAULT_PRESET =
  BUILTIN_PRESETS.find((p) => p.id === '7-std-b') ??
  BUILTIN_PRESETS[0] ??
  (() => {
    throw new Error('BUILTIN_PRESETS is empty')
  })()

/** Default when six-string-only mode is on. */
export const SIX_STRING_DEFAULT_PRESET =
  BUILTIN_PRESETS.find((p) => p.id === '6-std-e') ?? DEFAULT_PRESET

/** Guitar string number: 1 = highest/thinnest, N = lowest/thickest. */
export function guitarStringNumber(
  arrayIndex: number,
  stringCount: number,
): number {
  return stringCount - arrayIndex
}

/** Array index (low→high) for a guitar string number (1 = high). */
export function arrayIndexForGuitarString(
  guitarString: number,
  stringCount: number,
): number {
  return stringCount - guitarString
}

/** Default open notes when changing string count. */
export function defaultTuningForStringCount(count: StringCount): number[] {
  const match = BUILTIN_PRESETS.find(
    (p) => p.stringCount === count && p.detune === 0 && p.name.includes('Std'),
  )
  return match ? [...match.openNotes] : [...DEFAULT_PRESET.openNotes]
}
