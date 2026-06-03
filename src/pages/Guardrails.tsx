import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'
import { PokeHint } from '../components/Poke'
import { MetricRow, ToolStack } from '../components/Flow'
import type { Beat } from '../components/StorySteps'

const chapter = CHAPTERS.find((c) => c.path === '/guardrails')!

/* ──────────────────────────────────────────────────────────────────────────
 *  LAYER 4 — GUARDRAILS & HUMAN GATE  (theme: SUN)
 *
 *  The specialists (Layer 2) proposed an action and the tools (Layer 3) are
 *  ready to fire — but issue_refund is GUARDED. Before a single cent moves,
 *  the proposed action passes through a risk/policy check that scores four
 *  signals: confidence, amount, fraud, compliance. Low risk passes
 *  automatically; high risk stops and routes to a human (approve / reject).
 *  ────────────────────────────────────────────────────────────────────── */

const beats: Beat[] = [
  {
    caption:
      'The support agent has drafted a refund. But the agents don’t get to move money on their own — first the whole proposal passes through the guardrail layer, a risk-and-policy check that sits between the agents and the cash.',
    llmNote:
      'Key idea: the LLM-driven agents only *propose*. They never execute the irreversible step themselves. A separate, mostly deterministic policy layer decides whether to proceed — so you’re never trusting the model to grade its own homework.',
    readingMs: 5200,
  },
  {
    caption:
      'The gate scores four signals: how confident the agents are, how much money is involved, whether anything looks like fraud, and whether it’s inside written policy. For this $79 refund, all four come back clean.',
    llmNote:
      'These checks are boring on purpose. Confidence is a number the model already emits; amount, fraud velocity, and policy limits are plain rules. Boring and inspectable is exactly what you want guarding money.',
    readingMs: 5000,
  },
  {
    caption:
      'All four clear, so the risk is LOW — the gate opens automatically and the refund flows straight to execution. A small, confident, in-policy refund doesn’t need to wake a human.',
    llmNote:
      'This is the half people forget: a good gate lets the easy cases through. If every action needed a human, you’d have a very expensive chatbot, not an agent.',
    readingMs: 4600,
  },
  {
    caption:
      'Now the same machinery, a harder case: a $4,000 refund at 55% confidence, with a fraud-velocity flag — third refund this week. The very same four checks run again, and this time they light up red.',
    llmNote:
      'Nothing about the system changed — same agents, same gate. Only the inputs changed. That’s the point of scoring signals instead of hard-coding “refunds are fine”: the risk reads the situation.',
    readingMs: 5000,
  },
  {
    caption:
      'Risk is HIGH, so the gate does the opposite of before: it stops the flow and routes the proposal to a human, with the rationale attached. Nothing irreversible happens on the agents’ say-so.',
    llmNote:
      'This is human-in-the-loop, placed precisely: agents run free up to the gate, then block. The human inherits a fully-prepared decision — draft, amount, and the reasons it was flagged — not a blank screen.',
    readingMs: 5000,
  },
  {
    caption:
      'You’re the human now. Approve and it continues to execution; reject and it bounces back to the agents. Either way, your decision and its reason get logged.',
    llmNote:
      'Both outcomes are legitimate. A real gate isn’t a rubber stamp — it’s a decision point where a person can stop or redirect money before it’s gone.',
    readingMs: 4400,
  },
  {
    caption:
      'That’s the whole design: gate where the risk lives — money, low confidence, fraud — and let the cheap, certain stuff flow. Too many gates and people rubber-stamp; too few and the agent can do real harm.',
    llmNote:
      'Placement is the engineering. The skill isn’t adding gates everywhere; it’s knowing the handful of actions that are irreversible or expensive and putting a human exactly there.',
    readingMs: 4800,
  },
]

/* ── data ─────────────────────────────────────────────────────────────── */

type CaseKey = 'safe' | 'risky'
type Decision = 'approve' | 'reject'

interface Signal {
  icon: string
  label: string
  read: string
  ok: boolean
}

interface RiskCase {
  key: CaseKey
  draft: string
  amount: string
  signals: Signal[]
  level: 'LOW' | 'HIGH'
}

