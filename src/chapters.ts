// One color = one meaning, taken straight from the product blueprint (Ch2).
// Every architecture layer owns one colour everywhere in the lab — these match
// the reference diagram exactly:
//
//   grape-soft — ORCHESTRATION / the framework (supervisor, router)
//   sky        — SPECIALIST AGENTS (knowledge, support, escalation)
//   mint       — TOOLS & SYSTEMS (vector DB, CRM, APIs, MCP)
//   sun        — GUARDRAILS & THE HUMAN GATE (risk checks, approval)
//   rose       — ACTION & OUTCOME (the irreversible move, the result)
//   coral      — risk / danger / the high-risk path (inline marker, never a full fill)
//   paper      — structure, recap, neutral copy, the customer
//
// Chapter `accent` is the header/nav theme color. Inside diagrams, the layer
// colors above are sacred — they are the legend of the blueprint.

export interface Chapter {
  path: string
  n: string
  title: string
  tagline: string
  blurb: string
  emoji: string
  accent: string        // text-* tailwind class
  accentBorder: string  // border-*/40
  accentBg: string      // bg-*/10
  group: 'intro' | 'layers' | 'recap'
  layer?: string        // short "Layer N · Name" badge for the six-layer chapters
}

export const CHAPTERS: Chapter[] = [
  {
    path: '/why',
    n: '01',
    title: 'Why Multi-Agent?',
    tagline: 'One agent drowns on the refund. Here is the honest case.',
    blurb: 'A single agent can answer questions, look up an order, and draft a reply — until the job needs different skills, a safety boundary, and real money to move. Feel where one agent breaks, and where splitting earns its cost.',
    emoji: '⚖️',
    accent: 'text-coral',
    accentBorder: 'border-coral/40',
    accentBg: 'bg-coral/10',
    group: 'intro',
  },
  {
    path: '/blueprint',
    n: '02',
    title: 'The Blueprint',
    tagline: 'The whole system on one page — six layers, top to bottom.',
    blurb: 'A real refund bot, cross-sectioned: a customer message enters the top, an orchestrator routes it, specialist agents do the work with tools, a guardrail and a human gate the money, and the outcome is logged. Every later chapter is one of these layers.',
    emoji: '🗺️',
    accent: 'text-paper',
    accentBorder: 'border-paper/40',
    accentBg: 'bg-paper/10',
    group: 'intro',
  },
  {
    path: '/orchestration',
    n: '03',
    title: 'Orchestration',
    tagline: 'The supervisor that detects intent, scores risk, and routes.',
    blurb: 'The top layer is one brain deciding who works next. It reads the request, scores how risky it is, and routes to the right specialist. This is where LangGraph, CrewAI Flows, or AutoGen live — the orchestration knob.',
    emoji: '🧭',
    accent: 'text-grape-soft',
    accentBorder: 'border-grape-soft/40',
    accentBg: 'bg-grape/10',
    group: 'layers',
    layer: 'Layer 1 · Orchestration',
  },
  {
    path: '/agents',
    n: '04',
    title: 'Specialist Agents',
    tagline: 'Knowledge, support, escalation — each with exactly one job.',
    blurb: 'Below the orchestrator sit the specialists: one fetches policy with RAG, one clarifies and drafts the reply, one decides if a human is needed. Each is a focused agent — a CrewAI crew member or an AutoGen agent.',
    emoji: '👥',
    accent: 'text-sky',
    accentBorder: 'border-sky/40',
    accentBg: 'bg-sky/10',
    group: 'layers',
    layer: 'Layer 2 · Agents',
  },
  {
    path: '/tools',
    n: '05',
    title: 'Tools & Systems',
    tagline: 'What agents can actually touch — via MCP, APIs, function calls.',
    blurb: 'Agents are useless without hands. This layer is the real systems they reach: a vector DB of policy docs, the CRM, the orders/billing system, the refund API. The wiring is MCP, function calling, and plain APIs.',
    emoji: '🛠️',
    accent: 'text-mint',
    accentBorder: 'border-mint/40',
    accentBg: 'bg-mint/10',
    group: 'layers',
    layer: 'Layer 3 · Tools',
  },
  {
    path: '/guardrails',
    n: '06',
    title: 'Guardrails & Human Gate',
    tagline: 'Risk and policy checks, then a human on the irreversible step.',
    blurb: 'Before any money moves, a risk and policy check runs: confidence, amount, fraud, compliance. Low risk and within policy passes through; high risk routes to a human who approves or rejects. Autonomy is a dial, not a switch.',
    emoji: '🛡️',
    accent: 'text-sun',
    accentBorder: 'border-sun/40',
    accentBg: 'bg-sun/10',
    group: 'layers',
    layer: 'Layer 4 · Guardrails',
  },
  {
    path: '/action',
    n: '07',
    title: 'Action Execution',
    tagline: 'The one moment real, irreversible money moves.',
    blurb: 'Everything upstream was reversible thinking. This is the act: call the refund API, move real money. It runs only once it has cleared the gate — and it must be safe to retry without double-paying.',
    emoji: '💸',
    accent: 'text-rose',
    accentBorder: 'border-rose/40',
    accentBg: 'bg-rose/10',
    group: 'layers',
    layer: 'Layer 5 · Action',
  },
  {
    path: '/outcome',
    n: '08',
    title: 'Outcome & Observability',
    tagline: 'Receipt, audit trail, and how you know it actually worked.',
    blurb: 'The action produced a result — now prove it. A receipt goes to the customer; a trace, the decision rationale, and metrics go to your logs. This layer is the difference between "it ran" and "we can stand behind it."',
    emoji: '📊',
    accent: 'text-paper',
    accentBorder: 'border-paper/40',
    accentBg: 'bg-paper/10',
    group: 'layers',
    layer: 'Layer 6 · Outcome',
  },
  {
    path: '/placement',
    n: '09',
    title: 'Framework Placement',
    tagline: 'Options A/B/C — and do you even need multi-agent at all?',
    blurb: 'Same blueprint, different framework choices: LangGraph + LangChain, CrewAI Flows, or the Microsoft/AutoGen stack. First decide whether you need more than one agent at all; then place the tools onto the layers you just learned.',
    emoji: '🧩',
    accent: 'text-grape-soft',
    accentBorder: 'border-grape-soft/40',
    accentBg: 'bg-grape/10',
    group: 'recap',
  },
  {
    path: '/takeaway',
    n: '10',
    title: 'Take It With You',
    tagline: 'One printable card, a build prompt, and the jargon decoded.',
    blurb: 'The whole lab as a single page you can carry to a planning meeting: the six-layer checklist, your chosen stack filled in, the build order, a prompt to paste into your AI assistant to scaffold it, and a five-term glossary. Copy it, print it, go build.',
    emoji: '🎒',
    accent: 'text-mint',
    accentBorder: 'border-mint/40',
    accentBg: 'bg-mint/10',
    group: 'recap',
  },
]
