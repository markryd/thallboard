import { describe, expect, test } from 'bun:test'
import { getPitchCollection } from './collections'
import { noteNameToMidi } from './notes'
import { getScaleById } from './scales'
import {
  selectThreeNpsPatterns,
  supportsThreeNps,
  type ThreeNpsPattern,
  threeNpsPatterns,
} from './threeNps'

const STD_6 = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'].map(noteNameToMidi)
const STD_7 = ['B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'].map(noteNameToMidi)
const MAJOR = getScaleById('major')?.intervals ?? []
const G = 7

describe('supportsThreeNps', () => {
  test('needs six strings and a seven-note scale', () => {
    expect(supportsThreeNps(6, getPitchCollection('major'))).toBe(true)
    expect(supportsThreeNps(6, getPitchCollection('dorian'))).toBe(true)
    expect(supportsThreeNps(7, getPitchCollection('major'))).toBe(false)
    expect(supportsThreeNps(6, getPitchCollection('minor-pentatonic'))).toBe(
      false,
    )
    expect(supportsThreeNps(6, getPitchCollection('diminished-wh'))).toBe(false)
    expect(supportsThreeNps(6, undefined)).toBe(false)
  })
})

describe('threeNpsPatterns', () => {
  const patterns = threeNpsPatterns(STD_6, G, MAJOR, 24)

  test('G major pattern 1 starts on the 3rd fret of the low E', () => {
    const p1 = patterns.find(
      (p) => p.degree === 0 && p.strings[0]?.minFret === 3,
    )
    expect(p1?.strings.map((s) => [s.minFret, s.maxFret])).toEqual([
      [3, 7],
      [3, 7],
      [4, 7],
      [4, 7],
      [5, 8],
      [5, 8],
    ])
  })

  test('every degree appears, and the pattern set repeats each octave', () => {
    const degrees = new Set(patterns.map((p) => p.degree))
    expect([...degrees].sort()).toEqual([0, 1, 2, 3, 4, 5, 6])
    for (const p of patterns) {
      const low = p.strings[0]?.minFret ?? 0
      if (low + 12 > 16) continue
      const twin = patterns.find(
        (q) => q.degree === p.degree && q.strings[0]?.minFret === low + 12,
      )
      expect(twin).toBeDefined()
    }
  })

  test('all patterns stay on the neck', () => {
    for (const p of patterns) {
      expect(p.strings).toHaveLength(6)
      for (const s of p.strings) {
        expect(s.minFret).toBeGreaterThanOrEqual(0)
        expect(s.maxFret).toBeLessThanOrEqual(24)
        expect(s.maxFret - s.minFret).toBeGreaterThanOrEqual(3)
        expect(s.maxFret - s.minFret).toBeLessThanOrEqual(4)
      }
    }
  })

  test('detune moves patterns with the tuning', () => {
    const detuned = threeNpsPatterns(
      STD_6.map((n) => n - 2),
      G - 2,
      MAJOR,
      24,
    )
    expect(detuned).toEqual(patterns)
  })

  test('drop D keeps three notes per string', () => {
    const dropD = [noteNameToMidi('D2'), ...STD_6.slice(1)]
    const result = threeNpsPatterns(dropD, 2, MAJOR, 24)
    expect(result.length).toBeGreaterThan(0)
    for (const p of result) expect(p.strings).toHaveLength(6)
  })

  test('works for any string count when called directly', () => {
    expect(threeNpsPatterns(STD_7, G, MAJOR, 24)[0]?.strings).toHaveLength(7)
  })
})

describe('selectThreeNpsPatterns', () => {
  const patterns = threeNpsPatterns(STD_6, G, MAJOR, 24)

  test('off, all and single modes', () => {
    expect(selectThreeNpsPatterns(patterns, 'off')).toEqual([])
    expect(selectThreeNpsPatterns(patterns, 'all')).toEqual(patterns)
    const p3 = selectThreeNpsPatterns(patterns, '3')
    expect(p3.length).toBeGreaterThan(0)
    for (const p of p3) expect(p.degree).toBe(2)
  })

  test('alternating keeps every second pattern, starting at pattern 1', () => {
    const alt = selectThreeNpsPatterns(patterns, 'alternating')
    const firstRoot = patterns.findIndex((p) => p.degree === 0)
    expect(alt).toContain(patterns[firstRoot] as ThreeNpsPattern)
    expect(alt).not.toContain(patterns[firstRoot + 1] as ThreeNpsPattern)
    expect(alt.length).toBe(
      patterns.filter((_, i) => (i - firstRoot) % 2 === 0).length,
    )
    // Neighbours in the drawn set are two degrees apart along the neck.
    for (let i = 1; i < alt.length; i++) {
      const prev = alt[i - 1]?.degree ?? 0
      expect(alt[i]?.degree).toBe((prev + 2) % 7)
    }
  })
})
