import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'
import { PokeHint } from '../components/Poke'
import type { Beat } from '../components/StorySteps'

const chapter = CHAPTERS.find((c) => c.path === '/placement')!

/* ──────────────────────────────────────────────────────────────────────────
 *  CHAPTER 09 — FRAMEWORK PLACEMENT  (recap · theme GRAPE)
 *
 *  The whole lab in one screen: the six layers are the system; frameworks
 *  just fill them in. First decide whether you even need multi-agent, then
 *  map one of three real stacks (A: LangGraph+LangChain · B: CrewAI Flows ·
 *  C: Microsoft/AutoGen) onto the layers the reader just learned.
 *  ────────────────────────────────────────────────────────────────────── */

const beats: Beat[] = [
  {
    caption:
      'You’ve seen all six layers. Here’s the part nobody says out loud: the layers are the system — frameworks just fill them in. But first, the only question that matters on day one: do you even need more than one agent?',
    llmNote:
      'The honest default is ONE agent with good tools. Every extra agent adds cost, latency, and new failure modes. Multi-agent has to earn its place — don’t reach for it because it sounds impressive.',
    readingMs: 5000,
  },
  {
    caption:
      'When the work does earn a split, the recommended stack maps cleanly onto the blueprint. Option A: LangGraph runs the orchestration as a state graph, and LangChain agents are the specialists beneath it.',
    llmNote:
      'See the move: you already decided the architecture — six layers — so picking a framework is just choosing what fills each row. The shape comes first; the library comes second.',
    readingMs: 5000,
  },
  {
    caption:
      'Its tools layer is LangChain tools, retrievers, and MCP. Its guardrail is a conditional edge plus interrupt() — LangGraph’s built-in pause for a human to approve the refund.',
    llmNote:
      'Notice the guardrail isn’t a bolt-on; it’s a first-class feature of the framework. That’s exactly what to look for when you evaluate one: does it make the human gate easy, or an afterthought?',
    readingMs: 5000,
  },
  {
    caption:
      'And the bottom: a tool node calls the Refund API idempotently, while LangSmith captures the trace and the metrics. That’s a full, production-shaped refund bot — Option A, end to end.',
    llmNote:
      'Every layer you studied now has a concrete component. The framework didn’t invent the architecture — it gave you ergonomic defaults for the architecture you already understood.',
    readingMs: 4800,
  },
  {
    caption:
      'Same six layers, different fillings. CrewAI gives you Flows plus a role crew; the Microsoft stack gives you AutoGen conversation plus Semantic Kernel. Swap the stack in the panel and watch every layer re-label.',
    llmNote:
      'This is why the layer model is worth more than any one framework. Read a new tool by asking “which layer does each piece sit in?” and you understand it before reading the docs.',
    readingMs: 5000,
  },
  {
    caption:
      'That’s the real lesson of the whole lab: choose the architecture first — these six layers — then pick a framework to express it. Never the other way around.',
    llmNote:
      'Teams that start from a framework end up bending their problem to fit its defaults. Teams that start from the layers pick — or skip — frameworks deliberately, and swap them without losing the plot.',
    readingMs: 4800,
  },
  {
    caption:
      'Default to one agent. Split only when the work demands it. Put a human at the irreversible gate, log everything, and pick the stack that fits your team. That’s the whole thing. Now go build.',
    llmNote:
      'You can now read any agentic system by walking the six layers: orchestrate, specialise, call tools, gate the risk, execute exactly once, observe everything. That mental model is yours — it outlives every framework.',
    readingMs: 5200,
  },
]

/* ── do-you-need-multi-agent triggers ─────────────────────────────────── */

type Trigger = 'skills' | 'parallel' | 'safety' | 'scale'

const TRIGGERS: { id: Trigger; label: string; sub: string }[] = [
  { id: 'skills', label: 'Genuinely distinct skills per step', sub: 'e.g. policy lookup AND a compliance check — different expertise' },
  { id: 'parallel', label: 'Work that can run in parallel', sub: 'check fraud, fetch the order, and draft a reply at once' },
  { id: 'safety', label: 'A hard safety / trust boundary', sub: 'isolate the money-moving step behind a gate' },
  { id: 'scale', label: 'Different models or permissions per role', sub: 'a cheap model triages; an expensive one only when needed' },
]

