import { useState } from 'react'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'
import { PokeHint } from '../components/Poke'
import { ToolStack } from '../components/Flow'
import type { Beat } from '../components/StorySteps'

const chapter = CHAPTERS.find((c) => c.path === '/orchestration')!

const beats: Beat[] = [
  {
    caption:
      'The refund message lands at the top of the system. One supervisor reads it. Its only job: detect intent, score risk, and route to the right specialist — it never does the work itself.',
    llmNote:
      'This is the orchestration layer — the framework band. LangGraph, CrewAI Flows, and AutoGen all live here. Think of the supervisor as a router drawn as a graph: a NODE is one step, an EDGE is a possible next move.',
    readingMs: 5000,
  },
  {
    caption:
      'Everything flows through one shared State object — watch it on the left. The supervisor reads the message, detects intent = refund, scores risk = low. Policy is still empty, so it routes to the Knowledge agent first.',
    llmNote:
      'State is a typed dictionary the framework carries between nodes: { message, intent, risk, policy, route }. The supervisor reads state, decides, writes route back. Which edge it picks depends entirely on what state says right now.',
    readingMs: 5400,
  },
  {
    caption:
      'Knowledge runs, fetches the refund policy, writes it into State.policy, then loops back to the supervisor. The supervisor coordinates; the specialist does the actual work and returns.',
    llmNote:
      'That backward edge is a loop — a move a straight pipeline can never make. Because the framework owns the state, a specialist can hand control back, carrying new information for the supervisor to act on.',
    readingMs: 5000,
  },
  {
    caption:
      'The supervisor runs again — same node, new State: policy in hand, risk still low. This time it routes to the Support agent. The route changed only because the State changed.',
    llmNote:
      'This is runtime routing: identical supervisor, different decision, driven entirely by state. A fixed script can’t do this. A graph chooses its path live from what just happened — the heart of orchestration.',
    readingMs: 5000,
  },
  {
    caption:
      'Support drafts the refund reply grounded in policy; end returns the plan. The whole run is just a sequence of routing decisions — that sequence is the trace. Now steer it yourself: score the risk and watch the supervisor pick a different edge.',
    llmNote:
      'Because the framework checkpoints state at every node, runs are replayable. Change the risk score and the supervisor re-decides from that state — same graph, new path. Now you play the supervisor.',
    readingMs: 5200,
  },
  {
    caption:
      'Score it low and the refund flows to the normal specialists. Score it high and the supervisor routes straight to Escalation — a human. Same supervisor, same graph, completely different future.',
    llmNote:
      'In production the model produces this risk score from the message; the mechanism is identical — a decision at the supervisor node selects the next node. This early risk score is the first cheap filter, long before the formal money gate.',
    readingMs: 5000,
  },
  {
    caption:
      'Orchestration is one brain deciding who works next, never doing the work. Get the routing wrong and every layer below receives the wrong job.',
    llmNote:
      'The supervisor is the only part that sees the whole request. This band is where you place LangGraph, CrewAI Flows, or AutoGen. The price of that power: you define every edge yourself, and loops need a STOP guard or they never exit.',
    readingMs: 4600,
  },
]

type Route = 'standard' | 'escalate'

type NodeId = 'supervisor' | 'knowledge' | 'support' | 'escalation' | 'end'

interface SupState {
  message: string
  intent: 'unknown' | 'refund'
  risk: 'unscored' | 'low' | 'high'
  policy: string | null
  route: 'knowledge' | 'support' | 'escalation' | null
}

interface TraceStep {
  node: NodeId
  note: string
  state: SupState
  changed: (keyof SupState)[]
}

const MSG = 'I was double-charged $79 — can I get a refund?'
const BIG = 'I demand a $4,000 refund — your app charged me for a year I never used!'
const POLICY = 'Duplicate charges are refundable within 60 days.'

