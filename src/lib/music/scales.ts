export type ScaleDefinition = {
  id: string
  name: string
  category: string
  intervals: number[]
  labels: string[]
}

export const SCALES: ScaleDefinition[] = [
  {
    id: 'major',
    name: 'Major',
    category: 'Diatonic',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    labels: ['R', '2', '3', '4', '5', '6', '7'],
  },
  {
    id: 'natural-minor',
    name: 'Natural Minor',
    category: 'Diatonic',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    labels: ['R', '2', '♭3', '4', '5', '♭6', '♭7'],
  },
  {
    id: 'harmonic-minor',
    name: 'Harmonic Minor',
    category: 'Diatonic',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    labels: ['R', '2', '♭3', '4', '5', '♭6', '7'],
  },
  {
    id: 'melodic-minor',
    name: 'Melodic Minor',
    category: 'Diatonic',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    labels: ['R', '2', '♭3', '4', '5', '6', '7'],
  },
  {
    id: 'dorian',
    name: 'Dorian',
    category: 'Modes',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    labels: ['R', '2', '♭3', '4', '5', '6', '♭7'],
  },
  {
    id: 'phrygian',
    name: 'Phrygian',
    category: 'Modes',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    labels: ['R', '♭2', '♭3', '4', '5', '♭6', '♭7'],
  },
  {
    id: 'lydian',
    name: 'Lydian',
    category: 'Modes',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    labels: ['R', '2', '3', '♯4', '5', '6', '7'],
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian',
    category: 'Modes',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    labels: ['R', '2', '3', '4', '5', '6', '♭7'],
  },
  {
    id: 'locrian',
    name: 'Locrian',
    category: 'Modes',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    labels: ['R', '♭2', '♭3', '4', '♭5', '♭6', '♭7'],
  },
  {
    id: 'major-pentatonic',
    name: 'Major Pentatonic',
    category: 'Pentatonic',
    intervals: [0, 2, 4, 7, 9],
    labels: ['R', '2', '3', '5', '6'],
  },
  {
    id: 'minor-pentatonic',
    name: 'Minor Pentatonic',
    category: 'Pentatonic',
    intervals: [0, 3, 5, 7, 10],
    labels: ['R', '♭3', '4', '5', '♭7'],
  },
  {
    id: 'blues',
    name: 'Blues',
    category: 'Pentatonic',
    intervals: [0, 3, 5, 6, 7, 10],
    labels: ['R', '♭3', '4', '♭5', '5', '♭7'],
  },
  {
    id: 'whole-tone',
    name: 'Whole Tone',
    category: 'Symmetric',
    intervals: [0, 2, 4, 6, 8, 10],
    labels: ['R', '2', '3', '♯4', '♯5', '♭7'],
  },
  {
    id: 'diminished-wh',
    name: 'Diminished (W-H)',
    category: 'Symmetric',
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],
    labels: ['R', '2', '♭3', '4', '♭5', '♭6', '6', '7'],
  },
  {
    id: 'diminished-hw',
    name: 'Diminished (H-W)',
    category: 'Symmetric',
    intervals: [0, 1, 3, 4, 6, 7, 9, 10],
    labels: ['R', '♭2', '♭3', '3', '♭5', '5', '6', '♭7'],
  },
  {
    id: 'chromatic',
    name: 'Chromatic',
    category: 'Symmetric',
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    labels: ['R', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7'],
  },
  {
    id: 'altered',
    name: 'Altered',
    category: 'Exotic',
    intervals: [0, 1, 3, 4, 6, 8, 10],
    labels: ['R', '♭2', '♯2', '3', '♭5', '♯5', '♭7'],
  },
  {
    id: 'hungarian-minor',
    name: 'Hungarian Minor',
    category: 'Exotic',
    intervals: [0, 2, 3, 6, 7, 8, 11],
    labels: ['R', '2', '♭3', '♯4', '5', '♭6', '7'],
  },
  {
    id: 'persian',
    name: 'Persian',
    category: 'Exotic',
    intervals: [0, 1, 4, 5, 6, 8, 11],
    labels: ['R', '♭2', '3', '4', '♭5', '♭6', '7'],
  },
  {
    id: 'phrygian-dominant',
    name: 'Phrygian Dominant',
    category: 'Exotic',
    intervals: [0, 1, 4, 5, 7, 8, 10],
    labels: ['R', '♭2', '3', '4', '5', '♭6', '♭7'],
  },
]

export function getScaleById(id: string): ScaleDefinition | undefined {
  return SCALES.find((s) => s.id === id)
}

export function getScaleCategories(): string[] {
  return [...new Set(SCALES.map((s) => s.category))]
}

/** @deprecated Prefer collectionPitchClasses from collections.ts */
export function scalePitchClasses(root: number, scaleId: string): Set<number> {
  const scale = getScaleById(scaleId)
  if (!scale) return new Set()
  return new Set(
    scale.intervals.map((interval) => (((root + interval) % 12) + 12) % 12),
  )
}

/** @deprecated Prefer isInCollection from collections.ts */
export function isInScale(
  noteClass: number,
  root: number,
  scaleId: string,
): boolean {
  const scale = getScaleById(scaleId)
  if (!scale) return false
  const interval = (((noteClass - root) % 12) + 12) % 12
  return scale.intervals.includes(interval)
}
