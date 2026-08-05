import { describe, expect, test } from 'bun:test'
import {
  collectionIntervalLabel,
  collectionPitchClasses,
  degreeBucket,
  isInCollection,
} from './collections'

describe('degreeBucket', () => {
  test('maps perfect fourth separately from fifths', () => {
    expect(degreeBucket(0, 5)).toBe('fourth')
    expect(degreeBucket(0, 6)).toBe('fifth')
    expect(degreeBucket(0, 7)).toBe('fifth')
  })

  test('maps root, thirds, sevenths, and other', () => {
    expect(degreeBucket(0, 0)).toBe('root')
    expect(degreeBucket(0, 3)).toBe('third')
    expect(degreeBucket(0, 4)).toBe('third')
    expect(degreeBucket(0, 10)).toBe('seventh')
    expect(degreeBucket(0, 11)).toBe('seventh')
    expect(degreeBucket(0, 2)).toBe('other')
    expect(degreeBucket(0, 9)).toBe('other')
  })

  test('wraps relative to non-C roots', () => {
    // E root (4): A is P4 → interval 5
    expect(degreeBucket(4, 9)).toBe('fourth')
    // E root: B is P5 → interval 7
    expect(degreeBucket(4, 11)).toBe('fifth')
  })
})

describe('collection membership and labels', () => {
  test('minor pentatonic pitch classes from A', () => {
    const pcs = collectionPitchClasses(9, 'minor-pentatonic')
    expect([...pcs].sort((a, b) => a - b)).toEqual([0, 2, 4, 7, 9])
  })

  test('isInCollection for sus4 includes the fourth', () => {
    expect(isInCollection(5, 0, 'sus4')).toBe(true)
    expect(isInCollection(4, 0, 'sus4')).toBe(false)
  })

  test('collectionIntervalLabel uses collection labels when present', () => {
    expect(collectionIntervalLabel(0, 5, 'sus4')).toBe('4')
    expect(collectionIntervalLabel(0, 7, 'sus4')).toBe('5')
    expect(collectionIntervalLabel(0, 1, null)).toBe('♭2')
  })
})
