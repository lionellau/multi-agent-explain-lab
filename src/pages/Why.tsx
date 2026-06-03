import { useEffect, useState } from 'react'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'
import { PokeHint, pokeRing } from '../components/Poke'
import type { Beat } from '../components/StorySteps'

const chapter = CHAPTERS.find((c) => c.path === '/why')!

const beats: Beat[] = [
  {
    caption: 'A customer writes: “I was double-charged $79 — refund me.” Before any framework, one honest question: should one agent handle this, or several?',
    llmNote:
      'The baseline is always a single model call with some tools. “Multi-agent” is a bet that splitting the work beats the overhead of splitting it. This whole lab follows that one refund to read the bet honestly.',
    readingMs: 4000,
  },
  {
    caption: 'A second agent is never free. Every handoff costs tokens, adds latency, and invents a brand-new way to fail.',
    llmNote:
      'Each agent re-receives context (more tokens = more money), waits for the previous one to finish (more latency), and can misread what it was handed (a failure mode that simply does not exist with one agent).',
    readingMs: 4200,
  },
  {
    caption: 'But this refund is not one job — it’s five. Fetch the policy, check the charge, judge fraud risk, draft the reply, and move real money. Press Next and watch the dot climb into the multi-agent zone.',
    llmNote:
      'Each of those wants a different instruction set and a clean context — and one of them spends real money. Reading a policy and authorizing a payout are genuinely different jobs. When the jobs differ that much, separating them raises quality more than the overhead lowers it.',
    readingMs: 4600,
  },
  {
    caption: 'Plot it. Complexity runs across; your patience for cost and waiting runs up. The refund is parked in the multi-agent corner — now grab the sliders and move it yourself.',
    llmNote:
      'The two axes are the whole decision. Across: how many genuinely different sub-tasks are inside this? Up: how much extra latency and spend can you stomach? The top-right corner is the only place multi-agent clearly wins.',
    readingMs: 4200,
  },
  {
    caption: 'Watch the dot jump to the trap in the bottom-right: a complex task with impatient users still says “one streamed agent,” not a committee.',
    llmNote:
      'High complexity tempts people into multi-agent. But if users are watching a spinner, the round-trips between agents are exactly what you cannot afford. Complexity alone does not justify the split — patience has to be there too.',
    readingMs: 4600,
  },
  {
    caption: 'Now the dot slides to the bottom-left, where most real tasks actually live. A plain “where’s my order?” is one strong model with a lookup tool — not a crew.',
    llmNote:
      'Multi-agent demos are seductive because they look sophisticated. In production, every extra agent is extra surface area for bugs, cost, and confusion. Reach for more agents only when the dot is genuinely up-and-to-the-right.',
    readingMs: 4800,
  },
  {
    caption: 'Your turn. Read the scenario below and commit to an answer before you reveal it.',
    llmNote:
      'There is no trick. The point is to feel the pull toward “more agents = better,” then check it against the two axes you just learned — and against what happens when real money is on the line.',
    readingMs: 3400,
  },
  {
    caption: 'That’s the honest case. The refund earns its split — distinct jobs and an irreversible payout. Next: the whole system on one page, so you can see where each piece lives.',
    llmNote:
      'Every chapter after this zooms into one band of a single diagram — the blueprint. Once you have the map, every framework in this lab becomes a set of choices about which band each tool lives in.',
    readingMs: 4200,
  },
]

// Rough decision boundary. Honest about being a guide, not a law.
function verdictFor(complexity: number, patience: number) {
  if (complexity >= 58 && patience >= 52) {
    return {
      key: 'multi' as const,
      tone: 'text-grape-soft',
      ring: 'border-grape-soft',
      title: 'Reach for multiple agents',
      body: 'Distinct sub-tasks and room to spend — splitting raises quality more than overhead costs you.',
    }
  }
  if (complexity >= 58 && patience < 52) {
    return {
      key: 'trap' as const,
      tone: 'text-coral',
      ring: 'border-coral',
      title: 'Tempting — but no. One streamed agent.',
      body: 'It’s complex, so a committee feels right. But impatient users can’t absorb the round-trips between agents. Keep it single and stream the output.',
    }
  }
  return {
    key: 'single' as const,
    tone: 'text-paper',
    ring: 'border-paper/40',
    title: 'One agent, good tools',
    body: 'The task isn’t split enough to justify the cost. A single strong model with the right tools will be cheaper, faster, and easier to debug.',
  }
}