const SAFE: RiskCase = {
  key: 'safe',
  draft: 'Refund $79 to order #4412 (duplicate charge)',
  amount: '$79',
  level: 'LOW',
  signals: [
    { icon: '🎯', label: 'Confidence', read: '98% · ≥ 90% ✓', ok: true },
    { icon: '💵', label: 'Amount', read: '$79 · ≤ $100 limit ✓', ok: true },
    { icon: '🛡️', label: 'Fraud', read: 'no pattern ✓', ok: true },
    { icon: '📋', label: 'Compliance', read: 'within policy ✓', ok: true },
  ],
}

const RISKY: RiskCase = {
  key: 'risky',
  draft: 'Refund $4,000 to order #8801 (disputed charge)',
  amount: '$4,000',
  level: 'HIGH',
  signals: [
    { icon: '🎯', label: 'Confidence', read: '55% · below 90%', ok: false },
    { icon: '💵', label: 'Amount', read: '$4,000 · over $100 limit', ok: false },
    { icon: '🛡️', label: 'Fraud', read: 'velocity flag · 3rd this week', ok: false },
    { icon: '📋', label: 'Compliance', read: 'over auto-limit · needs review', ok: false },
  ],
}

/* ── connector ────────────────────────────────────────────────────────── */

const VHEX = { paper: '#fdf6f0', sun: '#fbbf24', mint: '#34d399', coral: '#fb7185' } as const

function VConn({ tone = 'paper', active = true, dashed = false }: { tone?: keyof typeof VHEX; active?: boolean; dashed?: boolean }) {
  const c = VHEX[tone]
  return (
    <div className="flex justify-center py-1" aria-hidden>
      <svg width="16" height="20" viewBox="0 0 16 20">
        <line x1="8" y1="0" x2="8" y2="13" stroke={c} strokeWidth={active ? 2 : 1.4} strokeOpacity={active ? 1 : 0.3} strokeDasharray={dashed ? '4 4' : undefined} />
        <path d="M3 11 L8 18 L13 11" fill="none" stroke={c} strokeWidth={active ? 2 : 1.4} strokeOpacity={active ? 1 : 0.3} />
      </svg>
    </div>
  )
}

/* ── the gate ─────────────────────────────────────────────────────────── */

function Scorecard({ c, show }: { c: RiskCase; show: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {c.signals.map((s, i) => {
        const tone = !show
          ? 'border-white/10 opacity-40'
          : s.ok
          ? 'border-mint/60 bg-mint/10'
          : 'border-coral/60 bg-coral/10'
        return (
          <div
            key={s.label}
            className={`rounded-lg border-2 px-2.5 py-2 transition-all ${tone} ${show ? 'anim-pop-in' : ''}`}
            style={show ? { animationDelay: `${i * 70}ms` } : undefined}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base leading-none">{s.icon}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-paper/70">{s.label}</span>
              {show && <span className={`ml-auto text-xs font-bold ${s.ok ? 'text-mint' : 'text-coral'}`}>{s.ok ? '✓' : '✕'}</span>}
            </div>
            <p className={`mt-1 text-[11px] leading-tight ${show ? (s.ok ? 'text-mint/90' : 'text-coral/90') : 'text-paper/40'}`}>{s.read}</p>
          </div>
        )
      })}
    </div>
  )
}

function GateLanes({ verdict, decision }: { verdict: 'LOW' | 'HIGH' | null; decision: Decision | null }) {
  const low = verdict === 'LOW'
  const high = verdict === 'HIGH'
  return (
    <div className="grid grid-cols-2 gap-2">
      {/* low-risk lane */}
      <div className={`rounded-xl border-2 px-3 py-2.5 text-center transition-all ${low ? 'border-mint bg-mint/15 anim-pop-in' : 'border-white/10 opacity-45'}`}>
        <p className={`text-sm font-bold ${low ? 'text-mint' : 'text-paper/50'}`}>Low risk</p>
        <p className="text-[10px] leading-tight mt-0.5 text-paper/55">passes automatically → execute (L5)</p>
      </div>
      {/* high-risk lane */}
      <div className={`rounded-xl border-2 px-3 py-2.5 text-center transition-all ${high ? 'border-sun bg-sun/15 anim-pulse-glow' : 'border-white/10 opacity-45'}`}>
        <p className={`text-sm font-bold ${high ? 'text-sun' : 'text-paper/50'}`}>High risk</p>
        <p className="text-[10px] leading-tight mt-0.5 text-paper/55">
          {high && decision === 'approve'
            ? 'human approved → execute (L5)'
            : high && decision === 'reject'
            ? 'human rejected → back to agents'
            : '→ human approve / reject'}
        </p>
      </div>
    </div>
  )
}

