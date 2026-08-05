import { describe, expect, test } from 'bun:test'
import {
  intervalName,
  midiToNoteName,
  midiToPitchClass,
  noteNameToMidi,
  pitchClassName,
} from './notes'

describe('noteNameToMidi', () => {
  test('parses scientific pitch names', () => {
    expect(noteNameToMidi('C4')).toBe(60)
    expect(noteNameToMidi('E2')).toBe(40)
    expect(noteNameToMidi('F#1')).toBe(30)
    expect(noteNameToMidi('Bb3')).toBe(58)
    expect(noteNameToMidi('A♯3')).toBe(58)
  })

  test('rejects invalid names', () => {
    expect(() => noteNameToMidi('H2')).toThrow()
    expect(() => noteNameToMidi('E')).toThrow()
  })
})

describe('pitch-class wrap', () => {
  test('wraps negative and large MIDI into 0–11', () => {
    expect(midiToPitchClass(60)).toBe(0)
    expect(midiToPitchClass(-1)).toBe(11)
    expect(midiToPitchClass(13)).toBe(1)
  })
})

describe('naming round-trips', () => {
  test('midi ↔ note name for common opens', () => {
    for (const name of ['E2', 'A2', 'D3', 'G3', 'B3', 'E4', 'B1', 'F#1']) {
      const midi = noteNameToMidi(name)
      expect(midiToNoteName(midi, 'sharps')).toBe(
        name.replace('b', '♭').replace('#', '♯'),
      )
    }
  })

  test('pitchClassName respects accidental display', () => {
    expect(pitchClassName(1, 'sharps')).toBe('C♯')
    expect(pitchClassName(1, 'flats')).toBe('D♭')
  })

  test('intervalName wraps from root', () => {
    expect(intervalName(0, 7)).toBe('5')
    expect(intervalName(0, 5)).toBe('4')
    expect(intervalName(11, 0)).toBe('♭2')
  })
})
