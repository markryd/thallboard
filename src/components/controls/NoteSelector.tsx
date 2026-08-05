import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  type AccidentalDisplay,
  PITCH_CLASSES,
  pitchClassName,
} from '@/lib/music/notes'

type NoteSelectorProps = {
  highlightedNotes: ReadonlySet<number>
  accidentalDisplay: AccidentalDisplay
  onToggle: (pitchClass: number) => void
  onClear: () => void
}

export function NoteSelector({
  highlightedNotes,
  accidentalDisplay,
  onToggle,
  onClear,
}: NoteSelectorProps) {
  const activeValues = PITCH_CLASSES.filter((pc) =>
    highlightedNotes.has(pc),
  ).map(String)

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-foreground">
          Manual notes
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={highlightedNotes.size === 0}
        >
          Clear
        </Button>
      </div>
      <ToggleGroup
        type="multiple"
        value={activeValues}
        onValueChange={(values) => {
          const next = new Set(values.map(Number))
          for (const pc of PITCH_CLASSES) {
            const was = highlightedNotes.has(pc)
            const now = next.has(pc)
            if (was !== now) onToggle(pc)
          }
        }}
        className="flex flex-wrap justify-start gap-1"
      >
        {PITCH_CLASSES.map((pc) => (
          <ToggleGroupItem
            key={pc}
            value={String(pc)}
            aria-label={pitchClassName(pc, accidentalDisplay)}
            className="min-w-9 px-2 font-mono text-xs"
          >
            {pitchClassName(pc, accidentalDisplay)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </section>
  )
}