/* ── which stack fits? (situation → recommended stack) ─────────────────── */

type Fit = 'control' | 'ecosystem' | 'roles' | 'azure'

const FITS: { id: Fit; label: string; sub: string; pick: Stack }[] = [
  { id: 'control', label: 'We want explicit, debuggable control flow', sub: 'see every state transition, replay it, step through it', pick: 'A' },
  { id: 'ecosystem', label: 'We want the biggest ecosystem + built-in human gate', sub: 'most integrations and retrievers; HITL as a first-class feature', pick: 'A' },
  { id: 'roles', label: 'We want named-role specialists, fast', sub: 'stand up a crew of agents with minimal wiring', pick: 'B' },
  { id: 'azure', label: 'We already live in Azure / Microsoft', sub: 'Azure OpenAI, Semantic Kernel, Azure Monitor are in the stack', pick: 'C' },
]

// Tally fit votes; A wins ties (it is the recommended default). null = nothing ticked.
function recommendFromFits(fits: Record<Fit, boolean>): Stack | null {
  const votes: Record<Stack, number> = { A: 0, B: 0, C: 0 }
  let any = false
  for (const f of FITS) if (fits[f.id]) { votes[f.pick] += 1; any = true }
  if (!any) return null
  const order: Stack[] = ['A', 'B', 'C']
  return order.reduce((best, s) => (votes[s] > votes[best] ? s : best), 'A' as Stack)
}

/* ── the six layers (blueprint legend) ────────────────────────────────── */

type LayerId = 'orchestration' | 'agents' | 'tools' | 'guardrails' | 'action' | 'outcome'

const LAYERS: { id: LayerId; n: string; name: string; hex: string; icon: string }[] = [
  { id: 'orchestration', n: 'L1', name: 'Orchestration', hex: '#a78bfa', icon: '🧭' },
  { id: 'agents', n: 'L2', name: 'Specialist agents', hex: '#38bdf8', icon: '👥' },
  { id: 'tools', n: 'L3', name: 'Tools & systems', hex: '#34d399', icon: '🔧' },
  { id: 'guardrails', n: 'L4', name: 'Guardrails & gate', hex: '#fbbf24', icon: '🚦' },
  { id: 'action', n: 'L5', name: 'Action execution', hex: '#f472b6', icon: '💸' },
  { id: 'outcome', n: 'L6', name: 'Outcome & observability', hex: '#fdf6f0', icon: '📊' },
]

/* ── the three stacks ─────────────────────────────────────────────────── */

type Stack = 'A' | 'B' | 'C'

interface StackDef {
  id: Stack
  name: string
  model: string
  best: string
  runtime: string
  recommended?: boolean
  layers: Record<LayerId, string>
}

