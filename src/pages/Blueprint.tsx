import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'
import { PokeHint } from '../components/Poke'
import type { Beat } from '../components/StorySteps'

const chapter = CHAPTERS.find((c) => c.path === '/blueprint')!

/* One color = one meaning, taken straight from the reference blueprint. These
   are the legend tones the whole lab reuses. */
const TONE = {
  grape: { text: 'text-grape-soft', border: 'border-grape-soft', bg: 'bg-grape/10', ring: 'ring-grape-soft/50', dot: 'bg-grape-soft' },
  sky: { text: 'text-sky', border: 'border-sky', bg: 'bg-sky/10', ring: 'ring-sky/50', dot: 'bg-sky' },
  mint: { text: 'text-mint', border: 'border-mint', bg: 'bg-mint/10', ring: 'ring-mint/50', dot: 'bg-mint' },
  sun: { text: 'text-sun', border: 'border-sun', bg: 'bg-sun/10', ring: 'ring-sun/50', dot: 'bg-sun' },
  rose: { text: 'text-rose', border: 'border-rose', bg: 'bg-rose/10', ring: 'ring-rose/50', dot: 'bg-rose' },
  paper: { text: 'text-paper', border: 'border-paper/45', bg: 'bg-paper/10', ring: 'ring-paper/40', dot: 'bg-paper' },
} as const

type ToneKey = keyof typeof TONE

const beats: Beat[] = [
  {
    caption:
      'The whole system on one page. A customer message enters the top — “I was double-charged, refund me.” Real money moves near the bottom. Six layers sit in between. Every later chapter is one of these bands.',
    llmNote:
      'Nothing here is hypothetical plumbing. This is the shape of a real refund bot. Read it top to bottom: the request falls through orchestration, agents, tools, a gate, the action, and the receipt. Hold this map — the rest of the lab just zooms into one band at a time.',
    readingMs: 5200,
  },
  {
    caption:
      'Layer 1 — Orchestration. One supervisor reads the message, detects intent (“this is a refund”), scores how risky it is, and routes it to the right specialist. This is the framework layer: LangGraph, CrewAI Flows, AutoGen.',
    llmNote:
      'The orchestrator is the only part that sees the whole picture. It does not do the work — it decides who works next. Get this wrong and every layer below it receives the wrong job.',
    readingMs: 5000,
  },
  {
    caption:
      'Layer 2 — Specialist agents. The supervisor hands off to focused workers: a Knowledge agent fetches policy, a Support agent clarifies and drafts the reply, an Escalation agent decides if a human is needed. One job each.',
    llmNote:
      'Each agent runs with a narrow prompt and a clean context. Splitting “find the policy” from “write the reply” is exactly the multi-agent bet from the last chapter — and here the jobs are genuinely different.',
    readingMs: 5000,
  },
  {
    caption:
      'Layer 3 — Tools & systems. Agents are useless without hands. This layer is the real systems they reach: a policy vector DB, the CRM, the orders/billing system, the refund API. The wiring is MCP, APIs, and function calls.',
    llmNote:
      'A tool call is how an agent reaches outside its own weights — to look up this customer’s order, or to actually move money. The agent decides what to call; the tool decides what is allowed.',
    readingMs: 5000,
  },
  {
    caption:
      'Layer 4 — Guardrails & the human gate. Before any money moves, a risk and policy check runs: confidence, amount, fraud, compliance. Low risk and within policy passes through. High risk routes to a human who approves or rejects.',
    llmNote:
      'This is the seam where autonomy becomes a dial, not a switch. The cheaper and more reversible the action, the more you let the system act alone. Real money on the line → a human signs off.',
    readingMs: 5200,
  },
  {
    caption:
      'Layer 5 — Action execution. Everything upstream was reversible thinking. This is the act: call the refund API and move real money. It runs only once it has cleared the gate — and it must be safe to retry without paying twice.',
    llmNote:
      'There is exactly one irreversible moment in this whole diagram, and this is it. Idempotency keys, not optimism, are what keep a retry from refunding the customer a second time.',
    readingMs: 5000,
  },
  {
    caption:
      'Layer 6 — Outcome & observability. The money moved — now prove it. A receipt goes to the customer; a trace, the decision rationale, and metrics go to your logs. This is the difference between “it ran” and “we can stand behind it.”',
    llmNote:
      'Observability is not an afterthought bolted on at the end — it is the layer that lets you debug every layer above. When a refund goes wrong, the audit trail is the only thing that tells you which band failed.',
    readingMs: 5000,
  },
  {
    caption:
      'That’s the cross-section. Six bands, one color each, one message falling through all of them. Click any layer to dive into its chapter — then test yourself below.',
    llmNote:
      'Debugging a multi-agent system is reading this map in reverse: a symptom points to a band. “It refunded a fraudster” → guardrails. “It forgot the order number” → tools or agents. Learn the bands and the bugs become addressable.',
    readingMs: 4600,
  },
]

