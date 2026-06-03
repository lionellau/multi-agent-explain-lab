import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CHAPTERS } from '../chapters'
import ChapterShell from '../components/ChapterShell'
import { PokeHint } from '../components/Poke'
import { MetricRow, ToolStack } from '../components/Flow'
import type { Beat } from '../components/StorySteps'

const chapter = CHAPTERS.find((c) => c.path === '/action')!

/* ──────────────────────────────────────────────────────────────────────────
 *  LAYER 5 — ACTION EXECUTION  (theme: ROSE)
 *
 *  The gate said yes. This is the ONE step that touches the outside world
 *  irreversibly: the Refund API moves real money. Everything before was
 *  reversible (reads, drafts, proposals). The teaching beat is idempotency —
 *  a refund must fire exactly once even when the network forces a retry.
 *  ────────────────────────────────────────────────────────────────────── */

const beats: Beat[] = [
  {
    caption:
      'The gate said yes. Now the only step in the whole system that actually touches the outside world runs: the Refund API moves real money into the customer’s account. Everything before this was reversible. This is not.',
    llmNote:
      'Notice what executes here: not the model. A plain function call fires with the exact, already-approved parameters. The LLM proposed the refund three layers ago; it is nowhere near this button now. Execution is deliberately dumb and deterministic.',
    readingMs: 5200,
  },
  {
    caption:
      'The call carries an idempotency key — a unique stamp for this exact refund. The API records it: key rfnd_4412 → refunded $79.00 → transaction tx_91. One key, one transaction, forever.',
    llmNote:
      'An idempotency key is just a promise: “if you ever see this key again, don’t do the work twice — hand back the original result.” It’s the difference between a script you can safely re-run and one that double-charges people.',
    readingMs: 5000,
  },
  {
    caption:
      'The $79 is gone to the customer. There’s no undo button — the only reversal is a brand-new, separately-approved charge. That’s precisely why the human gate stood before this step, never after.',
    llmNote:
      'This asymmetry drives the whole architecture. Reads and drafts are cheap to get wrong because you can retry them. An executed payment is not. Put the expensive checks upstream of the irreversible thing.',
    readingMs: 4800,
  },
  {
    caption:
      'Now the real world intrudes: the network drops the response. The orchestrator never hears “success,” so it does the sane thing and retries the identical call. Without protection, that’s a second $79 — the customer is now over-refunded.',
    llmNote:
      'This is the bug that bites every payments system eventually. Retries aren’t a rare edge case — timeouts, restarts, and at-least-once queues guarantee the same action gets attempted more than once. You must design for it.',
    readingMs: 5200,
  },
  {
    caption:
      'But the idempotency key saves it: the API sees the same key it already processed, returns the original tx_91, and moves no new money. The retry is safe. Exactly-once, even though the call happened twice.',
    llmNote:
      'Same input, same key, same result — no duplicate side effect. That property is what lets the rest of the system retry freely without fear. It turns a fragile money-mover into a boring, reliable one.',
    readingMs: 4800,
  },
  {
    caption:
      'Your turn: flip the idempotency key off and hit Retry to feel the bug — two refunds, $158 gone. Flip it back on and retry to watch the API dedupe it down to one.',
    llmNote:
      'The whole demo is one toggle because that’s how thin the line is in production. One key, threaded through every call, is what stands between “retry-safe” and “refunded the customer twice.”',
    readingMs: 4400,
  },
  {
    caption:
      'Execution is the smallest layer and the most load-bearing. It does one thing — the irreversible thing — and it has to do it exactly once, every time, no matter what the network does.',
    llmNote:
      'Keep this layer tiny and paranoid: validate the approved parameters, attach the key, call once, handle retries idempotently. The intelligence lives upstream; down here you want predictability, not cleverness.',
    readingMs: 4600,
  },
]

/* ── scripted console (watch panel) ───────────────────────────────────── */

interface Line {
  kind: 'call' | 'ok' | 'note'
  text: string
  tag?: string
  tagTone?: 'mint' | 'coral' | 'rose'
}

const SCRIPT: { line: Line; from: number }[] = [
  { from: 0, line: { kind: 'call', text: 'POST issue_refund { amount: 79.00, order: 4412, key: rfnd_4412 }' } },
  { from: 1, line: { kind: 'ok', text: '200 OK · refunded $79.00 · tx_91', tag: 'NEW', tagTone: 'rose' } },
  { from: 2, line: { kind: 'note', text: '💸 $79.00 left the account — irreversible' } },
  { from: 3, line: { kind: 'call', text: 'POST issue_refund { …same key: rfnd_4412 }   ⟲ network retry' } },
  { from: 4, line: { kind: 'ok', text: '200 OK · returned tx_91 · $0.00 moved', tag: 'DEDUPED', tagTone: 'mint' } },
]