const STACKS: Record<Stack, StackDef> = {
  A: {
    id: 'A',
    name: 'LangGraph + LangChain',
    model: 'Claude / GPT',
    best: 'Most teams. Explicit control flow, a huge ecosystem, and first-class human-in-the-loop.',
    runtime: 'Ships as a Python service (LangGraph Platform or your own FastAPI). Each node is a model call — cache retrievals and cap loops to control token cost and latency.',
    recommended: true,
    layers: {
      orchestration: 'LangGraph — state graph + conditional edges',
      agents: 'LangChain agents as graph nodes',
      tools: 'LangChain tools · retrievers · MCP',
      guardrails: 'conditional edge + interrupt() gate',
      action: 'tool node → Refund API (idempotent)',
      outcome: 'LangSmith traces + metrics',
    },
  },
  B: {
    id: 'B',
    name: 'CrewAI Flows + Crews',
    model: 'Claude / GPT',
    best: 'Role-first ergonomics — stand up a crew of named specialists fast, with Flows for control.',
    runtime: 'Runs as a Python process or CrewAI deployment. Independent role-agents can run in parallel — fan them out to cut wall-clock latency, but watch the combined token bill.',
    layers: {
      orchestration: 'CrewAI Flow — @start / @router events',
      agents: 'a Crew of role-agents',
      tools: 'CrewAI Tools + MCP adapters',
      guardrails: 'Flow branch + human_input step',
      action: 'a Tool → Refund API (idempotent)',
      outcome: 'event listeners + run traces',
    },
  },
  C: {
    id: 'C',
    name: 'Microsoft / AutoGen',
    model: 'Azure OpenAI / Claude',
    best: 'Azure shops and conversation-driven agents; deep Microsoft + Semantic Kernel integration.',
    runtime: 'Hosts on Azure Container Apps or Functions. Conversation rounds add latency — cap the turn count, and let Azure Monitor track spend per resolution.',
    layers: {
      orchestration: 'AutoGen GroupChat / Magentic orchestrator',
      agents: 'AutoGen AssistantAgents',
      tools: 'Semantic Kernel plugins + MCP',
      guardrails: 'UserProxyAgent human-in-the-loop',
      action: 'function tool → Refund API (idempotent)',
      outcome: 'OpenTelemetry → Azure Monitor',
    },
  },
}

const OTHER_TOOLS = ['OpenAI Agents SDK', 'Semantic Kernel', 'LlamaIndex Workflows', 'Google ADK', 'a plain loop in your own code']

/* ── from blueprint to shipped (build sequence, stack-agnostic) ────────── */

const BUILD_STEPS: { n: string; t: string; d: string; hex: string }[] = [
  { n: 'L1', t: 'Scaffold the orchestrator first', d: 'Stand up the router/graph that owns the flow — one entry, one exit. Hard-code the happy path before adding branches.', hex: '#a78bfa' },
  { n: 'L2·L3', t: 'Drop in specialists + their tools', d: 'Give each agent one job and only the tools it needs. Mock the tools, prove the wiring, then connect the real APIs.', hex: '#34d399' },
  { n: 'L4·L5', t: 'Gate the irreversible step', d: 'Put the risk/policy check in front of the money-moving call, with a human approval on high risk — before you ever run it live.', hex: '#fbbf24' },
  { n: 'L6', t: 'Trace everything, then ship', d: 'Turn on observability and idempotency keys before launch. You cannot debug — or prove — what you did not log.', hex: '#fdf6f0' },
]

/* ── the layer map ────────────────────────────────────────────────────── */

