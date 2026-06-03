import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'
import { PokeHint } from '../components/Poke'
import type { Beat } from '../components/StorySteps'

const chapter = CHAPTERS.find((c) => c.path === '/takeaway')!

/* ──────────────────────────────────────────────────────────────────────────
 *  CHAPTER 10 — TAKE IT WITH YOU  (recap · theme MINT)
 *
 *  The whole lab compressed into one page the reader can carry out the door:
 *   1. the six-layer checklist (the mental model)
 *   2. the chosen stack's components filled onto each layer
 *   3. the 4-step build order
 *   4. a "paste this into your AI assistant" scaffold prompt + starter repos
 *   5. a five-term glossary
 *  Copy it as markdown or print it. Then go build.
 *  ────────────────────────────────────────────────────────────────────── */

const beats: Beat[] = [
  {
    caption:
      'You finished the tour. Here is the one page you take with you — the whole refund bot compressed onto a single card you can drop into a planning doc.',
    llmNote:
      'Nothing new is taught here. This chapter exists so you leave with something concrete: a checklist, a stack, a build order, a starter prompt, and the jargon decoded. Confidence is portable only if the summary is.',
    readingMs: 4400,
  },
  {
    caption:
      'First, the mental model as six questions. Walk any agentic system top to bottom and answer each one. If you can, you understand the system. If you can’t, you just found the gap.',
    llmNote:
      'This list outlives every framework. “Who routes? which specialists? what can they touch? where does risk stop? what’s irreversible? can you prove it?” Six questions, and you can read any architecture on a whiteboard.',
    readingMs: 4800,
  },
  {
    caption:
      'Now fill it in. Pick a stack below and watch each layer get a concrete component. Same six rows, real tools — that is your architecture, decided.',
    llmNote:
      'Switching the stack only re-labels the components; the six layers never move. That is the whole point of the lab: choose the architecture first, then let the framework fill the rows.',
    readingMs: 4600,
  },
  {
    caption:
      'Then the build order. Always the same four moves, whatever the stack: scaffold the router, add specialists and tools, gate the irreversible step, turn on tracing — then ship.',
    llmNote:
      'Order matters. Get one layer working before the next. The single most common failure is wiring the real payment API before the human gate exists. Build the gate first, always.',
    readingMs: 4800,
  },
  {
    caption:
      'Here is the bridge from design to running code: a prompt you paste into your AI assistant. It hands over the exact architecture and order so it scaffolds your stack instead of guessing.',
    llmNote:
      'You don’t need to hand-write the framework. You need to hand it the blueprint. This prompt encodes the six layers, the chosen components, and “build the gate before the money move” so the assistant can’t skip it.',
    readingMs: 5000,
  },
  {
    caption:
      'Last, the five words that kept showing up. One sentence each — so when they appear in a doc or a vendor pitch, you know exactly what they mean.',
    llmNote:
      'MCP, idempotency, HITL, RAG, vector DB. None of them are complicated once they’re plain. Jargon is just compression; here is the decompression key.',
    readingMs: 4400,
  },
  {
    caption:
      'That’s the lab, on one card. Copy it into your notes, print it for the meeting, paste the prompt into your assistant tonight. You came to understand and design — you can now do both. Go build.',
    llmNote:
      'You can read any agentic system by walking the six layers, pick a stack by fit instead of hype, and sequence the build so the dangerous step is gated first. That mental model is yours to keep.',
    readingMs: 5200,
  },
]

/* ── the six layers (the mental model) ────────────────────────────────── */

interface Layer {
  n: string
  name: string
  hex: string
  icon: string
  ask: string
}
const LAYERS: Layer[] = [
  { n: 'L1', name: 'Orchestration', hex: '#a78bfa', icon: '🧭', ask: 'Who routes the work?' },
  { n: 'L2', name: 'Specialists', hex: '#38bdf8', icon: '👥', ask: 'Which specialists, one job each?' },
  { n: 'L3', name: 'Tools & systems', hex: '#34d399', icon: '🔧', ask: 'What can they actually touch?' },
  { n: 'L4', name: 'Guardrails & gate', hex: '#fbbf24', icon: '🚦', ask: 'Where does risk stop for a human?' },
  { n: 'L5', name: 'Action', hex: '#f472b6', icon: '💸', ask: 'What’s irreversible? Exactly-once?' },
  { n: 'L6', name: 'Outcome', hex: '#fdf6f0', icon: '📊', ask: 'Can you prove what happened?' },
]

