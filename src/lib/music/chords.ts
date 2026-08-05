export type ChordDefinition = {
  id: string
  name: string
  category: string
  intervals: number[]
  labels: string[]
}

export const CHORDS: ChordDefinition[] = [
  {
    id: 'power',
    name: 'Power (5)',
    category: 'Chords / arpeggios',
    intervals: [0, 7],
    labels: ['R', '5'],
  },
  {
    id: 'sus2',
    name: 'Sus2',
    category: 'Chords / arpeggios',
    intervals: [0, 2, 7],
    labels: ['R', '2', '5'],
  },
  {
    id: 'sus4',
    name: 'Sus4',
    category: 'Chords / arpeggios',
    intervals: [0, 5, 7],
    labels: ['R', '4', '5'],
  },
  {
    id: 'minor-triad',
    name: 'Minor triad',
    category: 'Chords / arpeggios',
    intervals: [0, 3, 7],
    labels: ['R', '♭3', '5'],
  },
  {
    id: 'major-triad',
    name: 'Major triad',
    category: 'Chords / arpeggios',
    intervals: [0, 4, 7],
    labels: ['R', '3', '5'],
  },
  {
    id: 'min7',
    name: 'Minor 7',
    category: 'Chords / arpeggios',
    intervals: [0, 3, 7, 10],
    labels: ['R', '♭3', '5', '♭7'],
  },
  {
    id: 'maj7',
    name: 'Major 7',
    category: 'Chords / arpeggios',
    intervals: [0, 4, 7, 11],
    labels: ['R', '3', '5', '7'],
  },
  {
    id: 'dom7',
    name: 'Dominant 7',
    category: 'Chords / arpeggios',
    intervals: [0, 4, 7, 10],
    labels: ['R', '3', '5', '♭7'],
  },
  {
    id: 'dim7',
    name: 'Diminished 7',
    category: 'Chords / arpeggios',
    intervals: [0, 3, 6, 9],
    labels: ['R', '♭3', '♭5', '𝄫7'],
  },
  {
    id: 'm7b5',
    name: 'Minor 7♭5',
    category: 'Chords / arpeggios',
    intervals: [0, 3, 6, 10],
    labels: ['R', '♭3', '♭5', '♭7'],
  },
  {
    id: 'add9',
    name: 'Add 9',
    category: 'Chords / arpeggios',
    intervals: [0, 2, 4, 7],
    labels: ['R', '9', '3', '5'],
  },
  {
    id: 'min9',
    name: 'Minor 9',
    category: 'Chords / arpeggios',
    intervals: [0, 2, 3, 7, 10],
    labels: ['R', '9', '♭3', '5', '♭7'],
  },
  {
    id: 'min11',
    name: 'Minor 11',
    category: 'Chords / arpeggios',
    intervals: [0, 2, 3, 5, 7, 10],
    labels: ['R', '9', '♭3', '11', '5', '♭7'],
  },
]

export function getChordById(id: string): ChordDefinition | undefined {
  return CHORDS.find((c) => c.id === id)
}
