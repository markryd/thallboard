import type { PitchCollection } from './collections'

/**
 * Three notes per string: off, every pattern, every second pattern along the
 * neck, or one pattern ('1'..'7').
 */
export type ThreeNpsMode =
  | 'off'
  | 'all'
  | 'alternating'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'

export const THREE_NPS_MODES: ThreeNpsMode[] = [
  'off',
  'all',
  'alternating',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
]

const NOTES_PER_STRING = 3

export type ThreeNpsString = {
  stringIndex: number
  minFret: number
  maxFret: number
}

export type ThreeNpsPattern = {
  /** Scale degree (0-based) of the first note on the lowest string. */
  degree: number
  /** Fret span per string, lowest string first. */
  strings: ThreeNpsString[]
}

/** 3NPS patterns are shown only for six-string tunings and seven-note scales. */
export function supportsThreeNps(
  stringCount: number,
  collection: Pick<PitchCollection, 'kind' | 'intervals'> | undefined,
): boolean {
  return (
    stringCount === 6 &&
    collection?.kind === 'scale' &&
    collection.intervals.length === 7
  )
}

/**
 * Every complete 3NPS pattern that fits on the neck.
 *
 * A pattern is a run of consecutive scale notes, three per string, starting
 * on the lowest string. Working in pitch rather than fret shapes means the
 * G–B major third, drop tunings and detune are handled by the tuning itself.
 * Patterns that would need a fret below 0 or above `fretCount` are skipped.
 */
export function threeNpsPatterns(
  openMidi: number[],
  root: number,
  intervals: number[],
  fretCount: number,
): ThreeNpsPattern[] {
  const stringCount = openMidi.length
  const lowest = openMidi[0]
  const highest = openMidi[stringCount - 1]
  if (stringCount === 0 || lowest == null || highest == null) return []
  if (intervals.length === 0) return []

  const scaleMidi: number[] = []
  for (let midi = lowest; midi <= highest + fretCount; midi++) {
    const interval = (((midi - root) % 12) + 12) % 12
    if (intervals.includes(interval)) scaleMidi.push(midi)
  }

  const noteCount = stringCount * NOTES_PER_STRING
  const patterns: ThreeNpsPattern[] = []

  for (let start = 0; start + noteCount <= scaleMidi.length; start++) {
    const strings: ThreeNpsString[] = []
    let fits = true

    for (let s = 0; s < stringCount && fits; s++) {
      const open = openMidi[s] ?? 0
      const first = scaleMidi[start + s * NOTES_PER_STRING]
      const last =
        scaleMidi[start + s * NOTES_PER_STRING + NOTES_PER_STRING - 1]
      if (first == null || last == null) {
        fits = false
        break
      }
      const minFret = first - open
      const maxFret = last - open
      if (minFret < 0 || maxFret > fretCount) fits = false
      strings.push({ stringIndex: s, minFret, maxFret })
    }

    const startMidi = scaleMidi[start]
    if (!fits || startMidi == null) continue
    const degree = intervals.indexOf((((startMidi - root) % 12) + 12) % 12)
    patterns.push({ degree, strings })
  }

  return patterns
}

/**
 * Patterns to draw for a mode. `patterns` must be in neck order, as returned
 * by threeNpsPatterns. Alternating keeps every second pattern, anchored so
 * the lowest pattern 1 is drawn. Seven patterns per octave is odd, so the
 * drawn set swaps degrees from one octave to the next.
 */
export function selectThreeNpsPatterns(
  patterns: ThreeNpsPattern[],
  mode: ThreeNpsMode,
): ThreeNpsPattern[] {
  if (mode === 'off') return []
  if (mode === 'all') return patterns
  if (mode === 'alternating') {
    const anchor = Math.max(
      0,
      patterns.findIndex((p) => p.degree === 0),
    )
    return patterns.filter((_, i) => (i - anchor) % 2 === 0)
  }
  return patterns.filter((p) => p.degree === Number(mode) - 1)
}
