import type { ReactNode } from 'react'

/**
 * 2D Flow primitives. Readability over decoration.
 *
 * Rules:
 *   - Card BODY is always solid bg-ink-soft. NEVER bg-X/10 as a fill.
 *   - A 2px coloured border carries semantic colour.
 *   - Title at full saturation; sub-text always text-paper full opacity.
 *   - States: active (ring-2 + offset + float-in), dim (opacity-35), base.
 */

export type FlowState = 'base' | 'active' | 'dim'

export const TONES: Record<string, { border: string; text: string; ring: string; bg: string; hex: string }> = {
  coral: { border: 'border-coral', text: 'text-coral', ring: 'ring-coral/60', bg: 'bg-coral/15', hex: '#fb7185' },
  sun: { border: 'border-sun', text: 'text-sun', ring: 'ring-sun/60', bg: 'bg-sun/15', hex: '#fbbf24' },
  sky: { border: 'border-sky', text: 'text-sky', ring: 'ring-sky/60', bg: 'bg-sky/15', hex: '#38bdf8' },
  mint: { border: 'border-mint', text: 'text-mint', ring: 'ring-mint/60', bg: 'bg-mint/15', hex: '#34d399' },
  grape: { border: 'border-grape-soft', text: 'text-grape-soft', ring: 'ring-grape-soft/60', bg: 'bg-grape/20', hex: '#a78bfa' },
  rose: { border: 'border-rose', text: 'text-rose', ring: 'ring-rose/60', bg: 'bg-rose/15', hex: '#f472b6' },
  paper: { border: 'border-paper/40', text: 'text-paper', ring: 'ring-paper/40', bg: 'bg-white/10', hex: '#fdf6f0' },
}

