import { useState } from 'react'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'
import {
  WorkflowCanvas,
  Edge,
  FlowNode,
  MetricRow,
  ToolStack,
  atCenter,
  type Pt,
} from '../components/Flow'
import type { Beat } from '../components/StorySteps'

const chapter = CHAPTERS.find((c) => c.path === '/tools')!

const beats: Beat[] = [
  {
    caption: 'A specialist agent can reason all day — but it can’t touch one real system.',
    llmNote:
      'Everything outside the model’s frozen weights — your policy DB, the CRM, the billing ledger — is invisible until the agent calls a tool. A tool call is the only bridge from “language model” to “software.”',
    readingMs: 3600,
  },
  {
    caption: 'Wire each system by hand and you get four bespoke integrations to babysit.',
    llmNote:
      'Every API has its own auth, schema, and quirks. Four systems = four custom adapters, four things that break the day a vendor renames a field.',
    readingMs: 3600,
  },
  {
    caption: 'MCP is one universal plug: write the adapter once, every tool speaks it.',
    llmNote:
      'MCP (Model Context Protocol) is “USB-C for AI tools” — a shared shape any system can expose. The agent learns one protocol instead of N bespoke ones.',
    readingMs: 4000,
  },
  {
    caption: 'The agent emits { tool, args }; MCP runs it and feeds the result back.',
    llmNote:
      'search_policy("double charge") leaves as JSON, the runtime executes it against the vector DB, and the matching clause returns into context. That round-trip is the entire mechanism behind “function calling” and MCP.',
    readingMs: 4200,
  },
  {
    caption: 'Read calls are safe to retry. The one that moves money is gated.',
    llmNote:
      'get_policy / get_customer / get_charges change nothing in the world — fire them freely. issue_refund() moves real money, so it never auto-fires; it waits for Layer 4’s gate.',
    readingMs: 4200,
  },
  {
    caption: 'You rarely hand-write MCP — you pick a tool layer. Here’s how it’s built.',
    llmNote:
      'MCP standardises the wire; toolkits like LangChain Tools or the OpenAI Agents SDK give you the decorators and registries to expose a Python function as a callable tool in a few lines.',
    readingMs: 4000,
  },
  {
    caption: 'Tools are where an agent stops being a chatbot and becomes software.',
    llmNote:
      'The real design isn’t the wiring — it’s which systems you expose and how tightly. Expose too little and the agent guesses; too much and one bad call has real-world blast radius.',
    readingMs: 4000,
  },
]

const W = 720
const H = 360

const AGENT: Pt = { x: 92, y: 180 }
const HUB: Pt = { x: 342, y: 180 }

interface Sys {
  id: string
  icon: string
  title: string
  call: string
  tone: 'mint' | 'sky' | 'sun' | 'coral'
  pt: Pt
  gated?: boolean
}
const SYS: Sys[] = [
  { id: 'vdb', icon: '📚', title: 'Policy Vector DB', call: 'search_policy()', tone: 'mint', pt: { x: 600, y: 56 } },
  { id: 'crm', icon: '👤', title: 'CRM', call: 'get_customer()', tone: 'sky', pt: { x: 600, y: 132 } },
  { id: 'bill', icon: '🧾', title: 'Orders / Billing', call: 'get_charges()', tone: 'sun', pt: { x: 600, y: 208 } },
  { id: 'refund', icon: '💸', title: 'Refund API', call: 'issue_refund()', tone: 'coral', pt: { x: 600, y: 300 }, gated: true },
]