function StackMap({ step, stack, userPicked }: { step: number; stack: Stack; userPicked: boolean }) {
  // Each Next reveals one more pair of layers (story walks Option A top→bottom);
  // once the reader picks a stack, the whole map fills in for that stack.
  const revealed = userPicked ? 6 : Math.min(step * 2, 6)
  const def = STACKS[stack]

  return (
    <div className="mx-auto" style={{ maxWidth: 460 }}>
      {/* customer */}
      <div className="rounded-xl border-2 border-grape-soft bg-ink-soft px-3 py-2 text-center">
        <p className="text-sm font-bold text-grape-soft leading-tight">👤 “I was double-charged $79 — refund me.”</p>
      </div>

      <div className="flex justify-center py-1" aria-hidden>
        <svg width="16" height="20" viewBox="0 0 16 20">
          <line x1="8" y1="0" x2="8" y2="13" stroke="#a78bfa" strokeWidth={2} />
          <path d="M3 11 L8 18 L13 11" fill="none" stroke="#a78bfa" strokeWidth={2} />
        </svg>
      </div>

      <div className="space-y-1.5">
        {LAYERS.map((l, i) => {
          const lit = i < revealed
          return (
            <div
              key={l.id}
              className={`rounded-lg border-l-4 bg-ink-soft px-3 py-2 transition-all ${lit ? 'anim-float-in' : 'opacity-40'}`}
              style={{ borderColor: l.hex }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm leading-none">{l.icon}</span>
                  <span className="text-[10px] font-mono font-bold" style={{ color: l.hex }}>{l.n}</span>
                  <span className="text-[11px] font-semibold text-paper/80 leading-tight">{l.name}</span>
                </div>
                <span className="text-[10px] text-right leading-tight" style={{ color: lit ? l.hex : undefined, opacity: lit ? 0.9 : 0.4 }}>
                  {lit ? def.layers[l.id] : '—'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-2 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-grape-soft/40 bg-grape/10 px-3 py-1 text-[11px] text-grape-soft">
          Option {def.id} · {def.name}
          {def.recommended && <span className="rounded-full bg-grape-soft/20 px-1.5 text-[9px] font-bold">RECOMMENDED</span>}
        </span>
      </div>
    </div>
  )
}

/* ── page ─────────────────────────────────────────────────────────────── */

export default function Placement() {
  const [step, setStep] = useState(0)
  const [triggers, setTriggers] = useState<Record<Trigger, boolean>>({ skills: false, parallel: false, safety: false, scale: false })
  const [fits, setFits] = useState<Record<Fit, boolean>>({ control: false, ecosystem: false, roles: false, azure: false })
  const [userStack, setUserStack] = useState<Stack | null>(null)
  const [poked, setPoked] = useState(false)
  const [fitPoked, setFitPoked] = useState(false)

  const anyTrigger = Object.values(triggers).some(Boolean)
  const fitPick = recommendFromFits(fits)
  // explicit A/B/C click wins; else fall to the situation-based recommendation; else default A
  const shownStack: Stack = userStack ?? fitPick ?? 'A'
  const decided = userStack !== null || fitPick !== null
  const def = STACKS[shownStack]

  function toggle(t: Trigger) {
    setTriggers((prev) => ({ ...prev, [t]: !prev[t] }))
    setPoked(true)
  }

  function toggleFit(f: Fit) {
    setFits((prev) => ({ ...prev, [f]: !prev[f] }))
    setUserStack(null) // let the fit recommendation drive the map until they override
    setFitPoked(true)
  }

  const watch = (
    <div>
      <StackMap step={step} stack={shownStack} userPicked={decided} />
      <p className="mt-2 text-center text-[11px] text-paper/45">
        {step === 0 && 'Six layers, no framework yet — the architecture comes first.'}
        {step === 1 && 'Option A fills the top: LangGraph orchestration, LangChain specialists.'}
        {step === 2 && 'Tools, then the guardrail with a built-in human gate.'}
        {step === 3 && `Action + observability — a full Option ${def.id} refund bot.`}
        {step >= 4 && 'Same layers, three stacks — swap below and watch every row re-label.'}
      </p>
    </div>
  )

  const extras = step >= 3 ? (
    <div className="mt-4 rounded-2xl border border-white/10 bg-ink-soft p-5 anim-float-in">
      {/* First: do you even need multi-agent? */}
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[11px] uppercase tracking-widest text-paper/45">First: do you even need multi-agent?</p>
        <PokeHint show={!poked} label="👆 tick what's true" />
      </div>
      <div className="space-y-2">
        {TRIGGERS.map((t) => {
          const on = triggers[t.id]
          return (
            <button
              key={t.id}
              onClick={() => toggle(t.id)}
              className={`w-full text-left rounded-xl border-2 px-3 py-2 transition-all ${on ? 'border-grape-soft bg-grape/15' : 'border-white/12 bg-ink hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-2">
                <span className={`inline-flex h-4 w-4 items-center justify-center rounded border text-[10px] ${on ? 'border-grape-soft bg-grape-soft text-ink' : 'border-white/30'}`}>
                  {on ? '✓' : ''}
                </span>
                <span className={`text-sm font-semibold ${on ? 'text-grape-soft' : 'text-paper/80'}`}>{t.label}</span>
              </div>
              <p className="text-[11px] text-paper/45 leading-snug mt-0.5 pl-6">{t.sub}</p>
            </button>
          )
        })}
      </div>
      <div className={`mt-3 rounded-xl border px-4 py-2.5 ${anyTrigger ? 'border-grape-soft/40 bg-grape/10' : 'border-white/12 bg-ink'}`}>
        {anyTrigger ? (
          <p className="text-sm text-paper/85 leading-relaxed">
            <span className="text-grape-soft font-bold">Multi-agent earns its place.</span> You have a real reason to split — like the
            refund bot. Now pick the stack that fits your team ↓
          </p>
        ) : (
          <p className="text-sm text-paper/85 leading-relaxed">
            <span className="text-paper font-bold">Start with one agent.</span> Nothing ticked — a single well-equipped agent is
            cheaper, faster, and easier to trust. Add agents only when one of these is genuinely true.
          </p>
        )}
      </div>

      {/* Then: which stack fits your situation? */}
      <div className="flex items-center justify-between mt-5 mb-2">
        <p className="text-[11px] uppercase tracking-widest text-paper/45">Then: which stack fits? Tick your situation</p>
        <PokeHint show={!fitPoked} label="👆 tick what's true" />
      </div>
      <div className="space-y-2">
        {FITS.map((f) => {
          const on = fits[f.id]
          return (
            <button
              key={f.id}
              onClick={() => toggleFit(f.id)}
              className={`w-full text-left rounded-xl border-2 px-3 py-2 transition-all ${on ? 'border-grape-soft bg-grape/15' : 'border-white/12 bg-ink hover:bg-white/5'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-4 w-4 items-center justify-center rounded border text-[10px] ${on ? 'border-grape-soft bg-grape-soft text-ink' : 'border-white/30'}`}>
                    {on ? '✓' : ''}
                  </span>
                  <span className={`text-sm font-semibold ${on ? 'text-grape-soft' : 'text-paper/80'}`}>{f.label}</span>
                </div>
                <span className="text-[9px] font-mono text-paper/40 shrink-0">→ {f.pick}</span>
              </div>
              <p className="text-[11px] text-paper/45 leading-snug mt-0.5 pl-6">{f.sub}</p>
            </button>
          )
        })}
      </div>
      <div className={`mt-3 rounded-xl border px-4 py-2.5 ${fitPick ? 'border-grape-soft/40 bg-grape/10' : 'border-white/12 bg-ink'}`}>
        {fitPick ? (
          <p className="text-sm text-paper/85 leading-relaxed">
            Based on what you ticked → <span className="text-grape-soft font-bold">Option {fitPick} · {STACKS[fitPick].name}</span>.
            Not locked in — click any option below to compare.
          </p>
        ) : (
          <p className="text-sm text-paper/85 leading-relaxed">
            <span className="text-paper font-bold">No strong pull yet.</span> When nothing forces your hand, take the default —{' '}
            <span className="text-grape-soft font-bold">Option A</span>.
          </p>
        )}
      </div>

      {/* pick / compare */}
      <div className="flex items-center justify-between mt-5 mb-2">
        <p className="text-[11px] uppercase tracking-widest text-paper/45">Pick or compare</p>
        <PokeHint show={userStack === null && !fitPoked} label="👆 try A · B · C" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(['A', 'B', 'C'] as const).map((id) => {
          const s = STACKS[id]
          const sel = shownStack === id
          const fitsHere = fitPick === id
          return (
            <button
              key={id}
              onClick={() => setUserStack(id)}
              className={`rounded-xl border-2 px-2 py-2.5 text-left transition-all ${sel ? 'border-grape-soft bg-grape/15' : 'border-white/12 hover:bg-white/5'}`}
            >
              <p className={`text-xs font-bold ${sel ? 'text-grape-soft' : 'text-paper/80'}`}>Option {id}</p>
              <p className="text-[10px] text-paper/55 leading-tight mt-0.5">{s.name}</p>
              {fitsHere ? (
                <p className="text-[9px] font-bold text-grape-soft mt-1">★ fits you</p>
              ) : s.recommended ? (
                <p className="text-[9px] font-bold text-grape-soft/80 mt-1">★ recommended</p>
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="mt-3 rounded-xl border border-grape-soft/30 bg-ink p-4 anim-float-in">
        <p className="text-sm text-paper/90 leading-relaxed">
          <span className="text-grape-soft font-bold">Option {def.id} · {def.name}</span>{' '}
          <span className="text-paper/55">({def.model})</span>
        </p>
        <p className="text-sm text-paper/80 leading-relaxed mt-1">{def.best}</p>
        <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
          <p className="text-[10px] uppercase tracking-widest text-paper/40 mb-0.5">How it ships</p>
          <p className="text-[12px] text-paper/70 leading-relaxed">{def.runtime}</p>
        </div>
        <p className="mt-2 text-[12px] text-paper/55 leading-relaxed">
          Whichever you pick, it fills the <span className="text-grape-soft">same six layers</span> above — the architecture doesn’t change.
        </p>
      </div>

      {/* From blueprint to shipped */}
      <div className="mt-4 rounded-xl border border-white/10 bg-ink p-4">
        <p className="text-[11px] uppercase tracking-widest text-paper/45 mb-2">From blueprint to shipped — build in this order</p>
        <ol className="space-y-2">
          {BUILD_STEPS.map((b, i) => (
            <li key={b.n} className="flex gap-2.5">
              <span className="mt-0.5 inline-flex h-5 shrink-0 items-center rounded-md border px-1.5 text-[10px] font-mono font-bold" style={{ borderColor: b.hex, color: b.hex }}>{b.n}</span>
              <div>
                <p className="text-sm font-semibold text-paper/85 leading-tight">{i + 1}. {b.t}</p>
                <p className="text-[11px] text-paper/55 leading-snug mt-0.5">{b.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-2.5 text-[12px] text-paper/55 leading-relaxed">
          Same order for every stack — only the components change. Get one layer working before you add the next.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-ink p-3">
        <p className="text-[11px] uppercase tracking-widest text-paper/45 mb-1.5">…and these aren’t the whole world</p>
        <div className="flex flex-wrap gap-1.5">
          {OTHER_TOOLS.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full border border-white/12 bg-white/[0.03] text-[11px] text-paper/70">{t}</span>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-paper/55 leading-relaxed">All valid. Read any of them by asking which layer each piece fills — choose by fit, not by hype.</p>
      </div>
    </div>
  ) : null

  const outro = (
    <>
      <p className="text-paper font-semibold">The whole lab, as a checklist you can run on any agentic system:</p>
      <ul className="space-y-1">
        <li>• <span className="text-grape-soft font-semibold">Orchestration</span> — who routes the work?</li>
        <li>• <span className="text-sky font-semibold">Agents</span> — which specialists, each with one job?</li>
        <li>• <span className="text-mint font-semibold">Tools</span> — what can they actually touch?</li>
        <li>• <span className="text-sun font-semibold">Guardrails</span> — where does risk stop for a human?</li>
        <li>• <span className="text-rose font-semibold">Action</span> — what’s irreversible, and is it exactly-once?</li>
        <li>• <span className="text-paper font-semibold">Outcome</span> — can you prove what happened?</li>
      </ul>
      <p>
        And before all of it: <span className="text-paper font-semibold">do you even need more than one agent?</span> Default to one;
        split only when the work demands it; then <span className="text-paper font-semibold">pick the stack that fits your situation</span> —
        explicit control flow leans LangGraph (A), role-first speed leans CrewAI (B), an Azure shop leans Microsoft/AutoGen (C).
      </p>
      <p>
        Then <span className="text-paper font-semibold">build it in layer order</span>: scaffold the orchestrator, drop in specialists and
        tools, gate the irreversible step, and turn on tracing before you ship. One layer working before the next.
      </p>
      <p className="pt-1">
        One last stop: <Link to="/takeaway" className="text-mint font-semibold underline underline-offset-2">take it with you</Link> —
        the whole thing on one printable card, plus a prompt to paste into your AI assistant and a quick glossary. Or{' '}
        <Link to="/blueprint" className="text-grape-soft underline underline-offset-2">revisit the blueprint</Link> any time.
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
      noteLabel="↳ How to actually decide"
    />
  )
}