function Gate({ step, decision }: { step: number; decision: Decision | null }) {
  const c: RiskCase = step >= 3 ? RISKY : SAFE
  const showSignals = step >= 1
  const showVerdict = c.key === 'safe' ? step >= 2 : step >= 4
  const verdict = showVerdict ? c.level : null

  const draftTone = c.key === 'risky' ? 'border-sun/50' : 'border-sky/50'

  return (
    <div className="mx-auto" style={{ maxWidth: 460 }}>
      {/* incoming proposal from L2/L3 */}
      <div className={`rounded-xl border-2 ${draftTone} bg-ink-soft px-3 py-2.5 text-center`}>
        <p className="text-[10px] font-mono uppercase tracking-wider text-paper/45">Proposed action · from agents + tools</p>
        <p className="text-sm font-bold text-paper mt-0.5 leading-tight">✍️ {c.draft}</p>
      </div>

      <VConn tone="sun" />

      {/* the guardrail */}
      <div className="rounded-2xl border-2 border-sun bg-sun/[0.06] p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-sun">🚦 Guardrail · risk & policy check</p>
          {verdict && (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${verdict === 'LOW' ? 'bg-mint/20 text-mint' : 'bg-sun/25 text-sun'}`}>
              {verdict} RISK
            </span>
          )}
        </div>
        <Scorecard c={c} show={showSignals} />
      </div>

      <VConn tone={verdict === 'LOW' ? 'mint' : verdict === 'HIGH' ? 'sun' : 'paper'} active={!!verdict} />

      <GateLanes verdict={verdict} decision={decision} />
    </div>
  )
}

/* ── page ─────────────────────────────────────────────────────────────── */

export default function Guardrails() {
  const [step, setStep] = useState(0)
  const [decision, setDecision] = useState<Decision | null>(null)

  // mirror the Gate's verdict logic for the live metric strip
  const curCase: RiskCase = step >= 3 ? RISKY : SAFE
  const showVerdict = curCase.key === 'safe' ? step >= 2 : step >= 4
  const verdict: 'LOW' | 'HIGH' | null = showVerdict ? curCase.level : null

  const watch = (
    <div>
      <Gate step={step} decision={decision} />
      <MetricRow
        items={[
          { label: 'Signals checked', value: 4, tone: 'sun' },
          {
            label: 'Verdict',
            value: verdict ?? '—',
            tone: verdict === 'HIGH' ? 'coral' : verdict === 'LOW' ? 'mint' : 'paper',
          },
          {
            label: 'Human gate',
            value: verdict === 'HIGH' ? 'required' : verdict === 'LOW' ? 'skipped' : '—',
            tone: verdict === 'HIGH' ? 'sun' : verdict === 'LOW' ? 'mint' : 'paper',
          },
        ]}
      />
    </div>
  )

  const humanPanel = step >= 5 && (
    <div className="mt-4 rounded-2xl border border-white/10 bg-ink-soft p-5 anim-float-in">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] uppercase tracking-widest text-paper/45">You’re the human gate</p>
        <PokeHint show={!decision} label="👆 approve or reject" />
      </div>
      <p className="text-sm text-paper/75 leading-relaxed mb-3">
        Flagged: <span className="text-sun font-semibold">$4,000</span> · <span className="text-sun font-semibold">55% confidence</span> ·{' '}
        <span className="text-coral font-semibold">fraud-velocity</span>. The agents did all the legwork — you own the last call.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setDecision('approve')}
          className={`rounded-lg border-2 px-3 py-2.5 transition-all ${decision === 'approve' ? 'border-mint bg-mint/15 text-mint' : 'border-white/15 text-paper/75 hover:bg-white/5'}`}
        >
          <p className="text-sm font-bold">✓ Approve</p>
          <p className="text-[10px] text-paper/50">let it execute</p>
        </button>
        <button
          onClick={() => setDecision('reject')}
          className={`rounded-lg border-2 px-3 py-2.5 transition-all ${decision === 'reject' ? 'border-coral bg-coral/15 text-coral' : 'border-white/15 text-paper/75 hover:bg-white/5'}`}
        >
          <p className="text-sm font-bold">✕ Reject</p>
          <p className="text-[10px] text-paper/50">bounce it back</p>
        </button>
      </div>

      {decision && (
        <div className="mt-4 rounded-xl border border-white/10 bg-ink p-4 anim-float-in">
          {decision === 'approve' ? (
            <p className="text-sm text-paper/85 leading-relaxed">
              <span className="text-mint font-bold">Approved.</span> It now continues to execution (Layer 5) — but the log records
              that <span className="text-mint font-semibold">you</span>, not the agent, authorized a high-risk $4,000 refund.
              Accountability is unambiguous, which is exactly what makes this deployable.
            </p>
          ) : (
            <p className="text-sm text-paper/85 leading-relaxed">
              <span className="text-coral font-bold">Rejected.</span> No money moved. The proposal bounces back to the agents with
              your reason attached. The gate just proved it isn’t a rubber stamp — a human <span className="text-coral font-semibold">stopped</span>{' '}
              a risky action before it became irreversible.
            </p>
          )}
        </div>
      )}
    </div>
  )

  const extras = (
    <>
      {humanPanel}
      <ToolStack
        show={step >= 6}
        tone="sun"
        stage="Layer 4 · Guardrails & Human Gate"
        primary={{
          name: 'Human-in-the-loop gate',
          tagline:
            'Let agents run freely up to the irreversible step, then block: a deterministic check scores the action and either auto-passes it or pauses for a human approve/reject — rationale attached.',
          badge: 'the pattern',
        }}
        alternatives={[
          { name: 'Guardrails AI', tagline: 'validators on every LLM output — structure, PII, toxicity, custom rules.' },
          { name: 'NeMo Guardrails', tagline: 'NVIDIA; programmable rails for topics + safety policies.' },
          { name: 'LangGraph interrupt()', tagline: 'pause the graph for human input, resume after approval.' },
          { name: 'native if/else checks', tagline: 'plain rules on confidence/amount — no framework at all.' },
        ]}
        snippetLabel="how you’d build it · gate + HITL pause"
        snippet={`def gate(state):
    a = state["proposal"]
    if (a.confidence >= 0.90 and a.amount <= 100
            and not a.fraud_flag and a.in_policy):
        return "execute"          # low risk → auto-pass
    return "human"                # high risk → block

# LangGraph: pause the run for a person, resume on reply
from langgraph.types import interrupt
def human(state):
    decision = interrupt({        # blocks here
        "draft": state["proposal"],
        "reasons": state["flags"]})
    return {"approved": decision == "approve"}`}
        note={
          <>
            The check is <span className="text-sun font-semibold">boring and inspectable on purpose</span> — you never let the
            model grade its own homework. Approve/reject is logged. Next layer: the irreversible move itself.
          </>
        }
      />
    </>
  )

  const outro = (
    <>
      <p>
        Guardrails are where a demo becomes a product. The agents propose; a{' '}
        <span className="text-sun font-semibold">risk-and-policy check</span> scores confidence, amount, fraud, and compliance;
        low risk flows and high risk waits for a person.
      </p>
      <p className="text-paper font-semibold">The design question is never “autonomous or not.” It’s:</p>
      <ul className="space-y-1">
        <li>• <span className="text-sun font-semibold">Which actions are irreversible or expensive?</span> — money, deletes, outbound mail</li>
        <li>• <span className="text-sun font-semibold">What signals flag risk?</span> — low confidence, high amount, fraud, out-of-policy</li>
        <li>• <span className="text-mint font-semibold">What flows automatically?</span> — the cheap, certain, in-policy majority</li>
      </ul>
      <p className="pt-1">
        Past the gate, the refund finally moves. Next:{' '}
        <Link to="/action" className="text-rose font-semibold underline underline-offset-2">action execution</Link> — where
        irreversible means irreversible.
      </p>
    </>
  )

  return (
    <ChapterShell
      chapter={chapter}
      beats={beats}
      onStep={setStep}
      watch={watch}
      extras={extras}
      outro={outro}
      noteLabel="↳ What the gate is actually checking"
    />
  )
}