const TRACES: Record<Route, TraceStep[]> = {
  standard: [
    {
      node: 'supervisor',
      note: 'Supervisor reads the message: intent = refund, risk = low. No policy yet — route to Knowledge.',
      state: { message: MSG, intent: 'refund', risk: 'low', policy: null, route: 'knowledge' },
      changed: ['intent', 'risk', 'route'],
    },
    {
      node: 'knowledge',
      note: 'Knowledge fetches the refund policy, writes it into State.policy, then loops back to the supervisor.',
      state: { message: MSG, intent: 'refund', risk: 'low', policy: POLICY, route: null },
      changed: ['policy'],
    },
    {
      node: 'supervisor',
      note: 'Supervisor re-runs with the new State: policy in hand, low risk. Route to Support.',
      state: { message: MSG, intent: 'refund', risk: 'low', policy: POLICY, route: 'support' },
      changed: ['route'],
    },
    {
      node: 'support',
      note: 'Support drafts the refund reply, grounded in the policy — a proposed $79 refund, pending the gate.',
      state: { message: MSG, intent: 'refund', risk: 'low', policy: POLICY, route: 'support' },
      changed: [],
    },
    {
      node: 'end',
      note: 'End hands the proposed refund downstream — to the tools, the gate, and the action layers.',
      state: { message: MSG, intent: 'refund', risk: 'low', policy: POLICY, route: 'support' },
      changed: [],
    },
  ],
  escalate: [
    {
      node: 'supervisor',
      note: 'Supervisor reads a $4,000 demand it is only 55% sure about: intent = refund, risk = HIGH. Route to Escalation.',
      state: { message: BIG, intent: 'refund', risk: 'high', policy: null, route: 'escalation' },
      changed: ['intent', 'risk', 'route'],
    },
    {
      node: 'escalation',
      note: 'Escalation pauses the flow and hands the case to a human. The supervisor neither approves nor denies — it just routes.',
      state: { message: BIG, intent: 'refund', risk: 'high', policy: null, route: 'escalation' },
      changed: [],
    },
    {
      node: 'end',
      note: 'End parks the case in a human queue. No specialist drafts a payout until a person looks.',
      state: { message: BIG, intent: 'refund', risk: 'high', policy: null, route: 'escalation' },
      changed: [],
    },
  ],
}

const TONE = {
  grape: { text: 'text-grape-soft', border: 'border-grape-soft', ring: 'ring-grape-soft/60', glow: 'shadow-[0_0_22px_-4px_rgba(167,139,250,0.7)]' },
  sky: { text: 'text-sky', border: 'border-sky', ring: 'ring-sky/60', glow: 'shadow-[0_0_22px_-4px_rgba(56,189,248,0.7)]' },
  paper: { text: 'text-paper', border: 'border-paper/50', ring: 'ring-paper/50', glow: 'shadow-[0_0_22px_-4px_rgba(253,246,240,0.45)]' },
} as const

function StatePanel({ s, changed }: { s: SupState; changed: (keyof SupState)[] }) {
  const hot = (k: keyof SupState) => changed.includes(k)
  const rowCls = (k: keyof SupState) =>
    `rounded-md px-2 py-1 transition-colors ${hot(k) ? 'bg-grape/15 ring-1 ring-grape-soft/40' : ''}`
  const riskTone = s.risk === 'high' ? 'text-coral font-bold' : s.risk === 'low' ? 'text-sky font-bold' : 'text-paper/40'
  return (
    <div className="mt-3 rounded-xl border border-grape-soft/25 bg-ink p-3 font-mono text-[11px] leading-relaxed">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] uppercase tracking-widest text-grape-soft/80">State (shared dict)</p>
        <span className="text-paper/40">passed between nodes</span>
      </div>
      <div key={`${s.intent}-${s.risk}-${s.policy ?? ''}-${s.route ?? ''}`} className="space-y-1 anim-float-in">
        <div className={rowCls('message')}>
          <span className="text-paper/40">message: </span>
          <span className="text-paper/80">“{s.message}”</span>
        </div>
        <div className={rowCls('intent')}>
          <span className="text-paper/40">intent: </span>
          <span className={s.intent === 'refund' ? 'text-grape-soft font-bold' : 'text-paper/40'}>{s.intent}</span>
        </div>
        <div className={rowCls('risk')}>
          <span className="text-paper/40">risk: </span>
          <span className={riskTone}>{s.risk}</span>
        </div>
        <div className={rowCls('policy')}>
          <span className="text-paper/40">policy: </span>
          {s.policy ? <span className="text-mint/90">“{s.policy}”</span> : <span className="text-paper/35">null</span>}
        </div>
        <div className={rowCls('route')}>
          <span className="text-paper/40">route → </span>
          {s.route ? <span className="text-grape-soft font-bold">{s.route}</span> : <span className="text-paper/35">null</span>}
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 *  The router graph — persistent HTML-div nodes (crisp Tailwind text), SVG
 *  only for the edges. The supervisor (grape) routes to specialists (sky);
 *  end is paper. The traversed edge glows grape — that edge IS the routing
 *  move — and animates so the decision is unmissable.
 *  ────────────────────────────────────────────────────────────────────── */

const GW = 620
const GH = 262
const NODES: Record<NodeId, { x: number; y: number; w: number; h: number; label: string; icon: string; desc: string; tone: keyof typeof TONE }> = {
  supervisor: { x: 232, y: 4, w: 156, h: 60, label: 'supervisor', icon: '🧭', desc: 'read · score · route', tone: 'grape' },
  knowledge: { x: 14, y: 120, w: 168, h: 58, label: 'knowledge', icon: '🔎', desc: 'fetch policy', tone: 'sky' },
  support: { x: 226, y: 120, w: 168, h: 58, label: 'support', icon: '✍️', desc: 'draft reply', tone: 'sky' },
  escalation: { x: 438, y: 120, w: 168, h: 58, label: 'escalation', icon: '🙋', desc: 'hand to human', tone: 'sky' },
  end: { x: 232, y: 212, w: 156, h: 46, label: 'end', icon: '🏁', desc: 'pass downstream', tone: 'paper' },
}
const cx = (id: NodeId) => NODES[id].x + NODES[id].w / 2
const top = (id: NodeId) => NODES[id].y
const bot = (id: NodeId) => NODES[id].y + NODES[id].h

function Edge({ x1, y1, x2, y2, on }: { x1: number; y1: number; x2: number; y2: number; on: boolean }) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={on ? '#a78bfa' : 'rgba(253,246,240,0.18)'} strokeWidth={on ? 2.5 : 1.4}
      markerEnd={on ? 'url(#or-grape)' : 'url(#or-faint)'}
      strokeDasharray={on ? '6 6' : undefined}
      className={on ? 'anim-dash-flow' : ''}
    />
  )
}

