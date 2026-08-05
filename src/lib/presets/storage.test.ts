import { afterEach, beforeAll, describe, expect, test } from 'bun:test'
import { BUILTIN_PRESETS } from './builtins'
import {
  defaultAppState,
  loadActiveState,
  loadUserPresets,
  normalizeTuning,
  saveActiveState,
  saveUserPresets,
} from './storage'

const PRESETS_KEY = 'thallboard:presets'

function installMemoryLocalStorage() {
  const store = new Map<string, string>()
  const memory: Storage = {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.has(key) ? (store.get(key) ?? null) : null
    },
    key(index: number) {
      return [...store.keys()][index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, String(value))
    },
  }
  Object.defineProperty(globalThis, 'localStorage', {
    value: memory,
    writable: true,
    configurable: true,
  })
}

beforeAll(() => {
  installMemoryLocalStorage()
})

afterEach(() => {
  localStorage.clear()
})

describe('normalizeTuning', () => {
  const fallback = [40, 45, 50, 55, 59, 64]

  test('clamps MIDI into 12–96 and syncs length', () => {
    expect(normalizeTuning([10, 45, 50, 55, 59, 64], fallback)).toEqual([
      12, 45, 50, 55, 59, 64,
    ])
    expect(
      normalizeTuning([40, 45, 50, 55, 59, 64, 69], fallback),
    ).toHaveLength(7)
    expect(normalizeTuning([40, 45], fallback)).toHaveLength(6)
  })

  test('falls back for empty or non-numeric input', () => {
    expect(normalizeTuning([], fallback)).toEqual(fallback)
    expect(normalizeTuning(['x'], fallback)).toEqual(fallback)
    expect(normalizeTuning(null, fallback)).toEqual(fallback)
  })
})

describe('loadActiveState invariants', () => {
  test('coerces interval labels to note when no scale is selected', () => {
    const base = defaultAppState()
    saveActiveState({
      ...base,
      selectedScale: null,
      labelMode: 'interval',
    })
    const loaded = loadActiveState()
    expect(loaded.selectedScale).toBeNull()
    expect(loaded.labelMode).toBe('note')
  })

  test('clears orphan activePresetId', () => {
    const base = defaultAppState()
    saveActiveState({
      ...base,
      activePresetId: 'user-does-not-exist',
    })
    const loaded = loadActiveState()
    expect(loaded.activePresetId).toBeNull()
  })

  test('keeps known builtin activePresetId', () => {
    const base = defaultAppState()
    saveActiveState({
      ...base,
      activePresetId: '7-std-b',
    })
    expect(loadActiveState().activePresetId).toBe('7-std-b')
  })
})

describe('user preset load normalization', () => {
  test('normalizes open notes and frets; drops malformed entries', () => {
    localStorage.setItem(
      PRESETS_KEY,
      JSON.stringify([
        {
          id: 'user-ok',
          name: 'Ok',
          stringCount: 6,
          frets: 48,
          openNotes: [5, 45, 50, 55, 59, 64],
          detune: 0,
        },
        { id: 'bad', name: 'Bad' },
        {
          id: 'user-empty',
          name: 'Empty',
          openNotes: [],
          frets: 24,
          detune: 0,
        },
      ]),
    )
    const presets = loadUserPresets()
    expect(presets).toHaveLength(1)
    expect(presets[0]?.id).toBe('user-ok')
    expect(presets[0]?.frets).toBe(24)
    expect(presets[0]?.openNotes[0]).toBe(12)
  })

  test('saveUserPresets round-trips', () => {
    saveUserPresets([
      {
        id: 'user-1',
        name: 'Mine',
        stringCount: 7,
        frets: 24,
        openNotes: [35, 40, 45, 50, 55, 59, 64],
        detune: -2,
        builtin: false,
      },
    ])
    const loaded = loadUserPresets()
    expect(loaded).toHaveLength(1)
    expect(loaded[0]?.name).toBe('Mine')
    expect(loaded[0]?.detune).toBe(-2)
  })
})

describe('builtin preset snapshot', () => {
  test('openNotes.length matches stringCount', () => {
    for (const preset of BUILTIN_PRESETS) {
      expect(preset.openNotes.length).toBe(preset.stringCount)
    }
  })
})
