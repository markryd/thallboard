import { CHORDS, getChordById } from './chords'
import { INTERVAL_NAMES } from './notes'
import { getScaleById, SCALES } from './scales'

export type PitchCollection = {
  id: string
  name: string
  category: string
  intervals: number[]
  labels: string[]
  kind: 'scale' | 'chord'
}

export function getPitchCollection(id: string): PitchCollection | undefined {
  const scale = getScaleById(id)
  if (scale) return { ...scale, kind: 'scale' }
  const chord = getChordById(id)
  if (chord) return { ...chord, kind: 'chord' }
  return undefined
}

export function allPitchCollections(): PitchCollection[] {
  return [
    ...SCALES.map((s) => ({ ...s, kind: 'scale' as const })),
    ...CHORDS.map((c) => ({ ...c, kind: 'chord' as const })),
  ]
}

export function getCollectionCategories(): string[] {
  return [...new Set(allPitchCollections().map((c) => c.category))]
}

export function collectionPitchClasses(
  root: number,
  typeId: string,
): Set<number> {
  const col = getPitchCollection(typeId)
  if (!col) return new Set()
  return new Set(
    col.intervals.map((interval) => (((root + interval) % 12) + 12) % 12),
  )
}

export function isInCollection(
  noteClass: number,
  root: number,
  typeId: string,
): boolean {
  const col = getPitchCollection(typeId)
  if (!col) return false
  const interval = (((noteClass - root) % 12) + 12) % 12
  return col.intervals.includes(interval)
}

/** Scale/chord-aware interval label; falls back to chromatic flats. */
export function collectionIntervalLabel(
  root: number,
  note: number,
  typeId: string | null | undefined,
): string {
  const interval = (((note - root) % 12) + 12) % 12
  if (typeId) {
    const col = getPitchCollection(typeId)
    if (col) {
      const idx = col.intervals.indexOf(interval)
      const label = idx >= 0 ? col.labels[idx] : undefined
      if (label) return label
    }
  }
  return INTERVAL_NAMES[interval] ?? 'R'
}

export type DegreeBucket =
  | 'root'
  | 'third'
  | 'fourth'
  | 'fifth'
  | 'seventh'
  | 'other'

/** Interval class from root → degree color bucket. */
export function degreeBucket(root: number, note: number): DegreeBucket {
  const interval = (((note - root) % 12) + 12) % 12
  if (interval === 0) return 'root'
  if (interval === 3 || interval === 4) return 'third'
  if (interval === 5) return 'fourth'
  if (interval === 6 || interval === 7) return 'fifth'
  if (interval === 10 || interval === 11) return 'seventh'
  return 'other'
}
