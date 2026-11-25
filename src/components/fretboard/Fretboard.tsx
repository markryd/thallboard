import { useId } from 'react'
import {
  collectionIntervalLabel,
  degreeBucket,
  getPitchCollection,
  isInCollection,
} from '@/lib/music/collections'
import {
  buildFretboard,
  computeHighlightSet,
  DOUBLE_DOT_FRETS,
  FRET_MARKERS,
  type FretWindow,
  fretXPositionsInRange,
  getStringYs,
  openMidiNotes,
  visibleFretRange,
} from '@/lib/music/fretboard'
import { type AccidentalDisplay, pitchClassName } from '@/lib/music/notes'
import {
  selectThreeNpsPatterns,
  supportsThreeNps,
  type ThreeNpsMode,
  threeNpsPatterns,
} from '@/lib/music/threeNps'
import { guitarStringNumber } from '@/lib/presets/builtins'
import type { LabelMode } from '@/lib/presets/storage'

type FretboardProps = {
  tuning: number[]
  detuneOffset: number
  fretCount: number
  fretWindow: FretWindow
  selectedScale: { root: number; type: string } | null
  highlightedNotes: ReadonlySet<number>
  accidentalDisplay: AccidentalDisplay
  labelMode: LabelMode
  showAllNotes: boolean
  uniformSpacing: boolean
  degreeColors: boolean
  lefty: boolean
  threeNps: ThreeNpsMode
  onToggleNote: (pitchClass: number) => void
}

const PAD_LEFT = 28
const PAD_RIGHT = 16
const PAD_TOP = 28
const PAD_BOTTOM = 36
const BOARD_WIDTH = 24 * 42
/**
 * 3NPS outlines are stroked twice as wide as they appear and clipped to their
 * own shape, so only the inner half shows. Neighbouring patterns that share
 * an edge then show both colours side by side instead of one hiding the other.
 */
const NPS_STROKE = 3

function boardHeightForStrings(stringCount: number): number {
  return Math.min(280, Math.max(148, 24 + stringCount * 22))
}

function fillForRole(opts: {
  isRoot: boolean
  isManual: boolean
  inCollection: boolean
  degreeColors: boolean
  root: number | null
  pitchClass: number
}): string {
  const { isRoot, isManual, inCollection, degreeColors, root, pitchClass } =
    opts
  if (isRoot) return 'var(--note-root)'
  if (isManual) return 'var(--note-manual)'
  if (!inCollection) return 'var(--note-muted)'
  if (degreeColors && root !== null) {
    const bucket = degreeBucket(root, pitchClass)
    if (bucket === 'third') return 'var(--note-third)'
    if (bucket === 'fourth') return 'var(--note-fourth)'
    if (bucket === 'fifth') return 'var(--note-fifth)'
    if (bucket === 'seventh') return 'var(--note-seventh)'
    if (bucket === 'other') return 'var(--note-scale)'
  }
  return 'var(--note-scale)'
}