interface Band {
  beat: number
  layer: string
  path: string
  tone: ToneKey
  title: string
  desc: string
  items: { label: string; sub: string }[]
  via?: string
  gate?: boolean
}

const CUSTOMER = {
  emoji: '🧑',
  label: 'Customer',
  msg: '“I was double-charged $79 on my order — can I get a refund?”',
}

const BANDS: Band[] = [
  {
    beat: 1,
    layer: 'Layer 1 · Orchestration',
    path: '/orchestration',
    tone: 'grape',
    title: 'Supervisor / Router',
    desc: 'Reads the request, scores the risk, decides who works next.',
    items: [
      { label: 'Intent detection', sub: '“this is a refund”' },
      { label: 'Risk scoring', sub: 'how dangerous is it?' },
      { label: 'Routing', sub: 'who handles it' },
    ],
    via: 'LangGraph · CrewAI Flows · AutoGen · custom',
  },
  {
    beat: 2,
    layer: 'Layer 2 · Specialist Agents',
    path: '/agents',
    tone: 'sky',
    title: 'Focused workers, one job each',
    desc: 'The supervisor hands the work to specialists.',
    items: [
      { label: 'Knowledge agent', sub: 'fetch policy via RAG' },
      { label: 'Support agent', sub: 'clarify · draft reply' },
      { label: 'Escalation agent', sub: 'human needed?' },
    ],
  },
  {
    beat: 3,
    layer: 'Layer 3 · Tools & Systems',
    path: '/tools',
    tone: 'mint',
    title: 'The real systems agents touch',
    desc: 'What gives agents hands.',
    items: [
      { label: 'Vector DB', sub: 'policy docs' },
      { label: 'CRM', sub: 'customer record' },
      { label: 'Orders / Billing', sub: 'the charge' },
      { label: 'Refund API', sub: 'moves money' },
      { label: 'Ticketing', sub: 'the case' },
      { label: 'Notifications', sub: 'email / SMS' },
    ],
    via: 'via MCP · APIs · function calling',
  },
  {
    beat: 4,
    layer: 'Layer 4 · Guardrails & Human Gate',
    path: '/guardrails',
    tone: 'sun',
    title: 'Risk / policy check, then a human',
    desc: 'Confidence · refund amount · fraud · compliance.',
    items: [
      { label: 'Low risk & in policy', sub: 'passes straight through' },
      { label: 'High risk / high amount', sub: '→ human approves or rejects' },
    ],
    gate: true,
  },
  {
    beat: 5,
    layer: 'Layer 5 · Action Execution',
    path: '/action',
    tone: 'rose',
    title: 'Execute the refund',
    desc: 'Call the refund API / payment gateway.',
    items: [
      { label: 'Real money movement', sub: 'the irreversible step' },
      { label: 'Safe to retry', sub: 'idempotency key' },
    ],
  },
  {
    beat: 6,
    layer: 'Layer 6 · Outcome & Observability',
    path: '/outcome',
    tone: 'paper',
    title: 'Receipt + audit trail',
    desc: 'Prove the thing that happened, happened.',
    items: [
      { label: 'Refund issued', sub: 'receipt to customer' },
      { label: 'Audit & traces', sub: 'logs · rationale · metrics' },
    ],
  },
]

function VConn({ active }: { active: boolean }) {
  return (
    <div className="flex justify-center" aria-hidden>
      <svg width="18" height="22" viewBox="0 0 18 22" className={active ? 'anim-dash-flow' : ''}>
        <line x1="9" y1="0" x2="9" y2="15" stroke="#fdf6f0" strokeOpacity={active ? 0.55 : 0.22} strokeWidth="2" strokeDasharray={active ? '4 3' : undefined} />
        <path d="M4 13 L9 19 L14 13" fill="none" stroke="#fdf6f0" strokeOpacity={active ? 0.55 : 0.22} strokeWidth="2" />
      </svg>
    </div>
  )
}

