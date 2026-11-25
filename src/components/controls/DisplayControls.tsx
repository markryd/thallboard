import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { FretWindow } from '@/lib/music/fretboard'
import type { AccidentalDisplay } from '@/lib/music/notes'
import { THREE_NPS_MODES, type ThreeNpsMode } from '@/lib/music/threeNps'
import type { LabelMode } from '@/lib/presets/storage'
import { cn } from '@/lib/utils'

type DisplayControlsProps = {
  accidentalDisplay: AccidentalDisplay
  labelMode: LabelMode
  showAllNotes: boolean
  uniformSpacing: boolean
  degreeColors: boolean
  fretWindow: FretWindow
  lefty: boolean
  hasScaleOrChord: boolean
  threeNps: ThreeNpsMode
  /** Degree labels of the selected scale, or null when 3NPS does not apply. */
  threeNpsLabels: string[] | null
  onAccidentalChange: (value: AccidentalDisplay) => void
  onLabelModeChange: (value: LabelMode) => void
  onShowAllNotesChange: (value: boolean) => void
  onUniformSpacingChange: (value: boolean) => void
  onDegreeColorsChange: (value: boolean) => void
  onFretWindowChange: (value: FretWindow) => void
  onLeftyChange: (value: boolean) => void
  onThreeNpsChange: (value: ThreeNpsMode) => void
}

function ControlField({
  label,
  htmlFor,
  labelId,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  labelId?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <Label
        htmlFor={htmlFor}
        id={labelId}
        className="text-xs leading-none text-muted-foreground"
      >
        {label}
      </Label>
      <div className="flex min-h-8 min-w-0 items-center">{children}</div>
    </div>
  )
}

export function DisplayControls({
  accidentalDisplay,
  labelMode,
  showAllNotes,
  uniformSpacing,
  degreeColors,
  fretWindow,
  lefty,
  hasScaleOrChord,
  threeNps,
  threeNpsLabels,
  onAccidentalChange,
  onLabelModeChange,
  onShowAllNotesChange,
  onUniformSpacingChange,
  onDegreeColorsChange,
  onFretWindowChange,
  onLeftyChange,
  onThreeNpsChange,
}: DisplayControlsProps) {
  const npsAvailable = threeNpsLabels !== null
  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:gap-x-8 lg:gap-y-3">
      {/* Primary controls — stay as a trio when space allows */}
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <ControlField label="Fret window" htmlFor="fret-window">
          <Select
            value={fretWindow}
            onValueChange={(value) => {
              if (
                value === 'all' ||
                value === 'low' ||
                value === 'mid' ||
                value === 'high'
              ) {
                onFretWindowChange(value)
              }
            }}
          >
            <SelectTrigger
              id="fret-window"
              className="h-8 w-[8.5rem]"
              aria-label="Fret window"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">0–12</SelectItem>
              <SelectItem value="mid">7–19</SelectItem>
              <SelectItem value="high">Top 12</SelectItem>
            </SelectContent>
          </Select>
        </ControlField>

        <ControlField label="Accidentals" labelId="accidentals-label">
          <ToggleGroup
            type="single"
            value={accidentalDisplay}
            onValueChange={(value) => {
              if (value === 'sharps' || value === 'flats') {
                onAccidentalChange(value)
              }
            }}
            className="flex-nowrap"
            aria-labelledby="accidentals-label"
          >
            <ToggleGroupItem
              value="sharps"
              className="h-8 px-2.5 text-xs"
              aria-label="Sharps"
            >
              ♯
            </ToggleGroupItem>
            <ToggleGroupItem
              value="flats"
              className="h-8 px-2.5 text-xs"
              aria-label="Flats"
            >
              ♭
            </ToggleGroupItem>
          </ToggleGroup>
        </ControlField>

        <ControlField label="Labels" labelId="labels-label">
          <div className="flex min-w-0 flex-col gap-1">
            <ToggleGroup
              type="single"
              value={labelMode}
              onValueChange={(value) => {
                if (
                  value === 'note' ||
                  value === 'interval' ||
                  value === 'off'
                ) {
                  onLabelModeChange(value)
                }
              }}
              className="flex-nowrap"
              aria-labelledby="labels-label"
            >
              <ToggleGroupItem
                value="note"
                className="h-8 shrink-0 px-2.5 text-xs"
              >
                Note
              </ToggleGroupItem>
              <ToggleGroupItem
                value="interval"
                className="h-8 shrink-0 px-2.5 text-xs"
                disabled={!hasScaleOrChord}
                title={
                  hasScaleOrChord ? undefined : 'Select a scale or chord first'
                }
              >
                Interval
              </ToggleGroupItem>
              <ToggleGroupItem
                value="off"
                className="h-8 shrink-0 px-2.5 text-xs"
              >
                Off
              </ToggleGroupItem>
            </ToggleGroup>
            {!hasScaleOrChord && labelMode === 'interval' ? (
              <p className="text-[11px] leading-tight text-muted-foreground">
                Select a scale or chord for intervals
              </p>
            ) : null}
          </div>
        </ControlField>

        <ControlField label="3NPS patterns" htmlFor="three-nps">
          <Select
            value={npsAvailable ? threeNps : 'off'}
            disabled={!npsAvailable}
            onValueChange={(value) => {
              const mode = THREE_NPS_MODES.find((m) => m === value)
              if (mode) onThreeNpsChange(mode)
            }}
          >
            <SelectTrigger
              id="three-nps"
              className="h-8 w-[8.5rem]"
              aria-label="Three-notes-per-string patterns"
              title={
                npsAvailable
                  ? undefined
                  : 'Needs a 6-string tuning and a 7-note scale'
              }
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="off">Off</SelectItem>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="alternating">Alternating</SelectItem>
              {(threeNpsLabels ?? []).map((label, i) => (
                <SelectItem key={label} value={String(i + 1)}>
                  Pattern {i + 1} · {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ControlField>
      </div>

      {/* Switches — 2×2 when stacked; natural widths on wide screens */}
      <div className="grid w-full max-w-md grid-cols-2 gap-x-4 gap-y-3 lg:flex lg:w-auto lg:max-w-none lg:flex-wrap lg:items-end lg:gap-x-5">
        <ControlField label="Degree colors" htmlFor="degree-colors">
          <Switch
            id="degree-colors"
            checked={degreeColors}
            onCheckedChange={onDegreeColorsChange}
          />
        </ControlField>

        <ControlField label="Show all notes" htmlFor="show-all">
          <Switch
            id="show-all"
            checked={showAllNotes}
            onCheckedChange={onShowAllNotesChange}
          />
        </ControlField>

        <ControlField label="Uniform spacing" htmlFor="uniform">
          <Switch
            id="uniform"
            checked={uniformSpacing}
            onCheckedChange={onUniformSpacingChange}
          />
        </ControlField>

        <ControlField label="Left-handed" htmlFor="lefty">
          <Switch id="lefty" checked={lefty} onCheckedChange={onLeftyChange} />
        </ControlField>
      </div>
    </section>
  )
}