function Console({ step }: { step: number }) {
  return (
    <div className="mx-auto" style={{ maxWidth: 460 }}>
      {/* approved action handed down from the gate */}
      <div className="rounded-xl border-2 border-rose bg-rose/[0.08] px-3 py-2.5">
        <p className="text-[10px] font-mono uppercase tracking-wider text-paper/45">Approved action · from the gate (L4)</p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-sm font-bold text-rose leading-tight">💸 Execute refund · $79 · order #4412</p>
          <span className="rounded-full bg-rose/20 px-2 py-0.5 text-[10px] font-mono text-rose">key rfnd_4412</span>
        </div>
      </div>

      <div className="flex justify-center py-1" aria-hidden>
        <svg width="16" height="20" viewBox="0 0 16 20">
          <line x1="8" y1="0" x2="8" y2="13" stroke="#f472b6" strokeWidth={2} />
          <path d="M3 11 L8 18 L13 11" fill="none" stroke="#f472b6" strokeWidth={2} />
        </svg>
      </div>

      {/* the Refund API console */}
      <div className="rounded-xl border border-rose/30 bg-ink overflow-hidden">
        <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
          <span className="text-sm">🏦</span>
          <p className="text-[11px] uppercase tracking-widest text-rose/80">Refund API · execution log</p>
        </div>
        <div className="p-3 font-mono text-[11px] space-y-1.5 min-h-[132px]">
          {SCRIPT.map((s, i) => {
            const show = step >= s.from
            if (!show) return null
            const l = s.line
            const tone =
              l.kind === 'call' ? 'text-paper/80' : l.kind === 'note' ? 'text-coral' : 'text-paper/90'
            return (
              <div key={i} className="anim-float-in flex items-start gap-2 leading-snug">
                <span className={l.kind === 'call' ? 'text-rose' : l.kind === 'note' ? 'text-coral' : 'text-mint'}>
                  {l.kind === 'call' ? '→' : l.kind === 'note' ? '⚠' : '←'}
                </span>
                <span className={tone}>
                  {l.text}
                  {l.tag && (
                    <span
                      className={`ml-2 rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        l.tagTone === 'mint' ? 'bg-mint/20 text-mint' : 'bg-rose/20 text-rose'
                      }`}
                    >
                      {l.tag}
                    </span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {step >= 4 && (
        <p className="mt-2 text-center text-[11px] text-mint anim-float-in">
          ✓ called twice · refunded once · the key made the retry safe
        </p>
      )}
    </div>
  )
}

/* ── interactive retry playground (extras) ────────────────────────────── */

interface Tx {
  id: string
  amount: number
  tag: 'NEW' | 'DEDUPED'
}

export default function Action() {
  const [step, setStep] = useState(0)
  const [idem, setIdem] = useState(true)
  const [txs, setTxs] = useState<Tx[]>([])

  const sent = txs.length > 0
  const moved = txs.reduce((sum, t) => sum + t.amount, 0)
  const doubled = moved > 79

  const sendRefund = () => setTxs([{ id: 'tx_91', amount: 79, tag: 'NEW' }])
  const retry = () =>
    setTxs((prev) =>
      idem
        ? [...prev, { id: 'tx_91', amount: 0, tag: 'DEDUPED' }]
        : [...prev, { id: `tx_9${prev.length + 1}`, amount: 79, tag: 'NEW' }],
    )
  const reset = () => setTxs([])

  // live strip mirroring the scripted execution console
  const callsMade = SCRIPT.filter((s) => s.line.kind === 'call' && step >= s.from).length
  const movedScript = step >= 1 ? 79 : 0

  const watch = (
    <div>
      <Console step={step} />
      <MetricRow
        items={[
          { label: 'API calls', value: callsMade, tone: 'rose' },
          { label: 'Money moved', value: `$${movedScript}`, tone: 'rose' },
          {
            label: 'Guarantee',
            value: step >= 4 ? 'exactly-once' : step >= 1 ? 'once' : '—',
            tone: step >= 4 ? 'mint' : 'paper',
          },
        ]}
      />
    </div>
  )

  const breakPanel = step >= 5 && (
    <div className="mt-4 rounded-2xl border border-white/10 bg-ink-soft p-5 anim-float-in">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] uppercase tracking-widest text-paper/45">Break it yourself</p>
        <PokeHint show={!sent} label="👆 send, then retry" />
      </div>

      {/* idempotency switch */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-paper/60">Idempotency key</span>
        <button
          onClick={() => { setIdem((v) => !v); reset() }}
          className={`rounded-full border-2 px-3 py-1 text-xs font-bold transition-all ${
            idem ? 'border-mint bg-mint/15 text-mint' : 'border-coral bg-coral/15 text-coral'
          }`}
        >
          {idem ? 'ON · retry-safe' : 'OFF · unsafe'}
        </button>
      </div>

      {/* actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={sendRefund}
          disabled={sent}
          className="rounded-lg border-2 border-rose/60 px-3 py-2.5 text-rose font-bold text-sm transition-all hover:bg-rose/10 disabled:opacity-35 disabled:hover:bg-transparent"
        >
          ▶ Send refund
        </button>
        <button
          onClick={retry}
          disabled={!sent}
          className="rounded-lg border-2 border-sun/60 px-3 py-2.5 text-sun font-bold text-sm transition-all hover:bg-sun/10 disabled:opacity-35 disabled:hover:bg-transparent"
        >
          ↻ Retry (network hiccup)
        </button>
      </div>

      {/* ledger */}
      {sent && (
        <div className="mt-4 rounded-xl border border-white/10 bg-ink p-3 anim-float-in">
          <div className="space-y-1.5 font-mono text-[11px]">
            {txs.map((t, i) => (
              <div key={i} className="flex items-center justify-between anim-float-in">
                <span className="text-paper/80">{t.id} · ${t.amount.toFixed(2)}</span>
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${t.tag === 'DEDUPED' ? 'bg-mint/20 text-mint' : 'bg-rose/20 text-rose'}`}>
                  {t.tag}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-paper/55">Total actually refunded</span>
            <span className={`text-lg font-bold ${doubled ? 'text-coral' : 'text-mint'}`}>${moved.toFixed(2)}</span>
          </div>
          <p className={`mt-2 text-[11px] leading-snug ${doubled ? 'text-coral' : 'text-mint'}`}>
            {doubled
              ? '✕ Double-refunded. The retry fired a second real payment — exactly the bug idempotency prevents.'
              : txs.length > 1
              ? '✓ Retried safely. The API recognised the key and moved no new money — exactly once.'
              : 'One refund sent. Now hit Retry with the key OFF, then ON, to feel the difference.'}
          </p>
        </div>
      )}
    </div>
  )

  const extras = (
    <>
      {breakPanel}
      <ToolStack
        show={step >= 6}
        tone="rose"
        stage="Layer 5 · Action Execution"
        primary={{
          name: 'Idempotency key',
          tagline:
            'Stamp the irreversible call with a unique key; the API records key → result, so any retry returns the original transaction instead of moving money a second time.',
          badge: 'non-negotiable',
        }}
        alternatives={[
          { name: 'Temporal', tagline: 'durable workflows; the engine retries activities exactly-once for you.' },
          { name: 'transactional outbox', tagline: 'write intent + side effect in one DB tx; a worker delivers it.' },
          { name: 'queue + dedup', tagline: 'SQS/Kafka with idempotent consumers — at-least-once made safe.' },
          { name: 'native key check', tagline: 'store the key yourself, short-circuit on replay — no framework.' },
        ]}
        snippetLabel="how you’d build it · idempotent execute"
        snippet={`def execute_refund(amount, order, key):
    # already done? hand back the original — move no money
    if prior := ledger.get(key):
        return prior.tx_id
    tx = billing.refund(order, amount,
                        idempotency_key=key)   # one key, one charge
    ledger.put(key, tx)
    return tx.tx_id`}
        note={
          <>
            The model is nowhere near this call — execution is <span className="text-rose font-semibold">dumb and deterministic</span>{' '}
            on purpose. Retries are guaranteed (timeouts, restarts, at-least-once queues); the key is what makes them safe.
            Next layer: proving it happened.
          </>
        }
      />
    </>
  )

  const outro = (
    <>
      <p>
        Action execution is where the system finally <span className="text-rose font-semibold">does the irreversible thing</span> —
        and the whole craft is making that thing happen <span className="text-rose font-semibold">exactly once</span>.
      </p>
      <p>The non-negotiables of this layer:</p>
      <ul className="space-y-1">
        <li>• <span className="text-rose font-semibold">Idempotency keys</span> — so retries can’t double-charge</li>
        <li>• <span className="text-rose font-semibold">Tiny + deterministic</span> — no model in the loop, just the approved call</li>
        <li>• <span className="text-rose font-semibold">Irreversible by nature</span> — which is why every check sits upstream</li>
      </ul>
      <p className="pt-1">
        The money moved. Last question: how does anyone <em>know</em> what happened? Next is{' '}
        <Link to="/outcome" className="text-paper font-semibold underline underline-offset-2">outcome &amp; observability</Link>.
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
      noteLabel="↳ What makes execution safe to retry"
    />
  )
}