function PhaseDiagram({ complexity, patience }: { complexity: number; patience: number }) {
  const W = 640
  const H = 300
  const pad = 36
  const px = pad + (complexity / 100) * (W - pad * 2)
  const py = H - pad - (patience / 100) * (H - pad * 2)
  const v = verdictFor(complexity, patience)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Single-vs-multi-agent decision plane">
      {/* regions */}
      {/* single (whole plane, neutral) */}
      <rect x={pad} y={pad} width={W - pad * 2} height={H - pad * 2} fill="#fdf6f0" opacity={0.04} />
      {/* multi-agent home: top-right */}
      <rect x={pad + (W - pad * 2) * 0.55} y={pad} width={(W - pad * 2) * 0.45} height={(H - pad * 2) * 0.48} fill="#a78bfa" opacity={0.16} />
      <text x={W - pad - 8} y={pad + 22} textAnchor="end" fontSize="12" fill="#a78bfa" className="font-bold">multi-agent</text>
      {/* trap: bottom-right */}
      <rect x={pad + (W - pad * 2) * 0.55} y={pad + (H - pad * 2) * 0.6} width={(W - pad * 2) * 0.45} height={(H - pad * 2) * 0.4} fill="#fb7185" opacity={0.12} />
      <text x={W - pad - 8} y={H - pad - 10} textAnchor="end" fontSize="11" fill="#fb7185" className="font-bold">the trap</text>
      {/* single label bottom-left */}
      <text x={pad + 8} y={H - pad - 10} fontSize="12" fill="#fdf6f0" opacity={0.6} className="font-bold">one agent</text>

      {/* axes */}
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#fdf6f0" strokeOpacity={0.25} />
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#fdf6f0" strokeOpacity={0.25} />
      <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="#fdf6f0" opacity={0.55} className="font-mono uppercase tracking-wider">task complexity →</text>
      <text x={12} y={H / 2} textAnchor="middle" fontSize="11" fill="#fdf6f0" opacity={0.55} transform={`rotate(-90 12 ${H / 2})`} className="font-mono uppercase tracking-wider">patience (cost · latency) →</text>

      {/* marker — cx/cy transition so a Next-driven move visibly glides */}
      {(() => {
        const c = v.key === 'multi' ? '#a78bfa' : v.key === 'trap' ? '#fb7185' : '#fdf6f0'
        const ease = { transition: 'cx 600ms cubic-bezier(0.22,1,0.36,1), cy 600ms cubic-bezier(0.22,1,0.36,1)' } as const
        return (
          <>
            <line x1={px} y1={H - pad} x2={px} y2={py} stroke={c} strokeOpacity={0.3} strokeDasharray="4 4" style={{ transition: 'x1 600ms, x2 600ms, y2 600ms' }} />
            <line x1={pad} y1={py} x2={px} y2={py} stroke={c} strokeOpacity={0.3} strokeDasharray="4 4" style={{ transition: 'x2 600ms, y1 600ms, y2 600ms' }} />
            <circle cx={px} cy={py} r={11} fill={c} opacity={0.25} style={ease} />
            <circle cx={px} cy={py} r={6} fill={c} style={ease} />
          </>
        )
      })()}
    </svg>
  )
}

// Audit rule: "Next step" must move + explain the LEFT panel. Each story beat
// parks the dot in the region the narration is describing, so pressing Next
// visibly glides it from zone to zone. The slider beat (3) is left alone so
// the dot stays where beat 2 put it, inviting the user to take over.
const DOT_SCRIPT: Record<number, { c: number; p: number }> = {
  0: { c: 34, p: 40 }, // intro — a typical "one agent" task, bottom-left
  2: { c: 74, p: 80 }, // distinct jobs → multi-agent corner (top-right)
  4: { c: 82, p: 24 }, // the trap (bottom-right)
  5: { c: 22, p: 30 }, // most real tasks (bottom-left → one agent)
}

