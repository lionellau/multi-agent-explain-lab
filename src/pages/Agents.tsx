import { useState } from 'react'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'
import { PokeHint } from '../components/Poke'
import { WorkflowCanvas, Edge, FlowNode, MetricRow, ToolStack, atCenter, type Pt } from '../components/Flow'
import type { Beat } from '../components/StorySteps'

const chapter = CHAPTERS.find((c) => c.path === '/agents')!

const beats: Beat[] = [
  {
    caption:
      'Below the supervisor sit the specialists. It handed off a refund — now three focused agents do the work, each with exactly one job: Knowledge, Support, Escalation.',
    llmNote:
      'This is Layer 2. A specialist is just an agent with a narrow prompt and a clean context. In CrewAI these are crew members; in AutoGen, agents. Splitting “find the policy” from “write the reply” is the multi-agent bet — here the jobs are genuinely different.',
    readingMs: 4800,
  },
  {
    caption:
      'Each specialist is a persona — a goal plus a backstory. Knowledge “never guesses, always cites policy.” Escalation “trusts nothing expensive without a human.”',
    llmNote:
      '“You are a support specialist who only drafts from verified policy” is a real agent definition. The persona shapes behaviour — and is why you split the work across three focused agents instead of one mega-prompt.',
    readingMs: 4800,
  },
  {
    caption:
      'Knowledge goes first. It fetches the refund policy and the customer’s charge — watch its work product appear below. That artifact becomes the next agent’s input.',
    llmNote:
      'Division of labour. The Knowledge agent’s only job is grounded facts, so it reaches for the right tools (the policy vector DB, billing) and hands a clean artifact downstream. It never writes the reply.',
    readingMs: 4800,
  },
  {
    caption:
      'The baton passes. Support takes Knowledge’s policy + charge and drafts the $79 refund reply. It never looked anything up — it just writes. Watch the edge light as the artifact hands over.',
    llmNote:
      'Notice the handoff: Support’s input is literally Knowledge’s output. Each agent stays focused on one thing, and the work product flows down the team like a baton. That edge IS the handoff.',
    readingMs: 4800,
  },
  {
    caption:
      'Escalation reviews the case: is a human needed? A clean $79 duplicate — no. It clears the case to the gate. (Smelled fraud, and it would loop the case to a human instead.)',
    llmNote:
      'The grape hub up top routing work between agents is the supervisor from Layer 1 — orchestration wearing a friendly costume. The specialists never decide who goes next; the orchestrator does.',
    readingMs: 5000,
  },
  {
    caption:
      'So your design job is casting: match each task to the specialist who should own it. Try it below.',
    llmNote:
      'Good teams have clear, non-overlapping responsibilities — exactly like a functional human team. Overlapping agents redo each other’s work or argue, burning tokens.',
    readingMs: 4200,
  },
  {
    caption:
      'Specialists trade one big brain for several focused ones. Perfect when the work splits into clear jobs; wasteful when you’re inventing fake roles to fit.',
    llmNote:
      'Reach for specialists when you can name the jobs on a whiteboard. When the task doesn’t split cleanly, the metaphor fights you — that’s your signal a single agent might fit better.',
    readingMs: 4600,
  },
]

const ROLES = [
  { id: 'knowledge', name: 'Knowledge', icon: '🔎', persona: 'never guesses — cites policy' },
  { id: 'support', name: 'Support', icon: '✍️', persona: 'clarifies, then drafts' },
  { id: 'escalation', name: 'Escalation', icon: '🙋', persona: 'trusts nothing expensive alone' },
] as const

type RoleId = typeof ROLES[number]['id']

const TASKS: { id: string; label: string; correct: RoleId }[] = [
  { id: 't1', label: 'Look up the refund policy and the customer’s charge', correct: 'knowledge' },
  { id: 't2', label: 'Clarify the issue and draft the customer reply', correct: 'support' },
  { id: 't3', label: 'Decide whether a human must approve this one', correct: 'escalation' },
]

// The crew run: each specialist produces a real work product that hands off to the next.
const FLOW: { role: RoleId; handoff: string; artifact: string }[] = [
  {
    role: 'knowledge',
    handoff: 'policy + charge → Support',
    artifact:
      '• Policy: duplicate charges are refundable within 60 days.\n• Customer #4471 was charged $79 twice on Mar 3 (order #A-2098).\n• Both cleared; one is a confirmed duplicate.',
  },
  {
    role: 'support',
    handoff: 'draft reply → Escalation',
    artifact:
      '“Hi! You’re right — we charged $79 twice on Mar 3. I’ve queued a $79 refund to your original card; it should land in 3–5 days. Sorry about that!”',
  },
  {
    role: 'escalation',
    handoff: 'cleared → the gate',
    artifact:
      'Risk read: $79, duplicate confirmed, 98% confidence → low risk. No human needed; cleared to the gate.\n(A $4,000 or low-confidence case would loop to a human instead.)',
  },
]