export function Fretboard({
  tuning,
  detuneOffset,
  fretCount,
  fretWindow,
  selectedScale,
  highlightedNotes,
  accidentalDisplay,
  labelMode,
  showAllNotes,
  uniformSpacing,
  degreeColors,
  lefty,
  threeNps,
  onToggleNote,
}: FretboardProps) {
  // Unique, URL-safe prefix for clip-path ids.
  const svgId = `fb${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const stringCount = tuning.length
  if (stringCount === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        Add at least one string to show the fretboard.
      </div>
    )
  }

  const { start: viewStart, end: viewEnd } = visibleFretRange(
    fretCount,
    fretWindow,
  )
  const boardHeight = boardHeightForStrings(stringCount)
  const svgWidth = PAD_LEFT + BOARD_WIDTH + PAD_RIGHT
  const svgHeight = PAD_TOP + boardHeight + PAD_BOTTOM
  const topY = PAD_TOP + 12
  const bottomY = PAD_TOP + boardHeight - 12
  const nutX = PAD_LEFT
  // Include fret before window start so fretted notes at viewStart can be centered.
  const xRangeStart = viewStart > 0 ? viewStart - 1 : 0
  const xMap = fretXPositionsInRange(
    xRangeStart,
    viewEnd,
    nutX,
    BOARD_WIDTH,
    uniformSpacing,
  )
  const ys = getStringYs(stringCount, topY, bottomY)
  const positions = buildFretboard(tuning, detuneOffset, fretCount)
  const highlight = computeHighlightSet(selectedScale, highlightedNotes)
  const root = selectedScale?.root ?? null
  const endX = xMap.get(viewEnd) ?? nutX + BOARD_WIDTH
  const openX = nutX - 14

  function mapX(x: number): number {
    if (!lefty) return x
    return svgWidth - x
  }

  /** Centre of the note circle for a visible fret, before left-hand mirroring. */
  function noteCenterX(fret: number): number | null {
    if (fret === 0) return openX
    const a = xMap.get(fret - 1)
    const b = xMap.get(fret)
    if (a == null || b == null) return null
    return (a + b) / 2
  }

  /** Like noteCenterX, but extrapolates past the fret window (the overflow is clipped). */
  function anyFretCenterX(fret: number): number {
    if (fret > viewEnd) {
      const last = xMap.get(viewEnd) ?? endX
      const prev = xMap.get(viewEnd - 1) ?? last
      return (noteCenterX(viewEnd) ?? last) + (fret - viewEnd) * (last - prev)
    }
    if (fret < viewStart) {
      const first = xMap.get(xRangeStart) ?? nutX
      const next = xMap.get(xRangeStart + 1) ?? first
      return (
        (noteCenterX(viewStart) ?? first) - (viewStart - fret) * (next - first)
      )
    }
    return noteCenterX(fret) ?? nutX
  }

  const collection = selectedScale
    ? getPitchCollection(selectedScale.type)
    : undefined
  const npsPatterns =
    threeNps !== 'off' &&
    selectedScale !== null &&
    collection &&
    supportsThreeNps(stringCount, collection)
      ? selectThreeNpsPatterns(
          threeNpsPatterns(
            openMidiNotes(tuning, detuneOffset),
            selectedScale.root,
            collection.intervals,
            fretCount,
          ),
          threeNps,
        )
      : []
  const npsClipLeft = viewStart === 0 ? openX - NPS_STROKE : nutX
  const npsFillOpacity =
    threeNps === 'all' ? 0.08 : threeNps === 'alternating' ? 0.14 : 0.2

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-[var(--fretboard)]/35 shadow-sm dark:bg-[var(--fretboard)]/55 dark:shadow-none">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="block h-auto w-full"
        role="group"
        aria-label="Guitar fretboard"
      >
        <defs>
          <linearGradient id="board-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--fretboard)" />
            <stop
              offset="100%"
              stopColor="var(--fretboard-dark)"
              stopOpacity="0.85"
            />
          </linearGradient>
        </defs>

        <rect
          x={Math.min(mapX(nutX), mapX(endX))}
          y={PAD_TOP}
          width={Math.abs(mapX(endX) - mapX(nutX))}
          height={boardHeight}
          fill="url(#board-fill)"
          rx={2}
        />

        <rect
          x={lefty ? mapX(nutX) - 1 : mapX(nutX) - 5}
          y={PAD_TOP}
          width={6}
          height={boardHeight}
          fill="var(--nut)"
          rx={1}
        />

        {Array.from(xMap.entries())
          .filter(([fret]) => fret > viewStart)
          .map(([fret, x]) => (
            <line
              key={`fret-${fret}`}
              x1={mapX(x)}
              y1={PAD_TOP}
              x2={mapX(x)}
              y2={PAD_TOP + boardHeight}
              stroke="var(--fret-wire)"
              strokeWidth={fret === 12 || fret === 24 ? 2.5 : 1.25}
            />
          ))}

        {FRET_MARKERS.filter((f) => f > viewStart && f <= viewEnd).map(
          (fret) => {
            const xPrev = xMap.get(fret - 1)
            const xCurr = xMap.get(fret)
            if (xPrev == null || xCurr == null) return null
            const x = mapX((xPrev + xCurr) / 2)
            const midY = (topY + bottomY) / 2
            const offset = Math.min(22, boardHeight * 0.12)
            if (DOUBLE_DOT_FRETS.has(fret)) {
              return (
                <g key={`marker-${fret}`}>
                  <circle
                    cx={x}
                    cy={midY - offset}
                    r={4.5}
                    fill="var(--marker)"
                  />
                  <circle
                    cx={x}
                    cy={midY + offset}
                    r={4.5}
                    fill="var(--marker)"
                  />
                </g>
              )
            }
            return (
              <circle
                key={`marker-${fret}`}
                cx={x}
                cy={midY}
                r={4.5}
                fill="var(--marker)"
              />
            )
          },
        )}

        {ys.map((y, i) => (
          <line
            key={y}
            x1={mapX(nutX - 5)}
            y1={y}
            x2={mapX(endX)}
            y2={y}
            stroke="var(--string)"
            strokeWidth={1.2 + (stringCount - 1 - i) * 0.35}
            strokeOpacity={0.75}
          />
        ))}

        {Array.from(xMap.entries())
          .filter(([fret]) => fret > viewStart)
          .map(([fret, x]) => {
            const show =
              FRET_MARKERS.includes(fret as (typeof FRET_MARKERS)[number]) ||
              fret === viewEnd
            if (!show) return null
            const prev = xMap.get(fret - 1)
            if (prev == null) return null
            return (
              <text
                key={`fret-num-${fret}`}
                x={mapX((prev + x) / 2)}
                y={PAD_TOP + boardHeight + 18}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize={10}
                fontFamily="var(--font-mono)"
              >
                {fret}
              </text>
            )
          })}

        {ys.map((y, stringIndex) => {
          const openMidi = (tuning[stringIndex] ?? 0) + detuneOffset
          const pc = ((openMidi % 12) + 12) % 12
          return (
            <text
              key={`open-label-${y}`}
              x={mapX(nutX - 12)}
              y={y + 3.5}
              textAnchor={lefty ? 'start' : 'end'}
              className="fill-foreground"
              fontSize={10}
              fontFamily="var(--font-mono)"
              fontWeight={600}
            >
              {pitchClassName(pc, accidentalDisplay)}
            </text>
          )
        })}

        {npsPatterns.length > 0 ? (
          <g aria-hidden style={{ pointerEvents: 'none' }}>
            <clipPath id={`${svgId}-nps`}>
              <rect
                x={Math.min(mapX(npsClipLeft), mapX(endX))}
                y={0}
                width={Math.abs(mapX(endX) - mapX(npsClipLeft))}
                height={svgHeight}
              />
            </clipPath>
            <g clipPath={`url(#${svgId}-nps)`}>
              {npsPatterns.map((pattern) => {
                // Vertices are the centres of the first and last note on each
                // string: up the low side, then back down the high side.
                const left: string[] = []
                const right: string[] = []
                for (const str of pattern.strings) {
                  const y = ys[str.stringIndex] ?? 0
                  left.push(`${mapX(anyFretCenterX(str.minFret))},${y}`)
                  right.unshift(`${mapX(anyFretCenterX(str.maxFret))},${y}`)
                }
                const d = `M${[...left, ...right].join(' L')} Z`
                const key = `${pattern.degree}-${pattern.strings[0]?.minFret}`
                const clipId = `${svgId}-nps-${key}`
                const top = pattern.strings[pattern.strings.length - 1]
                const color = `var(--nps-${pattern.degree + 1})`
                const labelX = top
                  ? mapX(
                      (anyFretCenterX(top.minFret) +
                        anyFretCenterX(top.maxFret)) /
                        2,
                    )
                  : 0
                return (
                  <g key={key}>
                    <clipPath id={clipId}>
                      <path d={d} />
                    </clipPath>
                    <path
                      d={d}
                      clipPath={`url(#${clipId})`}
                      fill={color}
                      fillOpacity={npsFillOpacity}
                      stroke={color}
                      strokeOpacity={0.9}
                      strokeWidth={NPS_STROKE}
                      strokeLinejoin="round"
                    />
                    <text
                      x={labelX}
                      y={PAD_TOP - 7}
                      textAnchor="middle"
                      fill={color}
                      fontSize={10}
                      fontFamily="var(--font-mono)"
                      fontWeight={700}
                    >
                      {pattern.degree + 1}
                    </text>
                  </g>
                )
              })}
            </g>
          </g>
        ) : null}

        {positions.map((stringPositions, stringIndex) =>
          stringPositions.map((pos) => {
            if (pos.fret < viewStart || pos.fret > viewEnd) return null

            const inHighlight = highlight.has(pos.pitchClass)
            if (!showAllNotes && !inHighlight) return null

            const isRoot = root !== null && pos.pitchClass === root
            const isManual = highlightedNotes.has(pos.pitchClass)
            const inCollection =
              selectedScale !== null &&
              isInCollection(
                pos.pitchClass,
                selectedScale.root,
                selectedScale.type,
              )

            const y = ys[stringIndex]
            if (y == null) return null
            const fretX = noteCenterX(pos.fret)
            if (fretX == null) return null

            const fill = fillForRole({
              isRoot,
              isManual,
              inCollection,
              degreeColors,
              root,
              pitchClass: pos.pitchClass,
            })

            const opacity = showAllNotes && !inHighlight ? 0.58 : 1
            const noteName = pitchClassName(pos.pitchClass, accidentalDisplay)
            const label =
              labelMode === 'off'
                ? ''
                : labelMode === 'interval' && selectedScale !== null
                  ? collectionIntervalLabel(
                      selectedScale.root,
                      pos.pitchClass,
                      selectedScale.type,
                    )
                  : noteName

            const r = isRoot ? 11 : 9.5
            const cx = mapX(fretX)
            const stringNum = guitarStringNumber(stringIndex, stringCount)

            return (
              <g
                key={`${pos.stringIndex}-${pos.fret}`}
                role="button"
                tabIndex={0}
                aria-pressed={inHighlight}
                aria-label={`Toggle ${noteName} (string ${stringNum}, fret ${pos.fret})`}
                className="note-hit cursor-pointer outline-none"
                onClick={() => onToggleNote(pos.pitchClass)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onToggleNote(pos.pitchClass)
                  }
                }}
              >
                <circle
                  cx={cx}
                  cy={y}
                  r={r}
                  fill={fill}
                  opacity={opacity}
                  stroke="var(--note-stroke)"
                  strokeWidth={isRoot ? 1.75 : 1}
                />
                {label ? (
                  <text
                    x={cx}
                    y={y + 3.2}
                    textAnchor="middle"
                    fill="var(--note-label)"
                    fontSize={label.length > 2 ? 7.5 : 8.5}
                    fontFamily="var(--font-mono)"
                    fontWeight={700}
                    opacity={opacity}
                    style={{ pointerEvents: 'none' }}
                  >
                    {label}
                  </text>
                ) : null}
              </g>
            )
          }),
        )}
      </svg>
    </div>
  )
}

