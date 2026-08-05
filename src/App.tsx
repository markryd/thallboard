import { useEffect, useMemo, useRef, useState } from 'react'
import { DisplayControls } from '@/components/controls/DisplayControls'
import { NoteSelector } from '@/components/controls/NoteSelector'
import { PresetsControls } from '@/components/controls/PresetsControls'
import { ScaleControls } from '@/components/controls/ScaleControls'
import { TuningControls } from '@/components/controls/TuningControls'
import { Fretboard, NoteLegend } from '@/components/fretboard/Fretboard'
import { ThemeToggle } from '@/components/ThemeToggle'
import { TipJarButton } from '@/components/TipJarButton'
import { Separator } from '@/components/ui/separator'
import {
  type AppState,
  allPresets,
  applyPreset,
  createUserPreset,
  loadActiveState,
  loadUserPresets,
  saveActiveState,
  saveUserPresets,
} from '@/lib/presets/storage'
import { cn } from '@/lib/utils'

export default function App() {
  const [state, setState] = useState<AppState>(() => loadActiveState())
  const [userPresets, setUserPresets] = useState(() => loadUserPresets())
  const [boardStuck, setBoardStuck] = useState(false)
  const stickySentinelRef = useRef<HTMLDivElement>(null)

  const presets = useMemo(() => allPresets(userPresets), [userPresets])
  const highlightedSet = useMemo(
    () => new Set(state.highlightedNotes),
    [state.highlightedNotes],
  )

  useEffect(() => {
    saveActiveState(state)
  }, [state])

  useEffect(() => {
    saveUserPresets(userPresets)
  }, [userPresets])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)')
    const observer = new IntersectionObserver(([entry]) => {
      setBoardStuck(media.matches && !!entry && !entry.isIntersecting)
    })

    function syncObserver() {
      const el = stickySentinelRef.current
      if (!el) return
      if (media.matches) observer.observe(el)
      else {
        observer.disconnect()
        setBoardStuck(false)
      }
    }

    syncObserver()
    media.addEventListener('change', syncObserver)
    return () => {
      media.removeEventListener('change', syncObserver)
      observer.disconnect()
    }
  }, [])

  function patch(partial: Partial<AppState>) {
    setState((prev) => ({ ...prev, ...partial }))
  }

  function toggleNote(pitchClass: number) {
    setState((prev) => {
      const set = new Set(prev.highlightedNotes)
      if (set.has(pitchClass)) set.delete(pitchClass)
      else set.add(pitchClass)
      return { ...prev, highlightedNotes: [...set].sort((a, b) => a - b) }
    })
  }

  return (
    <div className="flex min-h-dvh flex-col gap-5 py-5">
      <header className="mx-auto flex w-full max-w-7xl items-start justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="space-y-0.5">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Thallboard
          </p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Extended-range fretboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <TipJarButton />
          <ThemeToggle />
        </div>
      </header>

      <div
        ref={stickySentinelRef}
        className="pointer-events-none -mb-5 h-px w-full shrink-0"
        aria-hidden
      />
      <div
        className={cn(
          'w-full py-2 transition-[box-shadow,border-color] duration-200 md:sticky md:top-0 md:z-10 md:bg-background/90 md:backdrop-blur-md',
          boardStuck &&
            'md:border-b md:border-border/45 md:shadow-[0_12px_20px_-16px_rgba(0,0,0,0.55)] dark:md:shadow-[0_12px_22px_-14px_rgba(0,0,0,0.75)]',
        )}
      >
        <div className="mx-auto max-w-7xl space-y-2 px-4 sm:px-6 lg:px-8">
          <Fretboard
            tuning={state.tuning}
            detuneOffset={state.detuneOffset}
            fretCount={state.fretCount}
            fretWindow={state.fretWindow}
            selectedScale={state.selectedScale}
            highlightedNotes={highlightedSet}
            accidentalDisplay={state.accidentalDisplay}
            labelMode={state.labelMode}
            showAllNotes={state.showAllNotes}
            uniformSpacing={state.uniformSpacing}
            degreeColors={state.degreeColors}
            lefty={state.lefty}
            onToggleNote={toggleNote}
          />
          <NoteLegend degreeColors={state.degreeColors} />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border/70 bg-card/70 px-4 py-3 shadow-sm backdrop-blur-sm">
          <DisplayControls
            accidentalDisplay={state.accidentalDisplay}
            labelMode={state.labelMode}
            showAllNotes={state.showAllNotes}
            uniformSpacing={state.uniformSpacing}
            degreeColors={state.degreeColors}
            fretWindow={state.fretWindow}
            lefty={state.lefty}
            hasScaleOrChord={state.selectedScale !== null}
            onAccidentalChange={(accidentalDisplay) =>
              patch({ accidentalDisplay })
            }
            onLabelModeChange={(labelMode) => patch({ labelMode })}
            onShowAllNotesChange={(showAllNotes) => patch({ showAllNotes })}
            onUniformSpacingChange={(uniformSpacing) =>
              patch({ uniformSpacing })
            }
            onDegreeColorsChange={(degreeColors) => patch({ degreeColors })}
            onFretWindowChange={(fretWindow) => patch({ fretWindow })}
            onLeftyChange={(lefty) => patch({ lefty })}
          />
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="order-2 space-y-5 rounded-xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-sm lg:order-1">
            <PresetsControls
              presets={presets}
              activePresetId={state.activePresetId}
              onSelect={(id) => {
                const preset = presets.find((p) => p.id === id)
                if (!preset) return
                patch(applyPreset(preset))
              }}
              onSave={(name) => {
                const preset = createUserPreset(name, state)
                setUserPresets((prev) => [...prev, preset])
                patch({ activePresetId: preset.id })
              }}
              onDelete={(id) => {
                setUserPresets((prev) => prev.filter((p) => p.id !== id))
                if (state.activePresetId === id) {
                  patch({ activePresetId: null })
                }
              }}
            />
            <Separator />
            <TuningControls
              tuning={state.tuning}
              detuneOffset={state.detuneOffset}
              fretCount={state.fretCount}
              accidentalDisplay={state.accidentalDisplay}
              onTuningChange={(tuning) =>
                patch({ tuning, activePresetId: null })
              }
              onDetuneChange={(detuneOffset) =>
                patch({ detuneOffset, activePresetId: null })
              }
              onFretCountChange={(fretCount) =>
                patch({ fretCount, activePresetId: null })
              }
              onStringCountChange={(tuning, detuneOffset) =>
                patch({ tuning, detuneOffset, activePresetId: null })
              }
            />
          </div>

          <div className="order-1 space-y-4 rounded-xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-sm lg:order-2">
            <ScaleControls
              selectedScale={state.selectedScale}
              accidentalDisplay={state.accidentalDisplay}
              onChange={(selectedScale) => {
                const next: Partial<AppState> = { selectedScale }
                if (selectedScale === null && state.labelMode === 'interval') {
                  next.labelMode = 'note'
                }
                patch(next)
              }}
            />
            <Separator />
            <NoteSelector
              highlightedNotes={highlightedSet}
              accidentalDisplay={state.accidentalDisplay}
              onToggle={toggleNote}
              onClear={() => patch({ highlightedNotes: [] })}
            />
          </div>
        </div>

        <footer className="pb-3 text-center text-xs text-muted-foreground">
          Local only — presets saved in this browser
        </footer>
      </div>
    </div>
  )
}
