import { getPitchCollection } from '@/lib/music/collections'
import type { FretWindow } from '@/lib/music/fretboard'
import type { AccidentalDisplay } from '@/lib/music/notes'
import { THREE_NPS_MODES, type ThreeNpsMode } from '@/lib/music/threeNps'
import {
  BUILTIN_PRESETS,
  DEFAULT_PRESET,
  defaultTuningForStringCount,
  type StringCount,
  type TuningPreset,
} from './builtins'

const PRESETS_KEY = 'thallboard:presets'
const ACTIVE_KEY = 'thallboard:active:v2'

export type LabelMode = 'note' | 'interval' | 'off'

export type AppState = {
  tuning: number[]
  detuneOffset: number
  fretCount: number
  selectedScale: { root: number; type: string } | null
  highlightedNotes: number[]
  accidentalDisplay: AccidentalDisplay
  labelMode: LabelMode
  showAllNotes: boolean
  uniformSpacing: boolean
  degreeColors: boolean
  fretWindow: FretWindow
  lefty: boolean
  threeNps: ThreeNpsMode
  activePresetId: string | null
}

export type PersistedActive = Omit<AppState, 'highlightedNotes'> & {
  highlightedNotes: number[]
}

const LABEL_MODES: LabelMode[] = ['note', 'interval', 'off']
const FRET_WINDOWS: FretWindow[] = ['all', 'low', 'mid', 'high']

