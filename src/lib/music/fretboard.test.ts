import { describe, expect, test } from 'bun:test'
import { buildFretboard, openMidiNotes, visibleFretRange } from './fretboard'
import { noteNameToMidi } from './notes'

const STD_6 = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'].map(noteNameToMidi)

describe('open / 12th octave and detune', () => {
  test('open notes equal tuning plus detune', () => {
    expect(openMidiNotes(STD_6, 0)).toEqual(STD_6)
    expect(openMidiNotes(STD_6, -2)).toEqual(STD_6.map((n) => n - 2))
  })

  test('12th fret is one octave above open', () => {
    const board = buildFretboard(STD_6, 0, 24)
    for (let s = 0; s < STD_6.length; s++) {
      const open = board[s]?.[0]
      const twelfth = board[s]?.[12]
      expect(open).toBeDefined()
      expect(twelfth).toBeDefined()
      expect(twelfth?.midi).toBe(open?.midi + 12)
      expect(twelfth?.pitchClass).toBe(open?.pitchClass)
    }
  })

  test('detune shifts every fret by the same offset', () => {
    const plain = buildFretboard(STD_6, 0, 5)
    const detuned = buildFretboard(STD_6, -3, 5)
    expect(detuned[0]?.[3]?.midi).toBe((plain[0]?.[3]?.midi ?? 0) - 3)
  })
})

describe('visible fret windows', () => {
  test('all spans 0..fretCount', () => {
    expect(visibleFretRange(24, 'all')).toEqual({ start: 0, end: 24 })
  })

  test('low / mid / high windows', () => {
    expect(visibleFretRange(24, 'low')).toEqual({ start: 0, end: 12 })
    expect(visibleFretRange(24, 'mid')).toEqual({ start: 7, end: 19 })
    expect(visibleFretRange(24, 'high')).toEqual({ start: 12, end: 24 })
  })

  test('windows clamp to short necks', () => {
    expect(visibleFretRange(12, 'high')).toEqual({ start: 0, end: 12 })
    expect(visibleFretRange(12, 'mid')).toEqual({ start: 7, end: 12 })
  })
})
