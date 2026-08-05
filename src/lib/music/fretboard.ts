import { collectionPitchClasses } from './collections'
import { midiToPitchClass, type PitchClass } from './notes'

export const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24] as const
export const DOUBLE_DOT_FRETS = new Set([12, 24])

export type FretWindow = 'all' | 'low' | 'mid' | 'high'

export type FretboardPosition = {
  stringIndex: number
  fret: number
  midi: number
  pitchClass: PitchClass
}

/** Open MIDI per string after global detune. string 0 = lowest / thickest. */
export function openMidiNotes(
  tuning: number[],
  detuneOffset: number,
): number[] {
  return tuning.map((midi) => midi + detuneOffset)
}

export function noteAtFret(openMidi: number, fret: number): number {
  return openMidi + fret
}

export function buildFretboard(
  tuning: number[],
  detuneOffset: number,
  fretCount: number,
): FretboardPosition[][] {
  const opens = openMidiNotes(tuning, detuneOffset)
  return opens.map((openMidi, stringIndex) => {
    const positions: FretboardPosition[] = []
    for (let fret = 0; fret <= fretCount; fret++) {
      const midi = noteAtFret(openMidi, fret)
      positions.push({
        stringIndex,
        fret,
        midi,
        pitchClass: midiToPitchClass(midi),
      })
    }
    return positions
  })
}

/**
 * Highlight set = union of selected scale/chord notes and manually toggled notes.
 */
export function computeHighlightSet(
  selectedScale: { root: number; type: string } | null,
  highlightedNotes: ReadonlySet<number>,
): Set<number> {
  const result = new Set<number>(highlightedNotes)
  if (selectedScale) {
    for (const pc of collectionPitchClasses(
      selectedScale.root,
      selectedScale.type,
    )) {
      result.add(pc)
    }
  }
  return result
}

/** Visible fret span [start, end] inclusive of fretted notes; 0 = open. */
export function visibleFretRange(
  fretCount: number,
  window: FretWindow,
): { start: number; end: number } {
  const max = Math.max(fretCount, 1)
  switch (window) {
    case 'low':
      return { start: 0, end: Math.min(12, max) }
    case 'mid': {
      const start = Math.min(7, Math.max(0, max - 1))
      return { start, end: Math.min(19, max) }
    }
    case 'high':
      return { start: Math.max(0, max - 12), end: max }
    default:
      return { start: 0, end: max }
  }
}

/**
 * X positions for frets from `startFret`..`endFret` (inclusive).
 * Index in returned array maps to absolute fret number via startFret + i.
 * Uniform: equal spacing. Logarithmic: approximates real fretboard ratios
 * across the visible span.
 */
export function fretXPositionsInRange(
  startFret: number,
  endFret: number,
  nutX: number,
  boardWidth: number,
  uniform: boolean,
): Map<number, number> {
  const span = Math.max(endFret - startFret, 1)
  const map = new Map<number, number>()

  if (uniform) {
    const step = boardWidth / span
    for (let fret = startFret; fret <= endFret; fret++) {
      map.set(fret, nutX + (fret - startFret) * step)
    }
    return map
  }

  // Log spacing across the visible window as if it were frets 0..span
  const scaleLength = boardWidth / (1 - 2 ** (-span / 12))
  for (let fret = startFret; fret <= endFret; fret++) {
    const i = fret - startFret
    map.set(fret, nutX + scaleLength * (1 - 2 ** (-i / 12)))
  }
  return map
}

/** @deprecated Prefer fretXPositionsInRange */
export function fretXPositions(
  fretCount: number,
  nutX: number,
  boardWidth: number,
  uniform: boolean,
): number[] {
  const map = fretXPositionsInRange(0, fretCount, nutX, boardWidth, uniform)
  return Array.from({ length: fretCount + 1 }, (_, i) => map.get(i) ?? 0)
}

/** string 0 (lowest / thickest) at bottom; highest string at top. */
export function getStringYs(
  stringCount: number,
  topY: number,
  bottomY: number,
): number[] {
  if (stringCount <= 1) return [(topY + bottomY) / 2]
  return Array.from({ length: stringCount }, (_, i) => {
    const t = i / (stringCount - 1)
    return bottomY + (topY - bottomY) * t
  })
}
