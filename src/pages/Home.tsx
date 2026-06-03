import { Link } from 'react-router-dom'
import { CHAPTERS } from '../chapters'

const GROUPS: { id: 'intro' | 'layers' | 'recap'; label: string; hint: string }[] = [
  { id: 'intro', label: 'Start here', hint: 'Why more than one agent — and the whole system on one page.' },
  { id: 'layers', label: 'The six layers', hint: 'Top to bottom through one real refund: who routes, who works, what they touch, what gates the money, the move, the receipt.' },
  { id: 'recap', label: 'Putting it together', hint: 'Place real frameworks onto the layers — and decide if you even need multi-agent.' },
]

// The six horizontal bands of the reference blueprint, in order, each owning its
// legend color. This is the spine the whole lab is built around.
const LAYERS = [
  { tone: 'text-grape-soft', dot: 'bg-grape-soft', name: 'Orchestration', sub: 'supervisor routes the request' },
  { tone: 'text-sky', dot: 'bg-sky', name: 'Specialist agents', sub: 'knowledge · support · escalation' },
  { tone: 'text-mint', dot: 'bg-mint', name: 'Tools & systems', sub: 'vector DB · CRM · refund API' },
  { tone: 'text-sun', dot: 'bg-sun', name: 'Guardrails & human gate', sub: 'risk check · approval' },
  { tone: 'text-rose', dot: 'bg-rose', name: 'Action execution', sub: 'the real, irreversible move' },
  { tone: 'text-paper', dot: 'bg-paper', name: 'Outcome & observability', sub: 'receipt · audit trail' },
]

export default function Home() {
  const first = CHAPTERS[0]
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 lg:py-16">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-[0.3em] text-paper/40 mb-4">An interactive lab · ~25 minutes</p>
        <h1 className="text-4xl md:text-6xl font-black leading-[1.05]">
          <span className="bg-gradient-to-r from-grape-soft via-sky to-mint bg-clip-text text-transparent">
            One refund, six layers.
          </span>
          <br />
          <span className="text-paper">How a multi-agent system really works.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-paper/75 leading-relaxed">
          Everyone wires up “agents” and jumps straight to a framework. This lab does the
          opposite: we follow one customer message — “I was double-charged, refund me” —
          straight down a real system, one layer at a time. Learn the blueprint once, and
          every framework snaps onto it.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            to={first.path}
            className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-grape to-grape-soft text-white font-bold text-lg hover:scale-[1.03] transition-transform anim-pulse-glow"
          >
            Start the tour →
          </Link>
          <Link
            to="/blueprint"
            className="px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold text-lg transition-colors"
          >
            See the whole blueprint
          </Link>
        </div>
      </section>

      {/* The blueprint teaser — the six layers, stacked */}
      <section className="mt-16 max-w-3xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-ink-soft p-6 md:p-8">
          <p className="text-center text-sm uppercase tracking-widest text-paper/50 mb-1">The whole lab in one diagram</p>
          <p className="text-center text-xl md:text-2xl font-semibold text-paper mb-7">
            A request enters the top. Real money moves near the bottom. <span className="text-sun">Six layers</span> in between.
          </p>
          <div className="space-y-2">
            {LAYERS.map((l, i) => (
              <div
                key={l.name}
                className="flex items-center gap-3 rounded-xl border-2 border-white/10 bg-ink px-4 py-3 anim-float-in"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <span className="text-[10px] font-mono text-paper/35 w-4 shrink-0">{i + 1}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${l.dot} shrink-0`} />
                <span className={`text-base font-bold ${l.tone}`}>{l.name}</span>
                <span className="text-sm text-paper/55 leading-snug ml-auto text-right hidden sm:block">{l.sub}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-paper/55">
            One color = one meaning, everywhere in the lab. LangGraph, CrewAI, AutoGen, MCP —
            each one is just a tool that lives in one of these layers. Learn the layers once; read any stack forever.
          </p>
        </div>
      </section>

      {/* Chapter map */}
      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold text-paper mb-10">The path</h2>
        <div className="space-y-10">
          {GROUPS.map((g) => {
            const chapters = CHAPTERS.filter((c) => c.group === g.id)
            return (
              <div key={g.id}>
                <div className="flex items-baseline gap-3 mb-4 px-1">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-paper/80">{g.label}</h3>
                  <p className="text-sm text-paper/45">{g.hint}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {chapters.map((c) => (
                    <Link
                      key={c.path}
                      to={c.path}
                      className={`group rounded-2xl border ${c.accentBorder} bg-ink-soft hover:bg-white/[0.04] p-5 transition-all hover:-translate-y-0.5`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{c.emoji}</span>
                        <span className={`text-xs font-mono ${c.accent}`}>{c.n}</span>
                      </div>
                      {c.layer && (
                        <span className={`inline-block mb-1.5 text-[10px] font-semibold uppercase tracking-wider ${c.accent} opacity-80`}>
                          {c.layer}
                        </span>
                      )}
                      <p className={`font-bold text-lg leading-tight ${c.accent}`}>{c.title}</p>
                      <p className="mt-1 text-sm text-paper/55 leading-snug">{c.tagline}</p>
                      <span className={`mt-3 inline-block text-sm ${c.accent} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        Open →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Honest footer note */}
      <section className="mt-16 max-w-3xl mx-auto text-center">
        <div className="rounded-2xl border border-white/10 bg-ink-soft p-6">
          <p className="text-sm text-paper/70 leading-relaxed">
            <span className="text-paper font-semibold">No magic, no live AI.</span> Every animation
            here is scripted so you can replay it, pause it, and trust it. The goal isn’t to
            impress you with a demo — it’s to leave you able to sketch this whole system on a napkin.
          </p>
        </div>
      </section>
    </div>
  )
}
