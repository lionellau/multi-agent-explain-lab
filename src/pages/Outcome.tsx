import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'
import { PokeHint } from '../components/Poke'
import { MetricRow, ToolStack } from '../components/Flow'
import type { Beat } from '../components/StorySteps'

const chapter = CHAPTERS.find((c) => c.path === '/outcome')!

/* ──────────────────────────────────────────────────────────────────────────
 *  LAYER 6 — OUTCOME & OBSERVABILITY  (theme: PAPER / neutral)
 *
 *  The money moved. This layer produces TWO records: the customer's receipt
 *  (outward) and the audit trail (inward) — the full trace of every layer,
 *  the rationale behind each decision, and the rolled-up metrics. It's the
 *  layer that makes the whole system debuggable, auditable, and improvable.
 *  ────────────────────────────────────────────────────────────────────── */

const beats: Beat[] = [
  {
    caption:
      'The money moved — but a system you can’t see into is a system you can’t run. The final layer turns that one action into two records: one for the customer, and one for you.',
    llmNote:
      'No model runs here either. This layer is pure bookkeeping — yet it’s what makes every clever thing above it operable. Without it you have a black box that occasionally moves money and never explains itself.',
    readingMs: 4800,
  },
  {
    caption:
      'Outward, the customer gets a plain receipt: refunded $79.00 to the card ending 4412, reference tx_91. That’s the human-facing outcome — short, clear, and verifiable.',
    llmNote:
      'The customer never sees the six layers, the gate, or the idempotency key. They see one honest sentence. Good observability makes the inside legible to operators and the outside calm for users.',
    readingMs: 4600,
  },
  {
    caption:
      'Inward, the system writes an audit trail: every layer this refund passed through, in order, each with a timestamp. The entire journey, reconstructed from logs after the fact.',
    llmNote:
      'A trace is the receipt for your engineers. When something breaks at 3am, this ordered record is the difference between “fixed in five minutes” and “no idea what happened.”',
    readingMs: 4800,
  },
  {
    caption:
      'And each step carries its rationale — why the intent was “refund,” why risk scored low, why it cleared the gate without a human. Not just what happened, but why it was allowed to.',
    llmNote:
      'Rationale is what turns a log into an explanation. It’s also your compliance story: when a regulator or a customer asks “why,” you answer from the record instead of guessing.',
    readingMs: 4800,
  },
  {
    caption:
      'Finally the metrics roll up: latency, cost per resolution, average confidence, and how many refunds auto-passed versus needed a human. This is the dashboard that catches a bill spiking or approvals drifting.',
    llmNote:
      'Metrics are how you notice the system changing before it hurts. Auto-pass rate creeping up? Maybe the gate got too loose. Cost per resolution climbing? Maybe an agent is looping. You can only fix what you measure.',
    readingMs: 4800,
  },
  {
    caption:
      'Your turn: two weeks later the customer disputes the charge — “I never got my refund.” With an audit trail you answer in seconds. Without one, it’s your word against theirs.',
    llmNote:
      'This is the moment observability pays for itself. The cost of logging everything is tiny; the cost of not being able to prove what happened is a re-refund, an escalation, and a customer who trusts you less.',
    readingMs: 4600,
  },
  {
    caption:
      'That closes the loop. The same traces that settle a dispute also feed back upstream — into smarter routing, tighter guardrails, and cheaper runs. Observability isn’t the end; it’s how the whole system gets better.',
    llmNote:
      'Six layers in, the pattern is complete: orchestrate, specialise, call tools, gate the risk, execute exactly once, and observe everything. That last layer is what lets you trust — and keep improving — the five above it.',
    readingMs: 5000,
  },
]

/* ── the audit trail ──────────────────────────────────────────────────── */

interface Trace {
  layer: string
  hex: string
  icon: string
  what: string
  time: string
  why: string
}

const TRACE: Trace[] = [
  { layer: 'L1 · Orchestration', hex: '#a78bfa', icon: '🧭', time: '14:30:01', what: 'intent = refund · standard route', why: '“double-charged” + $79 amount → refund intent, low-stakes route' },
  { layer: 'L2 · Specialists', hex: '#38bdf8', icon: '👥', time: '14:30:02', what: 'policy fetched · reply drafted', why: 'policy: duplicate charges are fully refundable → drafted $79 reply' },
  { layer: 'L3 · Tools', hex: '#34d399', icon: '🔧', time: '14:30:02', what: 'get_charges · search_policy', why: 'confirmed two identical $79 charges on order #4412' },
  { layer: 'L4 · Guardrail', hex: '#fbbf24', icon: '🚦', time: '14:30:03', what: 'LOW risk · auto-passed', why: '98% conf · $79 ≤ $100 · no fraud · in policy → no human needed' },
  { layer: 'L5 · Action', hex: '#f472b6', icon: '💸', time: '14:30:03', what: 'issue_refund → tx_91', why: 'key rfnd_4412 · $79.00 moved exactly once' },
  { layer: 'L6 · Outcome', hex: '#fdf6f0', icon: '🧾', time: '14:30:04', what: 'receipt sent · customer notified', why: 'confirmation emailed; trace + metrics written to the log' },
]