function EdgeLabel({ cx: lx, cy, text, on }: { cx: number; cy: number; text: string; on: boolean }) {
  const w = text.length * 6.2 + 16
  return (
    <g>
      <rect x={lx - w / 2} y={cy - 9} width={w} height={18} rx={9} fill="#1a1a2e" stroke={on ? '#a78bfa' : '#fdf6f0'} strokeOpacity={on ? 0.85 : 0.22} />
      <text x={lx} y={cy + 3} textAnchor="middle" fontSize="10" fill={on ? '#a78bfa' : '#fdf6f0'} fillOpacity={on ? 1 : 0.45} className="font-mono uppercase tracking-wide">{text}</text>
    </g>
  )
}

function Graph({ active, litPairs, visited }: { active: NodeId; litPairs: [NodeId, NodeId][]; visited: NodeId[] }) {
  const edgeOn = (from: NodeId, to: NodeId) => litPairs.some(([a, b]) => a === from && b === to)
  const seen = new Set(visited)
  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <div className="relative mx-auto" style={{ width: GW, minWidth: GW, height: GH }}>
        <svg className="absolute inset-0 pointer-events-none" width={GW} height={GH} role="img" aria-label="Orchestration routing graph">
          <defs>
            <marker id="or-grape" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#a78bfa" />
            </marker>
            <marker id="or-faint" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#fdf6f0" fillOpacity="0.3" />
            </marker>
          </defs>

          <Edge x1={cx('supervisor') - 46} y1={bot('supervisor')} x2={cx('knowledge') + 30} y2={top('knowledge') - 2} on={edgeOn('supervisor', 'knowledge')} />
          <Edge x1={cx('supervisor')} y1={bot('supervisor')} x2={cx('support')} y2={top('support') - 2} on={edgeOn('supervisor', 'support')} />
          <Edge x1={cx('supervisor') + 46} y1={bot('supervisor')} x2={cx('escalation') - 30} y2={top('escalation') - 2} on={edgeOn('supervisor', 'escalation')} />
          <Edge x1={cx('support')} y1={bot('support')} x2={cx('end')} y2={top('end') - 2} on={edgeOn('support', 'end')} />
          <Edge x1={cx('escalation') - 36} y1={bot('escalation')} x2={cx('end') + 40} y2={top('end') - 2} on={edgeOn('escalation', 'end')} />

          {/* loop: knowledge -> supervisor (the move a straight chain can never make) */}
          <path
            d={`M ${cx('knowledge')} ${top('knowledge') - 2} C ${cx('knowledge') - 6} 26, ${NODES.supervisor.x - 64} 6, ${NODES.supervisor.x - 2} ${top('supervisor') + 26}`}
            fill="none"
            stroke={edgeOn('knowledge', 'supervisor') ? '#a78bfa' : 'rgba(253,246,240,0.18)'}
            strokeWidth={edgeOn('knowledge', 'supervisor') ? 2.5 : 1.4}
            markerEnd={edgeOn('knowledge', 'supervisor') ? 'url(#or-grape)' : 'url(#or-faint)'}
            strokeDasharray={edgeOn('knowledge', 'supervisor') ? '6 6' : undefined}
            className={edgeOn('knowledge', 'supervisor') ? 'anim-dash-flow' : ''}
          />

          <EdgeLabel cx={196} cy={91} text="need policy" on={edgeOn('supervisor', 'knowledge')} />
          <EdgeLabel cx={cx('support')} cy={91} text="low risk" on={edgeOn('supervisor', 'support')} />
          <EdgeLabel cx={424} cy={91} text="high risk" on={edgeOn('supervisor', 'escalation')} />
          <EdgeLabel cx={NODES.supervisor.x - 54} cy={18} text="+policy ↺" on={edgeOn('knowledge', 'supervisor')} />
        </svg>

        {(Object.keys(NODES) as NodeId[]).map((id) => {
          const n = NODES[id]
          const t = TONE[n.tone]
          const isActive = active === id
          const isSeen = seen.has(id)
          return (
            <div
              key={id}
              className={[
                'absolute rounded-xl border-2 bg-ink-soft flex items-center transition-all',
                isActive
                  ? `${t.border} ring-2 ${t.ring} ring-offset-2 ring-offset-ink ${t.glow} scale-[1.05] z-10 anim-pop-in`
                  : isSeen ? `${t.border} opacity-80` : 'border-white/15 opacity-45',
              ].join(' ')}
              style={{ left: n.x, top: n.y, width: n.w, height: n.h, paddingLeft: 12, paddingRight: 12 }}
            >
              <span className="text-xl leading-none mr-2.5">{n.icon}</span>
              <div className="min-w-0">
                <p className={`text-base font-bold leading-tight ${isActive || isSeen ? t.text : 'text-paper/70'}`}>{n.label}</p>
                <p className="text-[11px] text-paper/55 leading-tight">{n.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Orchestration() {
  const [step, setStep] = useState(0)
  const [route, setRoute] = useState<Route>('standard')
  const [routePicked, setRoutePicked] = useState(false)

  // The Next-step walkthrough drives the trace — no separate scrubber. Each
  // beat advances one routing decision; the graph below replays it live.
  const trace = TRACES[route]
  const walk = Math.min(step, trace.length - 1)
  const cur = trace[walk]
  const prev = walk > 0 ? trace[walk - 1].node : null
  const visited = trace.slice(0, walk + 1).map((t) => t.node)

  // Which edges glow. During the normal walk: only the move just made. Once
  // the user forks the route by scoring risk: the whole chosen branch, so the
  // alternate future reads at a glance.
  const litPairs: [NodeId, NodeId][] = routePicked
    ? (trace
        .map((t, i) => (i > 0 ? ([trace[i - 1].node, t.node] as [NodeId, NodeId]) : null))
        .filter(Boolean) as [NodeId, NodeId][])
    : prev
      ? [[prev, cur.node]]
      : []

  function pickRisk(r: 'low' | 'high') {
    setRoute(r === 'high' ? 'escalate' : 'standard')
    setRoutePicked(true)
  }

  const watch = (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs font-mono uppercase tracking-widest text-grape-soft">Live · the supervisor routes</span>
        {prev && (
          <span className="px-2 py-0.5 rounded-full border border-grape-soft/50 bg-grape/10 text-[10px] font-mono uppercase tracking-wide text-grape-soft">
            {prev} <span className="opacity-60">→</span> {cur.node}
          </span>
        )}
        <span className="ml-auto text-[11px] text-paper/40">node {walk + 1} of {trace.length}</span>
      </div>

      <Graph active={cur.node} litPairs={litPairs} visited={visited} />

      <div className="mt-3 rounded-xl border border-grape-soft/25 bg-ink p-3 flex items-center gap-3">
        <div className="text-center px-3 py-1.5 rounded-lg bg-grape/10 border border-grape-soft/40 shrink-0">
          <p className="text-[9px] uppercase tracking-widest text-grape-soft/70">node</p>
          <p className="text-base font-bold text-grape-soft leading-none mt-0.5 capitalize">{cur.node}</p>
        </div>
        <p className="text-sm text-paper/85 leading-snug flex-1">{cur.note}</p>
      </div>

      <StatePanel s={cur.state} changed={cur.changed} />
    </div>
  )

  const extras = (
    <>
      {step >= 4 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-ink-soft p-5 anim-float-in">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] uppercase tracking-widest text-paper/45">You are the supervisor</p>
            <PokeHint show={!routePicked} label="👆 score the risk" />
          </div>
          <p className="text-sm text-paper/80 leading-relaxed mb-3">
            A new message arrives: a <span className="text-paper font-semibold">$4,000</span> refund demand the model is only{' '}
            <span className="text-paper font-semibold">55%</span> sure about. Score the risk — that score picks the edge.
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => pickRisk('low')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${route === 'standard' ? 'border-sky bg-sky/15 text-sky' : 'border-white/15 text-paper/70 hover:bg-white/5'}`}>
              low risk → support
            </button>
            <button onClick={() => pickRisk('high')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${route === 'escalate' ? 'border-coral bg-coral/15 text-coral' : 'border-white/15 text-paper/70 hover:bg-white/5'}`}>
              high risk → escalation
            </button>
          </div>
          <p className="mt-3 text-sm text-paper/80 leading-relaxed">
            {route === 'escalate' ? (
              <>
                <span className="text-grape-soft font-bold">Right call.</span> High amount + low confidence routes straight to{' '}
                <span className="text-sky font-semibold">escalation</span>. The supervisor doesn’t approve or deny — it just
                decides a human should see this one. The formal money check still happens later, at the gate. The graph above
                now lights the whole escalation branch.
              </>
            ) : (
              <>
                <span className="text-coral font-bold">Dangerous.</span> You sent a $4,000, 55%-confidence demand down the normal
                draft-and-pay path. The supervisor’s risk score is the first cheap filter — get it wrong and every layer below is
                now working on a likely fraud. Switch to <span className="text-coral font-semibold">high risk</span> and watch it
                route to escalation instead.
              </>
            )}
          </p>
        </div>
      )}

      <ToolStack
        show={step >= 5}
        tone="grape"
        stage="Layer 1 · Orchestration"
        primary={{
          name: 'LangGraph',
          tagline:
            'Model the agents as an explicit state graph: nodes do work, edges route, the framework checkpoints state at every step so runs replay and loops stay safe.',
          badge: 'most control',
        }}
        alternatives={[
          { name: 'CrewAI Flows', tagline: 'role-based crews + event-driven flows — less wiring, more opinion.' },
          { name: 'AutoGen', tagline: 'conversational multi-agent loops (Microsoft); agents talk to decide.' },
          { name: 'OpenAI Agents SDK', tagline: 'lightweight handoffs between agents in the OpenAI stack.' },
          { name: 'plain while-loop', tagline: 'a router function + match/case — no framework, you own every edge.' },
        ]}
        snippetLabel="how you’d build it · LangGraph (Python)"
        snippet={`from langgraph.graph import StateGraph, END

g = StateGraph(State)
g.add_node("supervisor", route)        # reads state → returns next
g.add_node("knowledge", fetch_policy)
g.add_node("support", draft_reply)
g.add_node("escalation", to_human)

# the supervisor's route value picks the edge
g.add_conditional_edges("supervisor", lambda s: s["route"], {
    "knowledge": "knowledge",
    "support": "support",
    "escalation": "escalation",
})
g.add_edge("knowledge", "supervisor")  # the loop a chain can't make
g.set_entry_point("supervisor")`}
        note={
          <>
            One <span className="text-grape-soft font-semibold">supervisor node</span> returns a route; the framework follows
            the matching <span className="text-grape-soft font-semibold">conditional edge</span> and checkpoints state so the
            loop can replay. Next layer: the tools each specialist actually calls.
          </>
        }
      />
    </>
  )

  const outro = (
    <>
      <p>
        The supervisor is the only part that sees the whole request. It reads shared state, detects intent, scores risk,
        and picks <span className="text-grape-soft font-semibold">who runs next</span> — it never does the work itself.
      </p>
      <p>
        Because it routes from live state, the same supervisor sends a clean $79 refund to the specialists and a shaky
        $4,000 one to a human. That runtime routing is the heart of every orchestration framework.
      </p>
      <p>
        This is the band where <span className="text-grape-soft font-semibold">LangGraph, CrewAI Flows, and AutoGen</span>{' '}
        live. The price of the power: you define every edge yourself, and loops need a STOP guard or they never exit.
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
      noteLabel="↳ What the orchestrator is doing"
    />
  )
}
