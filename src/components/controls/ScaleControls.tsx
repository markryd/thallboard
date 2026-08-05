import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  allPitchCollections,
  getCollectionCategories,
} from '@/lib/music/collections'
import {
  type AccidentalDisplay,
  PITCH_CLASSES,
  pitchClassName,
} from '@/lib/music/notes'

type ScaleControlsProps = {
  selectedScale: { root: number; type: string } | null
  accidentalDisplay: AccidentalDisplay
  onChange: (scale: { root: number; type: string } | null) => void
}

export function ScaleControls({
  selectedScale,
  accidentalDisplay,
  onChange,
}: ScaleControlsProps) {
  const categories = getCollectionCategories()
  const collections = allPitchCollections()
  const root = selectedScale?.root ?? 0
  const type = selectedScale?.type ?? 'none'

  return (
    <section className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-foreground">
          Scale / arpeggios
        </h2>
        <Select
          value={type}
          onValueChange={(value) => {
            if (!value || value === 'none') {
              onChange(null)
              return
            }
            onChange({ root, type: value })
          }}
        >
          <SelectTrigger
            className="h-8 w-full max-w-xs"
            aria-label="Scale or chord type"
          >
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {categories.map((category) => (
              <SelectGroup key={category}>
                <SelectLabel>{category}</SelectLabel>
                {collections
                  .filter((c) => c.category === category)
                  .map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label id="root-label" className="text-xs">
          Root
        </Label>
        <ToggleGroup
          type="single"
          value={selectedScale ? String(root) : undefined}
          onValueChange={(value) => {
            if (!value) return
            const nextRoot = Number(value)
            if (selectedScale) {
              onChange({ root: nextRoot, type: selectedScale.type })
            } else {
              onChange({ root: nextRoot, type: 'minor-pentatonic' })
            }
          }}
          className="flex flex-wrap justify-start gap-1"
          aria-labelledby="root-label"
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
      </div>
    </section>
  )
}
