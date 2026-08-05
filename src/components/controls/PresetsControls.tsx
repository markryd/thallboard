import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import type { StringCount, TuningPreset } from '@/lib/presets/builtins'

type PresetsControlsProps = {
  presets: TuningPreset[]
  activePresetId: string | null
  onSelect: (presetId: string) => void
  onSave: (name: string) => void
  onDelete: (presetId: string) => void
}

const STRING_GROUPS: StringCount[] = [7, 8, 6, 9]

export function PresetsControls({
  presets,
  activePresetId,
  onSelect,
  onSave,
  onDelete,
}: PresetsControlsProps) {
  const [name, setName] = useState('')
  const active = presets.find((p) => p.id === activePresetId)
  const builtins = presets.filter((p) => p.builtin)
  const user = presets.filter((p) => !p.builtin)

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-wide text-foreground">
        Presets
      </h2>
      <div className="space-y-2">
        <Label htmlFor="preset-select">Load preset</Label>
        <div className="flex gap-2">
          <Select
            value={activePresetId ?? undefined}
            onValueChange={(value) => {
              if (value) onSelect(value)
            }}
          >
            <SelectTrigger id="preset-select" className="flex-1">
              <SelectValue placeholder="Choose a preset" />
            </SelectTrigger>
            <SelectContent>
              {STRING_GROUPS.map((count) => {
                const group = builtins.filter((p) => p.stringCount === count)
                if (group.length === 0) return null
                return (
                  <SelectGroup key={count}>
                    <SelectLabel>{count}-string</SelectLabel>
                    {group.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )
              })}
              {user.length > 0 ? (
                <SelectGroup>
                  <SelectLabel>Saved</SelectLabel>
                  {user.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ) : null}
            </SelectContent>
          </Select>
          {active && !active.builtin ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Delete preset"
              onClick={() => onDelete(active.id)}
            >
              <Trash2 />
            </Button>
          ) : null}
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Preset name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="New preset name"
        />
        <Button
          type="button"
          onClick={() => {
            const trimmed = name.trim()
            if (!trimmed) return
            onSave(trimmed)
            setName('')
          }}
          disabled={!name.trim()}
        >
          Save
        </Button>
      </div>
    </section>
  )
}