export function NoteLegend({ degreeColors }: { degreeColors: boolean }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <li className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-note-root" aria-hidden />
        Root
      </li>
      {degreeColors ? (
        <>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-note-third" aria-hidden />
            3rd
          </li>
          <li className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-full bg-note-fourth"
              aria-hidden
            />
            4th
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-note-fifth" aria-hidden />
            5th
          </li>
          <li className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-full bg-note-seventh"
              aria-hidden
            />
            7th
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-note-scale" aria-hidden />
            Other
          </li>
        </>
      ) : (
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-note-scale" aria-hidden />
          Scale
        </li>
      )}
      <li className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-note-manual" aria-hidden />
          Manual
        </span>
        <span className="text-muted-foreground/80">
          — click or activate a note to toggle that pitch class everywhere
        </span>
      </li>
    </ul>
  )
}

/** Pattern key: number = starting scale degree on the lowest string. */
export function ThreeNpsLegend({
  degreeLabels,
  mode,
}: {
  degreeLabels: string[]
  mode: ThreeNpsMode
}) {
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <li>3NPS, by starting degree on the low string:</li>
      {degreeLabels.map((label, i) => {
        const n = String(i + 1)
        if (mode !== 'all' && mode !== 'alternating' && mode !== n) return null
        return (
          <li key={n} className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-sm border"
              style={{
                borderColor: `var(--nps-${n})`,
                background: `color-mix(in oklch, var(--nps-${n}) 35%, transparent)`,
              }}
              aria-hidden
            />
            <span className="font-mono">
              {n} · {label}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
