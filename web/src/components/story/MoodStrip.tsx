import { STRIP } from '../../data'

const W = 660
const ROW_H = 28
const GAP = 8
const LABEL = 92
const H = 16 + 3 * ROW_H + 2 * GAP

const FILL = ['var(--good)', 'var(--amber)', 'var(--bad)']
const ROWS: { key: keyof typeof STRIP; label: string }[] = [
  { key: 'true', label: 'planted' },
  { key: 'hmm', label: 'hidden-state' },
  { key: 'vol', label: 'vol cutoff' },
]

export function MoodStrip() {
  const n = STRIP.true.length
  const plotW = W - LABEL - 8
  return (
    <div className="chart-wrap">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Three mood strips on held-out days: planted sequence, hidden-state recovery, rolling-vol cutoff."
      >
        {ROWS.map((row, ri) => {
          const y = 8 + ri * (ROW_H + GAP)
          const seq = STRIP[row.key]
          return (
            <g key={row.key}>
              <text
                x={LABEL - 8}
                y={y + ROW_H / 2 + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--chart-label)"
                fontFamily="var(--font-mono)"
              >
                {row.label}
              </text>
              {seq.map((mood, i) => (
                <rect
                  key={i}
                  className="mood-cell"
                  x={LABEL + (i / n) * plotW}
                  y={y}
                  width={plotW / n + 0.4}
                  height={ROW_H}
                  fill={FILL[mood]}
                  style={{ animationDelay: `${0.004 * i + 0.04 * ri}s` }}
                />
              ))}
            </g>
          )
        })}
      </svg>
      <ul className="legend">
        <li><span className="swatch" style={{ background: FILL[0] }} />calm</li>
        <li><span className="swatch" style={{ background: FILL[1] }} />choppy</li>
        <li><span className="swatch" style={{ background: FILL[2] }} />crashy</li>
      </ul>
    </div>
  )
}