/* ── the three stacks (components per layer, indexed 0..5) ─────────────── */

type Stack = 'A' | 'B' | 'C'
interface StackDef {
  id: Stack
  name: string
  repo: { label: string; url: string }
  recommended?: boolean
  comps: string[] // one per LAYERS row
}
const STACKS: Record<Stack, StackDef> = {
  A: {
    id: 'A',
    name: 'LangGraph + LangChain',
    repo: { label: 'github.com/langchain-ai/langgraph', url: 'https://github.com/langchain-ai/langgraph' },
    recommended: true,
    comps: [
      'LangGraph state graph + conditional edges',
      'LangChain agents as graph nodes',
      'LangChain tools · retrievers · MCP',
      'conditional edge + interrupt() gate',
      'tool node → Refund API (idempotent)',
      'LangSmith traces + metrics',
    ],
  },
  B: {
    id: 'B',
    name: 'CrewAI Flows + Crews',
    repo: { label: 'github.com/crewAIInc/crewAI', url: 'https://github.com/crewAIInc/crewAI' },
    comps: [
      'CrewAI Flow — @start / @router',
      'a Crew of role-agents',
      'CrewAI Tools + MCP adapters',
      'Flow branch + human_input step',
      'a Tool → Refund API (idempotent)',
      'event listeners + run traces',
    ],
  },
  C: {
    id: 'C',
    name: 'Microsoft / AutoGen',
    repo: { label: 'github.com/microsoft/autogen', url: 'https://github.com/microsoft/autogen' },
    comps: [
      'AutoGen GroupChat / orchestrator',
      'AutoGen AssistantAgents',
      'Semantic Kernel plugins + MCP',
      'UserProxyAgent human-in-the-loop',
      'function tool → Refund API (idempotent)',
      'OpenTelemetry → Azure Monitor',
    ],
  },
}

/* ── the build order (stack-agnostic) ─────────────────────────────────── */

const BUILD: { n: string; t: string; d: string; hex: string }[] = [
  { n: 'L1', t: 'Scaffold the orchestrator', d: 'One entry, one exit. Hard-code the happy path before any branch.', hex: '#a78bfa' },
  { n: 'L2·L3', t: 'Add specialists + tools', d: 'One job each, only the tools they need. Mock the tools first, then wire real APIs.', hex: '#34d399' },
  { n: 'L4·L5', t: 'Gate the irreversible step', d: 'Risk check + human approval in front of the money move — before you ever run it live.', hex: '#fbbf24' },
  { n: 'L6', t: 'Trace everything, then ship', d: 'Observability and idempotency keys on before launch. You can’t debug what you didn’t log.', hex: '#fdf6f0' },
]

/* ── the glossary (five terms) ────────────────────────────────────────── */

const GLOSSARY: { term: string; short: string; full: string }[] = [
  { term: 'MCP', short: 'Model Context Protocol', full: 'A shared “USB-C for tools” standard so one adapter lets any agent call any system — instead of a bespoke integration per system.' },
  { term: 'Idempotency key', short: 'safe retries', full: 'A unique stamp on a money-moving call. If the same key arrives again, the API returns the first result instead of charging a second time.' },
  { term: 'HITL', short: 'human-in-the-loop', full: 'A pause where a person approves or rejects before an irreversible action runs. The seam between “the system decides” and “the system acts.”' },
  { term: 'RAG', short: 'retrieval-augmented generation', full: 'Fetch the relevant documents first, then let the model answer from them — instead of guessing from memory. This is how the policy lookup works.' },
  { term: 'Vector DB', short: 'search by meaning', full: 'A store that keeps text as numbers (embeddings) so you can search by meaning, not exact keywords. It’s where the policy docs live.' },
]