const METRICS = [
  { label: 'Latency', value: '2.4s', tone: 'text-sky' },
  { label: 'Cost / resolution', value: '$0.03', tone: 'text-mint' },
  { label: 'Confidence', value: '98%', tone: 'text-grape-soft' },
  { label: 'Auto-passed', value: '87%', tone: 'text-sun' },
]

function Records({ step }: { step: number }) {
  const showTrace = step >= 2
  const showWhy = step >= 3
  const showMetrics = step >= 4

  return (
    <div className="mx-auto" style={{ maxWidth: 460 }}>
      {/* outward: customer receipt */}
      <div className="rounded-xl border-2 border-paper/40 bg-paper/[0.04] px-3 py-3">
        <p className="text-[10px] font-mono uppercase tracking-wider text-paper/45">Outward · to the customer</p>
        <div className="mt-1 flex items-start gap-2">
          <span className="text-lg leading-none">🧾</span>
          <div>
            <p className="text-sm font-bold text-paper leading-tight">Refunded $79.00 to card ending 4412</p>
            <p className="text-[11px] text-paper/55 leading-tight mt-0.5">Reference tx_91 · should appear in 3–5 business days.</p>
          </div>
        </div>
      </div>

      {/* inward: the audit trail */}
      <div className="mt-3 rounded-xl border border-white/12 bg-ink overflow-hidden">
        <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
          <span className="text-sm">📜</span>
          <p className="text-[11px] uppercase tracking-widest text-paper/65">Inward · audit trail</p>
          {showTrace && <span className="ml-auto text-[10px] font-mono text-paper/40">6 steps · 2.4s total</span>}
        </div>
        <div className="p-2.5 space-y-1.5 min-h-[150px]">
          {!showTrace && <p className="text-[11px] text-paper/35 italic px-1 py-6 text-center">…writing the trace as the refund runs</p>}
          {showTrace &&
            TRACE.map((t, i) => (
              <div
                key={t.layer}
                className="rounded-lg border border-white/8 bg-ink-soft px-2.5 py-1.5 anim-float-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.hex }} aria-hidden />
                  <span className="text-[11px] font-bold text-paper/85">{t.icon} {t.layer}</span>
                  <span className="ml-auto text-[9px] font-mono text-paper/35">{t.time}</span>
                </div>
                <p className="text-[11px] text-paper/70 leading-tight mt-0.5 pl-4">{t.what}</p>
                {showWhy && (
                  <p className="text-[10px] leading-tight mt-0.5 pl-4 anim-float-in" style={{ color: t.hex, opacity: 0.85 }}>
                    ↳ {t.why}
                  </p>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* metrics roll-up */}
      {showMetrics && (
        <div className="mt-3 grid grid-cols-4 gap-2 anim-float-in">
          {METRICS.map((m) => (
            <div key={m.label} className="rounded-lg border border-white/10 bg-ink px-1 py-2 text-center">
              <p className={`text-base font-bold ${m.tone} leading-none`}>{m.value}</p>
              <p className="text-[9px] uppercase tracking-wider text-paper/45 leading-tight mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── page ─────────────────────────────────────────────────────────────── */

type DisputeMode = 'none' | 'trace'

export default function Outcome() {
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<DisputeMode | null>(null)

  const watch = (
    <div>
      <Records step={step} />
      <MetricRow
        items={[
          { label: 'Records kept', value: step >= 2 ? '2 · receipt + trace' : step >= 1 ? '1 · receipt' : '—', tone: 'paper' },
          { label: 'Trace steps', value: step >= 2 ? TRACE.length : 0, tone: 'paper' },
          { label: 'Replayable', value: step >= 2 ? 'yes' : '—', tone: step >= 2 ? 'mint' : 'paper' },
        ]}
      />
    </div>
  )

  const disputePanel = step >= 5 && (
    <div className="mt-4 rounded-2xl border border-white/10 bg-ink-soft p-5 anim-float-in">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] uppercase tracking-widest text-paper/45">The dispute test</p>
        <PokeHint show={!mode} label="👆 pick a system" />
      </div>
      <div className="rounded-lg border border-white/10 bg-ink px-3 py-2 mb-3 flex items-start gap-2">
        <span className="text-base leading-none">📨</span>
        <p className="text-xs text-paper/80 leading-snug">
          Two weeks later: <span className="text-paper font-semibold">“I never got my $79 refund.”</span> Which system are you running?
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setMode('none')}
          className={`rounded-lg border-2 px-3 py-2.5 text-left transition-all ${mode === 'none' ? 'border-coral bg-coral/15' : 'border-white/15 hover:bg-white/5'}`}
        >
          <p className={`text-sm font-bold ${mode === 'none' ? 'text-coral' : 'text-paper/80'}`}>No audit trail</p>
          <p className="text-[10px] text-paper/50">it just moved money</p>
        </button>
        <button
          onClick={() => setMode('trace')}
          className={`rounded-lg border-2 px-3 py-2.5 text-left transition-all ${mode === 'trace' ? 'border-mint bg-mint/15' : 'border-white/15 hover:bg-white/5'}`}
        >
          <p className={`text-sm font-bold ${mode === 'trace' ? 'text-mint' : 'text-paper/80'}`}>Full observability</p>
          <p className="text-[10px] text-paper/50">every step logged</p>
        </button>
      </div>

      {mode && (
        <div className="mt-4 rounded-xl border border-white/10 bg-ink p-4 anim-float-in">
          {mode === 'none' ? (
            <p className="text-sm text-paper/85 leading-relaxed">
              <span className="text-coral font-bold">You’re stuck.</span> Nothing recorded the decision. You dig through the bank
              export by hand, can’t prove it shipped, and to keep the customer happy you refund <span className="text-coral font-semibold">again</span> —
              now you’ve paid $158. Hours gone, trust dented.
            </p>
          ) : (
            <p className="text-sm text-paper/85 leading-relaxed">
              <span className="text-mint font-bold">Resolved in 30 seconds.</span> You pull tx_91: refunded $79.00 at 14:30,
              customer notified at 14:32, auto-passed at low risk. You reply with the proof. The dispute closes, and the trace
              becomes evidence — not a guess.
            </p>
          )}
        </div>
      )}
    </div>
  )

  const extras = (
    <>
      {disputePanel}
      <ToolStack
        show={step >= 6}
        tone="paper"
        stage="Layer 6 · Outcome & Observability"
        primary={{
          name: 'LangSmith tracing',
          tagline:
            'Wrap the run once and every layer auto-logs its inputs, outputs, latency, and cost — the whole refund becomes a replayable trace you can open, diff, and turn into eval cases.',
          badge: 'tracing standard',
        }}
        alternatives={[
          { name: 'Langfuse', tagline: 'open-source traces + evals; self-host or cloud, framework-agnostic.' },
          { name: 'OpenTelemetry', tagline: 'vendor-neutral spans; pipe into Grafana / Datadog / Honeycomb.' },
          { name: 'Helicone', tagline: 'proxy-based logging — drop-in, captures cost + tokens per call.' },
          { name: 'native logging', tagline: 'structured JSON logs + your own dashboard — no extra service.' },
        ]}
        snippetLabel="how you’d build it · one decorator, full trace"
        snippet={`from langsmith import traceable

@traceable(name="refund_bot")          # the whole run is one trace
def handle(ticket):
    intent = route(ticket)             # each call logged: in, out, ms, $
    draft  = specialists(intent)
    if gate(draft).passed:
        return execute(draft)          # trace + metrics → dashboard`}
        note={
          <>
            The same trace that <span className="text-mint font-semibold">settles a dispute</span> is also your eval set: replay
            real runs, score them, and feed the misses back into <span className="text-grape-soft font-semibold">routing</span> and{' '}
            <span className="text-sun font-semibold">guardrails</span>. That feedback loop is how the six layers keep improving.
          </>
        }
      />
    </>
  )

  const outro = (
    <>
      <p>
        Observability is the layer that makes the other five <span className="text-paper font-semibold">trustworthy</span>: a
        clean receipt for the customer, and a complete <span className="text-paper font-semibold">trace, rationale, and metrics</span> for you.
      </p>
      <p>What this layer buys you:</p>
      <ul className="space-y-1">
        <li>• <span className="text-paper font-semibold">Debugging</span> — replay any run, step by step</li>
        <li>• <span className="text-paper font-semibold">Compliance</span> — answer “why” from the record, not memory</li>
        <li>• <span className="text-paper font-semibold">Improvement</span> — metrics feed back into better routing &amp; gates</li>
      </ul>
      <p className="pt-1">
        That’s the whole refund bot, end to end. Last stop: how to{' '}
        <Link to="/placement" className="text-grape-soft font-semibold underline underline-offset-2">actually build this</Link> —
        the frameworks, and whether you even need multi-agent at all.
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
      noteLabel="↳ What the audit trail captures"
    />
  )
}