function BandCard({ band, state }: { band: Band; state: 'active' | 'seen' | 'future' | 'all' }) {
  const t = TONE[band.tone]
  const shell =
    state === 'active'
      ? `${t.border} ${t.bg} ring-2 ring-offset-2 ring-offset-ink ${t.ring} scale-[1.02] anim-pop-in`
      : state === 'future'
      ? 'border-white/10 opacity-40'
      : state === 'seen'
      ? `${t.border} opacity-90`
      : `${t.border} ${t.bg} opacity-100`
  return (
    <Link
      to={band.path}
      title={`Open ${band.layer}`}
      className={`group block rounded-2xl border-2 bg-ink-soft px-3.5 py-3 transition-all hover:opacity-100 hover:scale-[1.01] ${shell}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className={`text-[10px] font-semibold uppercase tracking-widest ${t.text}`}>{band.layer}</span>
        <span className={`text-[10px] ${t.text} opacity-0 group-hover:opacity-100 transition-opacity`}>open →</span>
      </div>
      <p className={`text-sm font-bold ${t.text}`}>{band.title}</p>
      <p className="text-[11px] text-paper/55 leading-snug mb-2">{band.desc}</p>

      {band.gate ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-mint/40 bg-mint/5 px-2.5 py-2">
            <p className="text-[11px] font-semibold text-mint">{band.items[0].label}</p>
            <p className="text-[10px] text-paper/55">{band.items[0].sub}</p>
          </div>
          <div className="rounded-lg border border-coral/40 bg-coral/5 px-2.5 py-2">
            <p className="text-[11px] font-semibold text-coral">{band.items[1].label}</p>
            <p className="text-[10px] text-paper/55">{band.items[1].sub}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {band.items.map((it) => (
            <span key={it.label} className={`rounded-lg border ${t.border} bg-ink px-2 py-1 leading-tight`}>
              <span className={`block text-[11px] font-semibold ${t.text}`}>{it.label}</span>
              <span className="block text-[9px] text-paper/45">{it.sub}</span>
            </span>
          ))}
        </div>
      )}

      {band.via && <p className={`mt-2 text-[10px] font-mono ${t.text} opacity-70`}>{band.via}</p>}
    </Link>
  )
}

// Quiz: a risky refund — which layer keeps it from going through automatically?
const QUIZ = BANDS.map((b) => ({ id: b.path, label: b.layer.split('·')[1].trim(), tone: b.tone }))

export default function Blueprint() {
  const [step, setStep] = useState(0)
  const [pick, setPick] = useState<string | null>(null)

  const spotlight = step >= 1 && step <= 6 ? step : null

  const watch = (
    <div>
      {/* Customer entry */}
      <div className={`rounded-2xl border-2 ${TONE.paper.border} bg-ink-soft px-3.5 py-3 ${spotlight ? 'opacity-90' : 'opacity-100'}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{CUSTOMER.emoji}</span>
          <div>
            <p className={`text-sm font-bold ${TONE.paper.text}`}>{CUSTOMER.label}</p>
            <p className="text-[11px] text-paper/65 leading-snug">{CUSTOMER.msg}</p>
          </div>
        </div>
      </div>

      {BANDS.map((band) => {
        const state: 'active' | 'seen' | 'future' | 'all' =
          spotlight === null ? 'all' : step === band.beat ? 'active' : step > band.beat ? 'seen' : 'future'
        return (
          <div key={band.path}>
            <VConn active={spotlight !== null && step === band.beat} />
            <BandCard band={band} state={state} />
          </div>
        )
      })}

      <p className="mt-3 text-center text-[11px] text-paper/40">
        One color = one meaning. Each band is a chapter — tap to dive in.
      </p>
    </div>
  )

  const extras = step >= 7 ? (
    <div className="mt-4 rounded-2xl border border-white/10 bg-ink-soft p-5 anim-float-in">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-widest text-paper/45">Read the system, find the layer</p>
        <PokeHint show={!pick} label="👆 pick a layer" />
      </div>
      <p className="text-paper/85 text-sm leading-relaxed">
        A customer asks for a <span className="text-paper font-semibold">$4,000 refund</span> and the model is only{' '}
        <span className="text-paper font-semibold">55% sure</span> it’s legitimate. Which layer keeps that from going
        through automatically?
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {QUIZ.map((q) => (
          <button
            key={q.id}
            onClick={() => setPick(q.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
              pick === q.id ? `${TONE[q.tone].border} ${TONE[q.tone].bg} ${TONE[q.tone].text}` : 'border-white/15 text-paper/70 hover:bg-white/5'
            }`}
          >
            {q.label}
          </button>
        ))}
      </div>
      {pick && (
        <div className="mt-4 rounded-xl border border-white/10 bg-ink p-4 anim-float-in">
          {pick === '/guardrails' ? (
            <p className="text-sm text-paper/85 leading-relaxed">
              <span className="text-sun font-bold">Layer 4 — Guardrails.</span> High amount plus low confidence is exactly
              what the risk check is for. It refuses to auto-approve and routes the refund to a human, who sees the agent’s
              summary and approves or rejects. The action layer never even fires until the gate says yes.
            </p>
          ) : (
            <p className="text-sm text-paper/85 leading-relaxed">
              <span className="text-paper font-bold">Not quite.</span> A big, low-confidence refund is stopped at the{' '}
              <span className="text-sun font-semibold">Guardrails &amp; Human Gate</span> (Layer 4) — that’s the band that
              weighs amount, confidence, and fraud before any money can move. The other layers route, fetch, execute, or
              log; only the gate can hold the action back.
            </p>
          )}
        </div>
      )}
    </div>
  ) : null

  const outro = (
    <>
      <p>
        A multi-agent system is a stack of layers, each with one color and one job: the supervisor routes, the
        specialists work, tools reach real systems, the gate protects the money, the action moves it, and observability
        proves it.
      </p>
      <p>
        Debugging is this map in reverse — a symptom names a band. Keep the cross-section in mind; the next six chapters
        each open one of these layers.
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
      noteLabel="↳ What this layer is doing"
    />
  )
}