const ROLE_META: Record<RoleId, { icon: string; name: string; persona: string }> = {
  knowledge: { icon: '🔎', name: 'Knowledge', persona: 'never guesses — cites policy' },
  support: { icon: '✍️', name: 'Support', persona: 'clarifies, then drafts' },
  escalation: { icon: '🙋', name: 'Escalation', persona: 'trusts nothing expensive alone' },
}

// ── Canvas geometry. Supervisor up top routes down to a row of three
//    specialists; the baton (artifact) flows left→right, then escalation
//    clears the case down to the Layer-4 gate. ───────────────────────────
const W = 720
const H = 300
const SUP: Pt = { x: 360, y: 40 }
const POS: Record<RoleId, Pt> = {
  knowledge: { x: 128, y: 152 },
  support: { x: 360, y: 152 },
  escalation: { x: 592, y: 152 },
}
const GATE: Pt = { x: 592, y: 258 }
const ORDER: RoleId[] = ['knowledge', 'support', 'escalation']
const runStep = (r: RoleId) => ORDER.indexOf(r) + 2 // knowledge runs at beat 2

export default function Agents() {
  const [step, setStep] = useState(0)
  const [assign, setAssign] = useState<Record<string, RoleId | null>>({ t1: null, t2: null, t3: null })

  const allAssigned = TASKS.every((t) => assign[t.id])
  const correctCount = TASKS.filter((t) => assign[t.id] === t.correct).length

  const activeRole: RoleId | null = ORDER.find((r) => runStep(r) === step) ?? null
  const producedCount = Math.max(0, Math.min(step - 1, FLOW.length))

  const nodeState = (r: RoleId) => (step === runStep(r) ? 'active' : step > runStep(r) ? 'base' : 'dim')

  // edge reveal/active flags keyed off the walk
  const ksShow = step >= 3
  const seShow = step >= 4
  const gateShow = step >= 4

  const edges = (
    <>
      {/* supervisor routes down to each specialist — the active route lights */}
      <Edge from={{ x: SUP.x, y: SUP.y + 26 }} to={{ x: POS.knowledge.x, y: POS.knowledge.y - 28 }} tone="grape" curve={-0.1} active={activeRole === 'knowledge'} />
      <Edge from={{ x: SUP.x, y: SUP.y + 26 }} to={{ x: POS.support.x, y: POS.support.y - 28 }} tone="grape" active={activeRole === 'support'} />
      <Edge from={{ x: SUP.x, y: SUP.y + 26 }} to={{ x: POS.escalation.x, y: POS.escalation.y - 28 }} tone="grape" curve={0.1} active={activeRole === 'escalation'} />

      {/* the baton: each specialist's output is the next one's input */}
      <Edge from={{ x: POS.knowledge.x + 86, y: POS.knowledge.y }} to={{ x: POS.support.x - 86, y: POS.support.y }} tone="sky" label="policy" show={ksShow} active={step === 3} />
      <Edge from={{ x: POS.support.x + 86, y: POS.support.y }} to={{ x: POS.escalation.x - 86, y: POS.escalation.y }} tone="sky" label="draft" show={seShow} active={step === 4} />

      {/* escalation clears the case down to the gate */}
      <Edge from={{ x: POS.escalation.x, y: POS.escalation.y + 28 }} to={{ x: GATE.x, y: GATE.y - 24 }} tone="sun" label="cleared" show={gateShow} active={step >= 5} />
    </>
  )

  const nodes = (
    <>
      <div style={atCenter(SUP, 168, 52)}>
        <FlowNode tone="grape" icon="🧭" title="supervisor" sub={<span className="text-[11px]">from Layer 1 · routes work</span>} state="base" size="sm" />
      </div>

      {ORDER.map((r) => (
        <div key={r} style={atCenter(POS[r], 172, 56)}>
          <FlowNode
            tone="sky"
            icon={ROLE_META[r].icon}
            title={`${ROLE_META[r].name} agent`}
            sub={<span className="text-[11px]">“{ROLE_META[r].persona}”</span>}
            state={nodeState(r)}
            size="sm"
          />
        </div>
      ))}

      <div style={atCenter(GATE, 172, 48)}>
        <FlowNode tone="sun" icon="🛡️" title="→ the gate" sub={<span className="text-[11px]">Layer 4 checks the money</span>} state={gateShow ? 'base' : 'dim'} size="sm" />
      </div>
    </>
  )

  const watch = (
    <div>
      <WorkflowCanvas width={W} height={H} edges={edges}>
        {nodes}
      </WorkflowCanvas>

      <MetricRow
        items={[
          { label: 'Specialists', value: 3, tone: 'sky' },
          { label: 'Jobs each', value: 1, tone: 'sky' },
          { label: 'Handoffs (baton)', value: producedCount > 1 ? producedCount - 1 : 0 },
        ]}
      />

      {/* artifacts console — the real work products flowing down the team */}
      <div className="mt-3 rounded-xl border border-sky/25 bg-ink p-3">
        <p className="text-[10px] uppercase tracking-widest text-sky/80 mb-1.5">Work products (handed agent → agent)</p>
        {producedCount === 0 ? (
          <p className="text-xs text-paper/45 italic">Nothing produced yet — press Next to start the specialists.</p>
        ) : (
          <ul className="space-y-2">
            {FLOW.slice(0, producedCount).map((f, i) => (
              <li key={f.role} className={`anim-float-in ${i === producedCount - 1 ? '' : 'opacity-70'}`}>
                <p className="text-[10px] font-mono text-sky/80">
                  {ROLE_META[f.role].icon} {ROLE_META[f.role].name} · {f.handoff}
                </p>
                <p className="mt-0.5 whitespace-pre-line text-xs text-paper/85 leading-relaxed border-l-2 border-sky/30 pl-2">
                  {f.artifact}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

  const castingPanel = step >= 5 && (
    <div className="mt-4 rounded-2xl border border-white/10 bg-ink-soft p-5 anim-float-in">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] uppercase tracking-widest text-paper/45">Cast the team — assign each task</p>
        <PokeHint show={!allAssigned} label="👆 assign each task" />
      </div>
      <div className="space-y-3">
        {TASKS.map((t) => {
          const chosen = assign[t.id]
          const decided = allAssigned
          const right = chosen === t.correct
          return (
            <div key={t.id} className="rounded-xl border border-white/10 bg-ink p-3">
              <p className="text-sm text-paper/85 mb-2">{t.label}</p>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => {
                  const sel = chosen === r.id
                  return (
                    <button
                      key={r.id}
                      onClick={() => setAssign((a) => ({ ...a, [t.id]: r.id }))}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border-2 transition-all ${
                        sel
                          ? decided
                            ? right ? 'border-sky bg-sky/15 text-sky' : 'border-coral bg-coral/15 text-coral'
                            : 'border-sun bg-sun/15 text-sun'
                          : 'border-white/15 text-paper/65 hover:bg-white/5'
                      }`}
                    >
                      {r.icon} {r.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {allAssigned && (
        <div className="mt-4 rounded-xl border border-white/10 bg-ink p-4 anim-float-in">
          <p className={`font-bold text-sm ${correctCount === 3 ? 'text-sky' : 'text-sun'}`}>
            {correctCount === 3 ? 'Clean team — every agent owns one job.' : `${correctCount} / 3 on the obvious fit.`}
          </p>
          <p className="mt-1 text-sm text-paper/80 leading-relaxed">
            Knowledge gathers, Support drafts, Escalation judges — three non-overlapping responsibilities. When the
            boundaries are this clear, the supervisor can pass work around without agents stepping on each other. Blur the
            roles and they’d redo each other’s work and burn tokens arguing.
          </p>
        </div>
      )}
    </div>
  )

  const extras = (
    <>
      {castingPanel}
      <ToolStack
        show={step >= 6}
        tone="sky"
        stage="Layer 2 · Specialist Agents"
        primary={{
          name: 'CrewAI',
          tagline:
            'Define each specialist as an Agent (role + goal + backstory) and wire them into a Crew; the framework runs them in order and passes each one’s output to the next.',
          badge: 'role-native',
        }}
        alternatives={[
          { name: 'AutoGen', tagline: 'conversable agents that message each other to decide (Microsoft).' },
          { name: 'OpenAI Agents SDK', tagline: 'agents + explicit handoffs in the OpenAI stack.' },
          { name: 'LangGraph node-per-agent', tagline: 'each specialist is a graph node; you own every edge.' },
          { name: 'plain Python classes', tagline: 'a function per role — you orchestrate the calls yourself.' },
        ]}
        snippetLabel="how you’d build it · CrewAI (Python)"
        snippet={`from crewai import Agent, Crew

knowledge = Agent(
    role="Policy researcher",
    goal="cite the exact refund policy",
    backstory="You never guess; you quote §refs.",
    tools=[policy_search, get_charges])

support = Agent(
    role="Support writer",
    goal="draft the reply from policy only",
    backstory="Warm, concise, invents nothing.")

# tasks run in order; each output feeds the next
crew = Crew(agents=[knowledge, support, escalation],
            tasks=[research, draft, review])
crew.kickoff()`}
        note={
          <>
            One agent = one <span className="text-sky font-semibold">role + goal + backstory</span>. The framework hands
            each agent’s output to the next — the baton you just watched. Next layer: the tools these agents actually call.
          </>
        }
      />
    </>
  )

  const outro = (
    <>
      <p>
        The specialists are <span className="text-sky font-semibold">focused agents, not steps</span> — each a persona with
        one goal. Knowledge fetches, Support drafts, Escalation judges; the work flows down the team like a baton.
      </p>
      <p>
        The quiet hub routing between them is the <span className="text-grape-soft font-semibold">supervisor</span> from
        Layer 1 — the specialists never choose who goes next. Your design job is casting: clean, non-overlapping
        responsibilities.
      </p>
      <p>Great for role-shaped work. If you’re inventing fake roles to fit, a single agent is probably the better call.</p>
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
      noteLabel="↳ What a specialist agent is"
    />
  )
}
