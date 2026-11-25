import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  type AccidentalDisplay,
  midiToNoteName,
  PITCH_CLASSES,
  pitchClassName,
} from '@/lib/music/notes'
import {
  arrayIndexForGuitarString,
  defaultTuningForStringCount,
  guitarStringNumber,
  type StringCount,
} from '@/lib/presets/builtins'

const STRING_COUNTS: StringCount[] = [6, 7, 8, 9]
const OCTAVES = [0, 1, 2, 3, 4, 5]
const MIDI_MIN = 12
const MIDI_MAX = 96

type TuningControlsProps = {
  tuning: number[]
  detuneOffset: number
  fretCount: number
  accidentalDisplay: AccidentalDisplay
  showStringCount: boolean
  onTuningChange: (tuning: number[]) => void
  onDetuneChange: (detune: number) => void
  onFretCountChange: (frets: number) => void
  onStringCountChange: (tuning: number[], detune: number) => void
}

function clampMidi(n: number): number {
  return Math.min(MIDI_MAX, Math.max(MIDI_MIN, n))
}

export function TuningControls({
  tuning,
  detuneOffset,
  fretCount,
  accidentalDisplay,
  showStringCount,
  onTuningChange,
  onDetuneChange,
  onFretCountChange,
  onStringCountChange,
}: TuningControlsProps) {
  const stringCount = (
    STRING_COUNTS.includes(tuning.length as StringCount) ? tuning.length : 6
  ) as StringCount

  const displayOrder = Array.from({ length: tuning.length }, (_, i) => i + 1)

  function nudgeString(index: number, delta: number) {
    const current = tuning[index]
    if (current == null) return
    const next = [...tuning]
    next[index] = clampMidi(current + delta)
    onTuningChange(next)
  }

  function dropLowest() {
    const lowest = tuning[0]
    if (lowest == null) return
    const next = [...tuning]
    next[0] = clampMidi(lowest - 2)
    onTuningChange(next)
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold tracking-wide text-foreground">
        Tuning
      </h2>

      {showStringCount ? (
        <div className="max-w-[7rem] space-y-2">
          <Label htmlFor="string-count">Strings</Label>
          <Select
            value={String(stringCount)}
            onValueChange={(value) => {
              if (!value) return
              const count = Number(value) as StringCount
              onStringCountChange(defaultTuningForStringCount(count), 0)
            }}
          >
            <SelectTrigger id="string-count" aria-label="String count">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STRING_COUNTS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="fret-count">
          Frets: <span className="font-mono tabular-nums">{fretCount}</span>
        </Label>
        <Slider
          id="fret-count"
          min={12}
          max={24}
          step={1}
          value={[fretCount]}
          onValueChange={(value) => {
            const next = value[0]
            if (typeof next === 'number') onFretCountChange(next)
          }}
          aria-label={`Frets: ${fretCount}`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="detune">
          Global detune:{' '}
          <span className="font-mono tabular-nums">
            {detuneOffset > 0 ? `+${detuneOffset}` : detuneOffset}
          </span>{' '}
          semitones
        </Label>
        <Slider
          id="detune"
          min={-12}
          max={12}
          step={1}
          value={[detuneOffset]}
          onValueChange={(value) => {
            const next = value[0]
            if (typeof next === 'number') onDetuneChange(next)
          }}
          aria-label={`Global detune: ${detuneOffset} semitones`}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs">Open strings (Str 1 = high)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={dropLowest}
          >
            Drop lowest −2
          </Button>
        </div>
        <div className="space-y-1">
          {displayOrder.map((guitarStr) => {
            const index = arrayIndexForGuitarString(guitarStr, tuning.length)
            const midi = tuning[index]
            if (midi == null) return null
            const pc = ((midi % 12) + 12) % 12
            const octave = Math.floor(midi / 12) - 1
            return (
              <div
                key={guitarStr}
                className="flex items-center gap-1.5 text-sm"
              >
                <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">
                  {guitarStringNumber(index, tuning.length)}
                </span>
                <Select
                  value={String(pc)}
                  onValueChange={(value) => {
                    if (value == null) return
                    const nextPc = Number(value)
                    const next = [...tuning]
                    next[index] = clampMidi((octave + 1) * 12 + nextPc)
                    onTuningChange(next)
                  }}
                >
                  <SelectTrigger
                    className="h-8 w-20"
                    aria-label={`String ${guitarStringNumber(index, tuning.length)} note`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PITCH_CLASSES.map((pitchClass) => (
                      <SelectItem key={pitchClass} value={String(pitchClass)}>
                        {pitchClassName(pitchClass, accidentalDisplay)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={String(octave)}
                  onValueChange={(value) => {
                    if (value == null) return
                    const nextOct = Number(value)
                    const next = [...tuning]
                    next[index] = clampMidi((nextOct + 1) * 12 + pc)
                    onTuningChange(next)
                  }}
                >
                  <SelectTrigger
                    className="h-8 w-16"
                    aria-label={`String ${guitarStringNumber(index, tuning.length)} octave`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OCTAVES.map((o) => (
                      <SelectItem key={o} value={String(o)}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    aria-label={`Lower string ${guitarStringNumber(index, tuning.length)} one semitone`}
                    onClick={() => nudgeString(index, -1)}
                  >
                    <Minus />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    aria-label={`Raise string ${guitarStringNumber(index, tuning.length)} one semitone`}
                    onClick={() => nudgeString(index, 1)}
                  >
                    <Plus />
                  </Button>
                </div>
                <span className="min-w-0 truncate font-mono text-[11px] text-muted-foreground">
                  {midiToNoteName(midi + detuneOffset, accidentalDisplay)}
                  {detuneOffset !== 0 ? ' snd' : ''}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