export default function Why() {
  const [step, setStep] = useState(0)
  const [complexity, setComplexity] = useState(34)
  const [patience, setPatience] = useState(40)
  const [dragged, setDragged] = useState(false)
  const [pick, setPick] = useState<null | 'one' | 'many'>(null)

  useEffect(() => {
    const pos = DOT_SCRIPT[step]
    if (pos) {
      setComplexity(pos.c)
      setPatience(pos.p)
    }
  }, [step])

  const v = verdictFor(complexity, patience)

  const watch = (
    <div>
      <PhaseDiagram complexity={complexity} patience={patience} />

      <div className={`mt-4 rounded-xl border-2 ${v.ring} bg-ink p-4`}>
        <p className={`font-bold text-lg ${v.tone}`}>{v.title}</p>
        <p className="mt-1 text-sm text-paper/80 leading-snug">{v.body}</p>
      </div>

      <div className="mt-5 flex items-center justify-between mb-1">
        <p className="text-[11px] uppercase tracking-widest text-paper/45">Drag to move the dot</p>
        <PokeHint show={!dragged} label="↔ drag the sliders" />
      </div>
      <div className={`grid sm:grid-cols-2 gap-4 rounded-xl ${pokeRing(!dragged)}`}>
        <label className="block">
          <span className="flex justify-between text-xs font-mono uppercase tracking-wider text-paper/55 mb-1">
            <span>Task complexity</span>
            <span className="text-paper/40">{complexity}</span>
          </span>
          <input
            type="range" min={0} max={100} value={complexity}
            onChange={(e) => { setComplexity(+e.target.value); setDragged(true) }}
            className="w-full accent-grape-soft"
            aria-label="Task complexity"
          />
          <span className="flex justify-between text-[10px] text-paper/35 mt-0.5">
            <span>one clear job</span><span>many distinct jobs</span>
          </span>
        </label>
        <label className="block">
          <span className="flex justify-between text-xs font-mono uppercase tracking-wider text-paper/55 mb-1">
            <span>Patience (cost · latency)</span>
            <span className="text-paper/40">{patience}</span>
          </span>
          <input
            type="range" min={0} max={100} value={patience}
            onChange={(e) => { setPatience(+e.target.value); setDragged(true) }}
            className="w-full accent-grape-soft"
            aria-label="Patience for cost and latency"
          />
          <span className="flex justify-between text-[10px] text-paper/35 mt-0.5">
            <span>users are waiting</span><span>offline / batch</span>
          </span>
        </label>
      </div>
    </div>
  )

  const extras = (
    <div className="mt-4 rounded-2xl border border-white/10 bg-ink-soft p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-widest text-paper/45">Your one decision</p>
        <PokeHint show={!pick} label="👆 pick one" />
      </div>
      <p className="text-paper/85 text-sm leading-relaxed">
        Back to the refund. The bot must pull the refund policy, look up the customer’s charge,
        judge fraud risk, and — if it clears — move real money. A teammate says “just give one big
        agent all the tools and a long prompt.”
      </p>
      <p className="mt-2 text-paper font-semibold text-sm">One mega-agent, or split it?</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setPick('one')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
            pick === 'one' ? 'border-coral bg-coral/15 text-coral' : 'border-white/15 text-paper/70 hover:bg-white/5'
          }`}
        >
          One mega-agent with every tool
        </button>
        <button
          onClick={() => setPick('many')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
            pick === 'many' ? 'border-grape-soft bg-grape/15 text-grape-soft' : 'border-white/15 text-paper/70 hover:bg-white/5'
          }`}
        >
          Split into specialists + a gate
        </button>
      </div>

      {pick && (
        <div className="mt-4 rounded-xl border border-white/10 bg-ink p-4 anim-float-in">
          {pick === 'many' ? (
            <>
              <p className="text-grape-soft font-bold text-sm">Right call — and for a specific reason.</p>
              <p className="mt-1 text-sm text-paper/80 leading-relaxed">
                The jobs are genuinely different (read policy vs. authorize a payout), and one of them is{' '}
                <span className="text-rose">irreversible money</span>. You want a{' '}
                <span className="text-sun">safety gate</span> between “decide” and “spend” — a single prompt that
                both judges risk <em>and</em> moves money is the dangerous pattern. Splitting lets you put a human
                on exactly the one step that matters. This dot sits top-right: the multi-agent corner.
              </p>
            </>
          ) : (
            <>
              <p className="text-coral font-bold text-sm">Tempting — but this is how money leaks.</p>
              <p className="mt-1 text-sm text-paper/80 leading-relaxed">
                One prompt that can both decide a refund is legit <em>and</em> call the payout API has no seam to
                stop it. There’s nowhere clean to insert the <span className="text-sun">human gate</span>, and when it
                misfires it refunds a fraudster instantly. Note the honesty though: if the task were just{' '}
                “<span className="text-paper">where’s my order?</span>”, one agent + a lookup tool would be exactly right.
                It’s the <span className="text-rose">irreversible money</span> that forces the split here.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )

  const outro = (
    <>
      <p>
        One agent is the default. A second agent is a deliberate trade: you spend tokens, latency,
        and a new failure mode, and in return you get focused specialists on genuinely separate jobs.
      </p>
      <p>
        The refund earns the split twice over: the work breaks into distinct jobs, and one step moves{' '}
        <span className="text-rose font-semibold">irreversible money</span> — so you need a seam where a human
        can stand. Everywhere the dot sits bottom-left (a plain lookup), start with one. Next, the whole
        system on one page.
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
      noteLabel="↳ Why this costs what it costs"
    />
  )
}