export function FlowNode({
  tone = 'paper',
  title,
  sub,
  icon,
  state = 'base',
  size = 'md',
  className = '',
}: {
  tone?: keyof typeof TONES
  title: string
  sub?: ReactNode
  icon?: ReactNode
  state?: FlowState
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const t = TONES[tone] ?? TONES.paper
  const pad = size === 'sm' ? 'p-2.5' : size === 'lg' ? 'p-4' : 'p-3'
  const isActive = state === 'active'
  const isDim = state === 'dim'
  return (
    <div
      className={[
        'rounded-xl border-2 bg-ink-soft transition-all',
        t.border,
        pad,
        isActive ? `ring-2 ring-offset-2 ring-offset-ink ${t.ring} anim-float-in` : '',
        isDim ? 'opacity-35' : '',
        className,
      ].join(' ')}
    >
      <div className="flex items-start gap-2">
        {icon && <span className="text-lg leading-none mt-0.5">{icon}</span>}
        <div className="min-w-0 flex-1">
          <p className={`font-bold leading-tight ${t.text} ${size === 'lg' ? 'text-base' : 'text-sm'}`}>{title}</p>
          {sub && <div className="mt-1 text-xs text-paper leading-snug">{sub}</div>}
        </div>
      </div>
    </div>
  )
}

/**
 * Wrapper that fixes a 720px design width and adds horizontal scroll on mobile
 * so diagram labels never overlap.
 */
export function FlowDiagram({
  children,
  height = 'auto',
  width = 720,
  className = '',
}: {
  children: ReactNode
  height?: number | 'auto'
  width?: number
  className?: string
}) {
  return (
    <div className={`overflow-x-auto -mx-2 px-2 ${className}`}>
      <div
        className="relative mx-auto"
        style={{ width, minWidth: width, height: height === 'auto' ? undefined : height }}
      >
        {children}
      </div>
    </div>
  )
}

/** Absolute positioning helper: place a node by its center, in % of the 720-wide canvas. */
export function nodeStyle(xPct: number, yPx: number, wPx: number): React.CSSProperties {
  return {
    position: 'absolute',
    left: `${xPct}%`,
    top: yPx,
    width: wPx,
    transform: 'translateX(-50%)',
  }
}

export function FlowArrow({
  x1, y1, x2, y2,
  tone = 'paper',
  active = false,
  dashed = false,
  label,
  width = 720,
}: {
  x1: number; y1: number; x2: number; y2: number
  tone?: keyof typeof TONES
  active?: boolean
  dashed?: boolean
  label?: string
  width?: number
}) {
  const t = TONES[tone] ?? TONES.paper
  const color = t.hex
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return (
    <svg className="absolute inset-0 pointer-events-none" width={width} style={{ height: '100%' }}>
      <defs>
        <marker id={`arr-${tone}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={active ? 2.5 : 1.5}
        strokeOpacity={active ? 1 : 0.4}
        strokeDasharray={dashed && !active ? '5 5' : undefined}
        markerEnd={`url(#arr-${tone})`}
        className={active ? 'anim-dash-flow' : ''}
      />
      {label && (
        <g>
          <rect x={mx - 40} y={my - 9} width={80} height={18} rx={9} fill="#1a1a2e" stroke={color} strokeOpacity={0.5} />
          <text x={mx} y={my + 3} textAnchor="middle" fontSize="10" fill={color} className="font-mono uppercase tracking-wider">{label}</text>
        </g>
      )}
    </svg>
  )
}

export function SectionLabel({ children, tone = 'paper' }: { children: ReactNode; tone?: keyof typeof TONES }) {
  const t = TONES[tone] ?? TONES.paper
  return (
    <span className={`inline-block text-[10px] font-mono uppercase tracking-widest ${t.text} opacity-80`}>{children}</span>
  )
}

/* ────────────────────────────────────────────────────────────────────────
 * Workflow-first primitives (v2). These build a single morphing diagram:
 * one shared SVG edge layer + an absolute-positioned node layer, both sized
 * to a fixed design width so px coordinates line up 1:1 with the viewBox.
 * Each piece takes a reveal flag so the diagram completes itself as the
 * learner advances the beats — motion is driven by the workflow, not by
 * swapping paragraphs.
 * ──────────────────────────────────────────────────────────────────────── */

export type Pt = { x: number; y: number }

/** Container: shared SVG arrow layer behind, absolute node layer on top. */
export function WorkflowCanvas({
  width = 720,
  height,
  edges,
  children,
  className = '',
}: {
  width?: number
  height: number
  edges?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={`-mx-2 px-2 overflow-x-auto overflow-y-hidden pb-1 ${className}`}>
      <div className="relative mx-auto" style={{ width, minWidth: width, height }}>
        <svg
          className="absolute inset-0 pointer-events-none"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {edges}
        </svg>
        <div className="absolute inset-0">{children}</div>
      </div>
    </div>
  )
}

/** Position a node box by its CENTER point, in canvas px. */
export function atCenter(p: Pt, w: number, h?: number): React.CSSProperties {
  return { position: 'absolute', left: p.x - w / 2, top: p.y - (h ? h / 2 : 0), width: w }
}

/**
 * One bezier edge meant to live inside WorkflowCanvas's shared SVG.
 * active → marching-ants flow (anim-dash-flow) + full opacity.
 * dashed (inactive) → static dashes. Otherwise a quiet solid line.
 */
export function Edge({
  from,
  to,
  tone = 'paper',
  active = false,
  dashed = false,
  curve = 0,
  label,
  thickness,
  show = true,
}: {
  from: Pt
  to: Pt
  tone?: keyof typeof TONES
  active?: boolean
  dashed?: boolean
  curve?: number
  label?: string
  thickness?: number
  show?: boolean
}) {
  if (!show) return null
  const t = TONES[tone] ?? TONES.paper
  const color = t.hex
  const dx = to.x - from.x
  const dy = to.y - from.y
  const cx = (from.x + to.x) / 2 - dy * curve
  const cy = (from.y + to.y) / 2 + dx * curve
  const d = `M ${from.x},${from.y} Q ${cx},${cy} ${to.x},${to.y}`
  const w = thickness ?? (active ? 2.5 : 1.5)
  return (
    <g style={{ transition: 'opacity 400ms', opacity: active ? 1 : 0.32 }}>
      <defs>
        <marker id={`edge-${tone}`} markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 z" fill={color} />
        </marker>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeDasharray={dashed && !active ? '5 5' : undefined}
        markerEnd={`url(#edge-${tone})`}
        className={active ? 'anim-dash-flow' : ''}
      />
      {label && (
        <g>
          <rect x={cx - 34} y={cy - 9} width={68} height={18} rx={9} fill="#1a1a2e" stroke={color} strokeOpacity={0.5} />
          <text x={cx} y={cy + 3} textAnchor="middle" fontSize="9.5" fill={color} className="font-mono uppercase tracking-wider">
            {label}
          </text>
        </g>
      )}
    </g>
  )
}

/** A labelled background lane — the pic-3 "Input / Process / Action / Output" panel. */
export function StagePanel({
  tone = 'paper',
  label,
  x,
  y,
  w,
  h,
  active = true,
}: {
  tone?: keyof typeof TONES
  label: string
  x: number
  y: number
  w: number
  h: number
  active?: boolean
}) {
  const t = TONES[tone] ?? TONES.paper
  return (
    <div
      className={`absolute rounded-2xl border ${t.border} ${t.bg} transition-all duration-500 ${active ? 'opacity-100' : 'opacity-25'}`}
      style={{ left: x, top: y, width: w, height: h }}
    >
      <div className={`absolute -top-2 left-3 px-2 text-[9px] font-mono uppercase tracking-widest ${t.text} bg-ink-soft rounded`}>
        {label}
      </div>
    </div>
  )
}

/** A live summary strip under a diagram (Specialists / Cost / Verdict …). */
export function MetricRow({ items }: { items: { label: string; value: ReactNode; tone?: keyof typeof TONES }[] }) {
  return (
    <div className="grid gap-2 mt-3" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))` }}>
      {items.map((it, i) => {
        const t = TONES[it.tone ?? 'paper'] ?? TONES.paper
        return (
          <div key={i} className="rounded-lg bg-white/5 border border-white/10 p-2 text-center">
            <div className="text-[9px] uppercase tracking-widest text-paper/40">{it.label}</div>
            <div className={`font-bold text-base leading-tight mt-0.5 ${t.text}`}>{it.value}</div>
          </div>
        )
      })}
    </div>
  )
}

export interface ToolPick {
  name: string
  tagline: string
  badge?: string
}

/**
 * The threaded-tools panel: for THIS stage of the workflow, the popular
 * framework/tool, its real alternatives (as hover-titled chips), and a tiny
 * "how you'd actually build it" code snippet. Reused in every layer chapter.
 */
export function ToolStack({
  tone = 'paper',
  stage,
  primary,
  alternatives,
  snippetLabel,
  snippet,
  note,
  show = true,
}: {
  tone?: keyof typeof TONES
  stage: string
  primary: ToolPick
  alternatives: ToolPick[]
  snippetLabel: string
  snippet: string
  note?: ReactNode
  show?: boolean
}) {
  if (!show) return null
  const t = TONES[tone] ?? TONES.paper
  return (
    <div className={`mt-4 rounded-2xl border-2 ${t.border} bg-ink-soft p-4 anim-float-in`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[10px] font-mono uppercase tracking-widest ${t.text}`}>🧰 Build this stage · {stage}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className={`rounded-xl border-2 ${t.border} ${t.bg} p-3`}>
          <div className="flex items-center justify-between gap-2">
            <p className={`font-bold ${t.text}`}>{primary.name}</p>
            {primary.badge && (
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-white/10 ${t.text}`}>{primary.badge}</span>
            )}
          </div>
          <p className="text-xs text-paper/80 mt-1 leading-snug">{primary.tagline}</p>
          <p className="text-[10px] uppercase tracking-widest text-paper/40 mt-3 mb-1.5">Popular alternatives</p>
          <div className="flex flex-wrap gap-1.5">
            {alternatives.map((a) => (
              <span
                key={a.name}
                className="text-[11px] font-semibold px-2 py-1 rounded-md bg-white/5 border border-white/15 text-paper/80 cursor-help"
                title={a.tagline}
              >
                {a.name}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-ink p-3 overflow-x-auto">
          <p className="text-[10px] uppercase tracking-widest text-paper/40 mb-1.5">{snippetLabel}</p>
          <pre className="text-[11px] font-mono text-paper/85 leading-relaxed whitespace-pre">{snippet}</pre>
        </div>
      </div>
      {note && <p className="text-xs text-paper/70 mt-3 leading-relaxed">{note}</p>}
    </div>
  )
}