/* ── the AI-assistant handoff prompt ──────────────────────────────────── */

function buildPrompt(stack: StackDef): string {
  return `You are helping me build a customer-support refund agent using ${stack.name}.
Keep this architecture exactly; build it in this order:

1. Orchestrator: ${stack.comps[0]} — reads the ticket, detects intent, scores risk, routes.
2. Specialists: ${stack.comps[1]} — one looks up policy (RAG), one drafts the reply, one decides escalation.
3. Tools: ${stack.comps[2]} — policy vector DB, CRM, orders/billing, refund API.
4. Guardrail: ${stack.comps[3]} — low risk auto-passes; high risk or high amount waits for a human.
5. Action: ${stack.comps[4]} — call the refund API with an idempotency key so retries never double-pay.
6. Outcome: ${stack.comps[5]} — send the customer a receipt and write a full trace + metrics.

Start with step 1 and the happy path only. Mock the tools first.
Ask me before wiring any real payment API.`
}

/* ── plain-text card for the clipboard ────────────────────────────────── */

/* Copy that survives headless / locked-down browsers: try the async Clipboard
   API, fall back to a hidden-textarea execCommand so it still works without
   document focus or in non-secure contexts. */
function fallbackCopy(text: string): boolean {
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.top = '-9999px'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

function writeClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
      return
    }
  } catch {
    /* fall through */
  }
  fallbackCopy(text)
}

function buildCardText(stack: StackDef): string {
  const layers = LAYERS.map((l, i) => `  ${l.n} ${l.name} — ${l.ask}\n      → ${stack.comps[i]}`).join('\n')
  const build = BUILD.map((b, i) => `  ${i + 1}. [${b.n}] ${b.t} — ${b.d}`).join('\n')
  const glossary = GLOSSARY.map((g) => `  • ${g.term} (${g.short}): ${g.full}`).join('\n')
  return `MULTI-AGENT BUILD CARD — Refund Bot
Stack: Option ${stack.id} · ${stack.name}${stack.recommended ? ' (recommended)' : ''}
Starter: ${stack.repo.url}

THE SIX-LAYER CHECKLIST (walk any agentic system top to bottom)
${layers}

BUILD IN THIS ORDER (same for every stack)
${build}

PASTE THIS INTO YOUR AI ASSISTANT TO SCAFFOLD IT
${buildPrompt(stack)}

GLOSSARY
${glossary}

— Made in the Multi-Agent Explain Lab. Default to one agent; split only when the work demands it.`
}

/* ── the printable card (watch panel) ─────────────────────────────────── */