function Console({ step }: { step: number }) {
  if (step < 3) {
    return (
      <div className="mt-3 rounded-xl border border-mint/25 bg-ink p-3 font-mono text-[11px]">
        <p className="text-paper/45 italic">No tool called yet — advance to watch a call travel through MCP.</p>
      </div>
    )
  }
  return (
    <div className="mt-3 rounded-xl border border-mint/25 bg-ink p-3 font-mono text-[11px] leading-relaxed space-y-2">
      <div key="read" className="anim-float-in">
        <div>
          <span className="text-paper/40">CALL ▸ </span>
          <span className="text-paper/90">search_policy(&quot;double charge refund&quot;)</span>
        </div>
        <div>
          <span className="text-paper/40">via &nbsp;▸ </span>
          <span className="text-mint/70 italic">MCP → Policy Vector DB · read · safe</span>
        </div>
        <div className="rounded-md border border-mint/20 bg-mint/5 p-2">
          <span className="text-mint/70">RESULT ▸ </span>
          <span className="text-paper/90">Duplicate charges are refundable within 60 days. [policy §3]</span>
        </div>
      </div>
      {step >= 4 && (
        <div key="write" className="anim-float-in">
          <div>
            <span className="text-paper/40">CALL ▸ </span>
            <span className="text-paper/90">issue_refund(79.00, &quot;A-2098&quot;)</span>
          </div>
          <div>
            <span className="text-paper/40">via &nbsp;▸ </span>
            <span className="text-coral/80 italic">MCP → Refund API · write · ⛔ gated</span>
          </div>
          <div className="rounded-md border border-coral/30 bg-coral/5 p-2">
            <span className="text-coral/80">RESULT ▸ </span>
            <span className="text-paper/90">held — fires only after the human gate (Layer 4) + action (Layer 5)</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Tools() {
  const [step, setStep] = useState(0)

  const showWiring = step >= 1
  const spaghetti = step === 1 // tangled hand-wiring (collapses once MCP arrives)
  const showMcp = step >= 2
  const callActive = step === 3
  const refundGated = step >= 4

  // WorkflowCanvas takes edges + children separately; build them here.
  const edges = (
    <>
      {/* Phase 1: spaghetti — every system gets its own bespoke cable. */}
      {spaghetti &&
        SYS.map((s, i) => (
          <Edge key={'sp-' + s.id} from={AGENT} to={s.pt} tone={s.tone} dashed curve={(i - 1.5) * 0.16} />
        ))}

      {/* Phase 2+: one cable to the MCP hub, then uniform spokes out to each system. */}
      <Edge from={AGENT} to={HUB} tone="grape" show={showMcp} active={callActive} thickness={callActive ? 3 : 2} label="{ tool, args }" />
      {showMcp &&
        SYS.map((s, i) => {
          const isRead = !s.gated
          const isActiveSpoke = callActive && s.id === 'vdb'
          return (
            <Edge
              key={'mcp-' + s.id}
              from={HUB}
              to={s.pt}
              tone={s.gated && refundGated ? 'coral' : isRead ? 'mint' : 'paper'}
              dashed={s.gated && refundGated}
              active={isActiveSpoke}
              curve={(i - 1.5) * 0.05}
            />
          )
        })}
    </>
  )

  const nodes = (
    <>
      <div style={atCenter(AGENT, 120, 58)}>
        <FlowNode tone="sky" icon="🤖" title="Agent" sub="reasons · decides" state="active" size="sm" />
      </div>

      <div style={atCenter(HUB, 132, 64)}>
        <FlowNode
          tone="grape"
          icon="🔌"
          title="MCP hub"
          sub="one shared protocol"
          state={showMcp ? (callActive ? 'active' : 'base') : 'dim'}
          size="sm"
        />
      </div>

      {SYS.map((s) => {
        const gated = s.gated && refundGated
        return (
          <div key={s.id} style={atCenter(s.pt, 150, 56)}>
            <FlowNode
              tone={gated ? 'coral' : s.tone}
              icon={gated ? '⛔' : s.icon}
              title={s.title}
              sub={<span className="font-mono text-[10px]">{s.call}</span>}
              state={!showWiring ? 'dim' : callActive && s.id === 'vdb' ? 'active' : 'base'}
              size="sm"
            />
          </div>
        )
      })}

      {/* phase captions baked into the canvas so the picture is self-explaining */}
      {spaghetti && (
        <div className="absolute left-2 top-1 text-[10px] uppercase tracking-widest text-coral/70 font-semibold anim-float-in">
          Before · 4 bespoke cables
        </div>
      )}
      {showMcp && (
        <div className="absolute left-2 top-1 text-[10px] uppercase tracking-widest text-grape-soft/80 font-semibold anim-float-in">
          After · one MCP adapter
        </div>
      )}
    </>
  )

  const watchPanel = (
    <div>
      <WorkflowCanvas width={W} height={H} edges={edges}>
        {nodes}
      </WorkflowCanvas>
      <MetricRow
        items={[
          { label: 'Systems', value: SYS.length },
          {
            label: 'Integrations',
            value: showMcp ? '1 · MCP' : showWiring ? '4 custom' : '—',
            tone: showMcp ? 'mint' : showWiring ? 'coral' : 'paper',
          },
          { label: 'Money-moving · gated', value: refundGated ? '1 · refund' : '—', tone: 'coral' },
        ]}
      />
      <Console step={step} />
    </div>
  )

  const extras = (
    <ToolStack
      show={step >= 5}
      tone="mint"
      stage="Layer 3 · Tools & Systems"
      primary={{
        name: 'MCP + function calling',
        tagline: 'Expose each real system as a typed tool the agent can call; MCP standardises the wire so one adapter serves any client.',
        badge: 'the standard',
      }}
      alternatives={[
        { name: 'LangChain Tools', tagline: '@tool decorator + huge prebuilt toolkit (retrievers, SQL, search).' },
        { name: 'OpenAI Agents SDK', tagline: 'function tools + hosted tool execution in the OpenAI stack.' },
        { name: 'LlamaIndex Tools', tagline: 'tool specs centred on retrieval / data-heavy agents.' },
        { name: 'Native function calling', tagline: 'raw { tool, args } JSON schema — no framework at all.' },
      ]}
      snippetLabel="how you’d build it · MCP server (Python)"
      snippet={`from mcp.server.fastmcp import FastMCP

mcp = FastMCP("refund-tools")

@mcp.tool()                      # read · safe to auto-call
def search_policy(q: str) -> str:
    return vector_db.query(q)

@mcp.tool()                      # write · gate before calling
def issue_refund(amount: float, order: str) -> str:
    return billing.refund(order, amount)`}
      note={
        <>
          Same registry, two risk classes: <span className="text-mint font-semibold">reads auto-fire</span>, the{' '}
          <span className="text-coral font-semibold">refund waits for the gate</span>. The next layer is that gate.
        </>
      }
    />
  )

  const outro = (
    <>
      <p>
        Tools are how an agent reaches outside its own weights. The model emits{' '}
        <span className="text-mint font-semibold">{'{ tool, args }'}</span>; the runtime runs it against a real system and feeds
        the result back. <span className="text-grape-soft font-semibold">MCP</span> just makes that wire universal — one adapter
        instead of one per system.
      </p>
      <p>
        Most calls are <span className="text-mint font-semibold">read-only</span> and safe to retry. The dangerous few — the
        refund API, notifications — change the world, so they’re <span className="text-coral font-semibold">guarded</span>.
      </p>
      <p>This is where agents become software. Next: the gate that decides which guarded call is actually allowed to run.</p>
    </>
  )

  return (
    <ChapterShell
      chapter={chapter}
      beats={beats}
      onStep={setStep}
      watch={watchPanel}
      extras={extras}
      outro={outro}
      noteLabel="↳ What a tool call really is"
    />
  )
}