export function defaultAppState(): AppState {
  return {
    tuning: [...DEFAULT_PRESET.openNotes],
    detuneOffset: DEFAULT_PRESET.detune,
    fretCount: DEFAULT_PRESET.frets,
    selectedScale: { root: 0, type: 'minor-pentatonic' },
    highlightedNotes: [],
    accidentalDisplay: 'sharps',
    labelMode: 'note',
    showAllNotes: false,
    uniformSpacing: true,
    degreeColors: true,
    fretWindow: 'all',
    lefty: false,
    threeNps: 'off',
    activePresetId: DEFAULT_PRESET.id,
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function clampStringCount(n: number): StringCount {
  if (n <= 6) return 6
  if (n === 7) return 7
  if (n === 8) return 8
  return 9
}

export function normalizeTuning(tuning: unknown, fallback: number[]): number[] {
  if (!Array.isArray(tuning) || tuning.length === 0) return [...fallback]
  const nums = tuning.filter((n): n is number => typeof n === 'number')
  if (nums.length === 0) return [...fallback]
  const count = clampStringCount(nums.length)
  if (nums.length === count)
    return nums.map((n) => clamp(Math.round(n), 12, 96))
  if (nums.length > count)
    return nums.slice(0, count).map((n) => clamp(Math.round(n), 12, 96))
  const pad = defaultTuningForStringCount(count)
  return [...nums, ...pad.slice(nums.length)].map((n) =>
    clamp(Math.round(n), 12, 96),
  )
}

function normalizeSelectedScale(
  value: AppState['selectedScale'] | undefined,
  base: AppState['selectedScale'],
): AppState['selectedScale'] {
  if (value === null) return null
  if (!value || typeof value !== 'object') return base
  const root =
    typeof value.root === 'number' ? ((value.root % 12) + 12) % 12 : 0
  const type = typeof value.type === 'string' ? value.type : ''
  if (!getPitchCollection(type)) return base
  return { root, type }
}

function normalizeUserPreset(raw: unknown): TuningPreset | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Partial<TuningPreset>
  if (typeof p.id !== 'string' || typeof p.name !== 'string') return null
  if (!Array.isArray(p.openNotes) || p.openNotes.length === 0) return null
  const nums = p.openNotes.filter((n): n is number => typeof n === 'number')
  if (nums.length === 0) return null

  const stringCount = clampStringCount(nums.length)
  const fallback = defaultTuningForStringCount(stringCount)
  const openNotes = normalizeTuning(p.openNotes, fallback)
  const frets =
    typeof p.frets === 'number' ? clamp(Math.round(p.frets), 12, 24) : 24
  const detune =
    typeof p.detune === 'number' ? clamp(Math.round(p.detune), -12, 12) : 0

  return {
    id: p.id,
    name: p.name,
    stringCount: clampStringCount(openNotes.length),
    frets,
    openNotes,
    detune,
    builtin: false,
  }
}

export function loadUserPresets(): TuningPreset[] {
  try {
    const fromLegacy = !localStorage.getItem(PRESETS_KEY)
    const raw = localStorage.getItem(PRESETS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const presets = parsed
      .map((p) => normalizeUserPreset(p))
      .filter((p): p is TuningPreset => p !== null)
    if (fromLegacy && presets.length > 0) {
      try {
        localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
      } catch {
        // ignore
      }
    }
    return presets
  } catch {
    return []
  }
}

export function saveUserPresets(presets: TuningPreset[]): void {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
  } catch {
    // ignore quota / private mode
  }
}

export function allPresets(userPresets: TuningPreset[]): TuningPreset[] {
  return [...BUILTIN_PRESETS, ...userPresets]
}

export function loadActiveState(): AppState {
  try {
    const fromLegacy = !localStorage.getItem(ACTIVE_KEY)
    const raw = localStorage.getItem(ACTIVE_KEY)
    if (!raw) return defaultAppState()
    const parsed = JSON.parse(raw) as Partial<PersistedActive>
    const base = defaultAppState()
    const selectedScale = normalizeSelectedScale(
      parsed.selectedScale,
      base.selectedScale,
    )
    let labelMode: LabelMode = LABEL_MODES.includes(
      parsed.labelMode as LabelMode,
    )
      ? (parsed.labelMode as LabelMode)
      : base.labelMode
    if (selectedScale === null && labelMode === 'interval') {
      labelMode = 'note'
    }

    const userPresets = loadUserPresets()
    const knownIds = new Set(allPresets(userPresets).map((p) => p.id))
    let activePresetId: string | null =
      typeof parsed.activePresetId === 'string' ||
      parsed.activePresetId === null
        ? parsed.activePresetId
        : base.activePresetId
    if (activePresetId !== null && !knownIds.has(activePresetId)) {
      activePresetId = null
    }

    const state: AppState = {
      ...base,
      tuning: normalizeTuning(parsed.tuning, base.tuning),
      detuneOffset:
        typeof parsed.detuneOffset === 'number'
          ? clamp(Math.round(parsed.detuneOffset), -12, 12)
          : base.detuneOffset,
      fretCount:
        typeof parsed.fretCount === 'number'
          ? clamp(Math.round(parsed.fretCount), 12, 24)
          : base.fretCount,
      selectedScale,
      highlightedNotes: Array.isArray(parsed.highlightedNotes)
        ? [
            ...new Set(
              parsed.highlightedNotes
                .filter((n): n is number => typeof n === 'number')
                .map((n) => ((n % 12) + 12) % 12),
            ),
          ].sort((a, b) => a - b)
        : [],
      accidentalDisplay:
        parsed.accidentalDisplay === 'flats' ||
        parsed.accidentalDisplay === 'sharps'
          ? parsed.accidentalDisplay
          : base.accidentalDisplay,
      labelMode,
      showAllNotes:
        typeof parsed.showAllNotes === 'boolean'
          ? parsed.showAllNotes
          : base.showAllNotes,
      uniformSpacing:
        typeof parsed.uniformSpacing === 'boolean'
          ? parsed.uniformSpacing
          : base.uniformSpacing,
      degreeColors:
        typeof parsed.degreeColors === 'boolean'
          ? parsed.degreeColors
          : base.degreeColors,
      fretWindow: FRET_WINDOWS.includes(parsed.fretWindow as FretWindow)
        ? (parsed.fretWindow as FretWindow)
        : base.fretWindow,
      lefty: typeof parsed.lefty === 'boolean' ? parsed.lefty : base.lefty,
      threeNps: THREE_NPS_MODES.includes(parsed.threeNps as ThreeNpsMode)
        ? (parsed.threeNps as ThreeNpsMode)
        : base.threeNps,
      activePresetId,
    }
    if (fromLegacy) {
      try {
        localStorage.setItem(ACTIVE_KEY, JSON.stringify(state))
      } catch {
        // ignore
      }
    }
    return state
  } catch {
    return defaultAppState()
  }
}

export function saveActiveState(state: AppState): void {
  try {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota / private mode
  }
}

export function createUserPreset(
  name: string,
  state: Pick<AppState, 'tuning' | 'detuneOffset' | 'fretCount'>,
): TuningPreset {
  const stringCount = clampStringCount(state.tuning.length)
  return {
    id: `user-${crypto.randomUUID()}`,
    name,
    stringCount,
    frets: state.fretCount,
    openNotes: [...state.tuning],
    detune: state.detuneOffset,
    builtin: false,
  }
}

export function applyPreset(preset: TuningPreset): Partial<AppState> {
  return {
    tuning: [...preset.openNotes],
    detuneOffset: preset.detune,
    fretCount: preset.frets,
    activePresetId: preset.id,
  }
}