function Card({ step, stack }: { step: number; stack: StackDef }) {
  const showAsk = step >= 1
  const showComp = step >= 2
  const showBuild = step >= 3

  return (
    <div id="print-card" className="tk-card mx-auto rounded-2xl border-2 border-mint/40 bg-ink p-4 md:p-5" style={{ maxWidth: 540 }}>
      {/* card header / ribbon */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">🎒</span>
          <div>
            <p className="text-sm font-bold text-mint leading-tight">Multi-Agent Build Card</p>
            <p className="text-[10px] text-paper/45 leading-tight">one refund bot · your napkin sketch</p>
          </div>
        </div>
        <span className="rounded-full border border-mint/40 bg-mint/10 px-2.5 py-1 text-[10px] font-semibold text-mint anim-float-in" key={stack.id}>
          Option {stack.id} · {stack.name}
        </span>
      </div>

      {/* six-layer checklist + components */}
      <p className="text-[10px] uppercase tracking-widest text-paper/40 mb-1.5">The six-layer checklist</p>
      <div className="space-y-1.5">
        {LAYERS.map((l, i) => (
          <div
            key={l.n}
            className="tk-row rounded-lg border-l-4 bg-ink-soft px-3 py-1.5 anim-float-in"
            style={{ borderLeftColor: l.hex, ['--tk-bar' as string]: l.hex, animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm leading-none">{l.icon}</span>
                <span className="text-[10px] font-mono font-bold" style={{ color: l.hex }}>{l.n}</span>
                <span className="text-[11px] font-semibold text-paper/85 leading-tight">{l.name}</span>
              </div>
              <span className="text-[10px] text-right leading-tight text-paper/55 italic">
                {showAsk ? l.ask : ''}
              </span>
            </div>
            {showComp && (
              <p
                key={stack.id}
                className="text-[11px] leading-tight mt-1 pl-6 anim-float-in font-medium"
                style={{ color: l.hex, opacity: 0.92 }}
              >
                → {stack.comps[i]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* build order */}
      {showBuild && (
        <div className="mt-3 anim-float-in">
          <p className="text-[10px] uppercase tracking-widest text-paper/40 mb-1.5">Build in this order</p>
          <ol className="space-y-1">
            {BUILD.map((b, i) => (
              <li key={b.n} className="flex gap-2 anim-float-in" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="mt-0.5 inline-flex h-4 shrink-0 items-center rounded border px-1 text-[9px] font-mono font-bold" style={{ borderColor: b.hex, color: b.hex }}>{b.n}</span>
                <p className="text-[11px] text-paper/75 leading-tight"><span className="font-semibold text-paper/90">{i + 1}. {b.t}</span> — {b.d}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

/* ── page ─────────────────────────────────────────────────────────────── */

export default function Takeaway() {
  const [step, setStep] = useState(0)
  const [stackId, setStackId] = useState<Stack>('A')
  const [copied, setCopied] = useState<'' | 'card' | 'prompt'>('')
  const [openTerm, setOpenTerm] = useState<string | null>(null)
  const [picked, setPicked] = useState(false)

  const stack = STACKS[stackId]

  function copy(kind: 'card' | 'prompt') {
    const text = kind === 'card' ? buildCardText(stack) : buildPrompt(stack)
    writeClipboard(text)
    setCopied(kind)
    window.setTimeout(() => setCopied(''), 1800)
  }

  const watch = (
    <div>
      <Card step={step} stack={stack} />
      <p className="mt-3 text-center text-[11px] text-paper/45">
        {step === 0 && 'Your one-page takeaway — it fills in as you advance.'}
        {step === 1 && 'Six questions you can run on any agentic system.'}
        {step === 2 && 'Pick a stack below — each layer gets a real component.'}
        {step === 3 && 'Same four build moves, whatever the stack.'}
        {step >= 4 && 'Copy it, print it, or grab the build prompt below.'}
      </p>
    </div>
  )

  const controls = step >= 2 && (
    <div className="mt-4 rounded-2xl border border-white/10 bg-ink-soft p-5 anim-float-in">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-widest text-paper/45">Your stack — fills the card</p>
        <PokeHint show={!picked} label="👆 try A · B · C" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(['A', 'B', 'C'] as const).map((id) => {
          const s = STACKS[id]
          const sel = stackId === id
          return (
            <button
              key={id}
              onClick={() => { setStackId(id); setPicked(true) }}
              className={`rounded-xl border-2 px-2 py-2.5 text-left transition-all ${sel ? 'border-mint bg-mint/15' : 'border-white/12 hover:bg-white/5'}`}
            >
              <p className={`text-xs font-bold ${sel ? 'text-mint' : 'text-paper/80'}`}>Option {id}</p>
              <p className="text-[10px] text-paper/55 leading-tight mt-0.5">{s.name}</p>
              {s.recommended && <p className="text-[9px] font-bold text-mint/80 mt-1">★ recommended</p>}
            </button>
          )
        })}
      </div>

      {/* export actions */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => copy('card')}
          className="inline-flex items-center gap-1.5 rounded-lg border-2 border-mint/60 px-3 py-2 text-sm font-bold text-mint transition-all hover:bg-mint/10"
        >
          {copied === 'card' ? '✓ Copied to clipboard' : '⧉ Copy card (markdown)'}
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg border-2 border-white/15 px-3 py-2 text-sm font-semibold text-paper/80 transition-all hover:bg-white/5"
        >
          🖨 Print / save as PDF
        </button>
      </div>
      <p className="mt-2 text-[11px] text-paper/45 leading-snug">
        Copy drops the whole card — checklist, your stack, build order, the prompt, and the glossary — as text you can paste into any
        doc. Print isolates just the card.
      </p>
    </div>
  )

  const handoff = step >= 4 && (
    <div className="mt-4 rounded-2xl border border-white/10 bg-ink-soft p-5 anim-float-in">
      <p className="text-[11px] uppercase tracking-widest text-paper/45 mb-1.5">Start building — paste this into your AI assistant</p>
      <p className="text-[12px] text-paper/60 leading-snug mb-2">
        It hands over the exact architecture and order, so the assistant scaffolds <span className="text-mint font-semibold">your</span>{' '}
        stack instead of guessing. Bridges design to running code without you hand-writing the framework.
      </p>
      <div className="relative rounded-xl border border-mint/25 bg-ink p-3">
        <pre className="font-mono text-[10.5px] leading-relaxed text-paper/85 whitespace-pre-wrap">{buildPrompt(stack)}</pre>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          onClick={() => copy('prompt')}
          className="inline-flex items-center gap-1.5 rounded-lg border-2 border-mint/60 px-3 py-2 text-sm font-bold text-mint transition-all hover:bg-mint/10"
        >
          {copied === 'prompt' ? '✓ Prompt copied' : '⧉ Copy the prompt'}
        </button>
        <a
          href={stack.repo.url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-sm font-mono text-paper/70 transition-all hover:bg-white/5"
        >
          ↗ starter repo · {stack.repo.label}
        </a>
      </div>
    </div>
  )

  const glossary = step >= 5 && (
    <div className="mt-4 rounded-2xl border border-white/10 bg-ink-soft p-5 anim-float-in">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-widest text-paper/45">The five words, decoded</p>
        <PokeHint show={openTerm === null} label="👆 tap a term" />
      </div>
      <div className="space-y-1.5">
        {GLOSSARY.map((g, i) => {
          const open = openTerm === g.term
          return (
            <button
              key={g.term}
              onClick={() => setOpenTerm(open ? null : g.term)}
              className={`w-full text-left rounded-xl border-2 px-3 py-2 transition-all anim-float-in ${open ? 'border-mint bg-mint/10' : 'border-white/12 bg-ink hover:bg-white/5'}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-2">
                <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${open ? 'border-mint text-mint' : 'border-white/30 text-paper/50'}`}>
                  {open ? '−' : '+'}
                </span>
                <span className={`text-sm font-bold ${open ? 'text-mint' : 'text-paper/85'}`}>{g.term}</span>
                <span className="text-[11px] text-paper/45 italic">· {g.short}</span>
              </div>
              {open && <p className="anim-float-in mt-1.5 pl-6 text-[12px] text-paper/80 leading-relaxed">{g.full}</p>}
            </button>
          )
        })}
      </div>
    </div>
  )

  const extras = (
    <>
      {controls}
      {handoff}
      {glossary}
    </>
  )

  const outro = (
    <>
      <p>
        This card <span className="text-mint font-semibold">is</span> the lab. The six questions are the mental model; the stack you
        picked fills them in; the build order keeps you from wiring money before the gate exists.
      </p>
      <p>Three things to do with it:</p>
      <ul className="space-y-1">
        <li>• <span className="text-mint font-semibold">Copy</span> it into your planning doc as a shared reference</li>
        <li>• <span className="text-mint font-semibold">Paste the prompt</span> into your AI assistant to scaffold a real starting point</li>
        <li>• <span className="text-mint font-semibold">Keep the glossary</span> handy for the next vendor pitch or design review</li>
      </ul>
      <p className="pt-1">
        You came to understand and design. You can now do both. <Link to="/" className="text-mint font-semibold underline underline-offset-2">Back to the start</Link>,
        or <Link to="/placement" className="text-grape-soft font-semibold underline underline-offset-2">revisit the framework choices</Link>.
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
      noteLabel="↳ Why this card is the whole lab"
    />
  )
}
