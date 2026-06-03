import { useCallback, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CHAPTERS, type Chapter } from '../chapters'
import StorySteps, { type Beat } from './StorySteps'
import JourneyNav from './JourneyNav'

interface Props {
  chapter: Chapter
  beats: Beat[]
  onStep: (i: number) => void
  watch: ReactNode
  extras?: ReactNode
  outro?: ReactNode
  noteLabel?: string
  intro?: ReactNode
}

export default function ChapterShell({ chapter, beats, onStep, watch, extras, outro, noteLabel, intro }: Props) {
  const idx = CHAPTERS.findIndex((c) => c.path === chapter.path)
  const next = idx >= 0 && idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null

  // Mirror StorySteps' internal step so the next-chapter chip can react to
  // "you're on the last beat now" without changing the chapter pages' API.
  const [localStep, setLocalStep] = useState(0)
  const handleStep = useCallback(
    (i: number) => {
      setLocalStep(i)
      onStep(i)
    },
    [onStep]
  )
  const isLastBeat = localStep === beats.length - 1

  const outroBlock = outro ? (
    <div className="mt-4 rounded-2xl border border-white/10 bg-ink-soft p-4">
      <p className="text-[11px] uppercase tracking-widest text-paper/45 mb-2">In plain English</p>
      <div className="text-sm text-paper/85 leading-relaxed space-y-2">{outro}</div>
    </div>
  ) : null

  // Quiet next-chapter chip. Lights up on the last beat.
  const nextChip = next ? (
    <Link
      to={next.path}
      title={`Next chapter: ${next.title} — ${next.tagline}`}
      className={[
        'group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-soft/80 border-2 transition-all backdrop-blur shrink-0 self-start',
        next.accentBorder,
        isLastBeat ? 'glow-ring scale-[1.04]' : 'opacity-75 hover:opacity-100 hover:scale-[1.02]',
      ].join(' ')}
    >
      <span className="text-[9px] uppercase tracking-widest text-paper/55">Next</span>
      <span className="text-base leading-none">{next.emoji}</span>
      <span className={`text-xs font-bold truncate max-w-[180px] ${next.accent}`}>
        {next.title}
      </span>
      <span className={`${next.accent} group-hover:translate-x-0.5 transition-transform`}>→</span>
    </Link>
  ) : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 lg:py-10 pb-[280px] lg:pb-10">
      <header className="mb-5 lg:mb-7 flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-mono ${chapter.accent}`}>{chapter.n}</span>
            <span className="text-paper/30">·</span>
            <span className="text-xs uppercase tracking-widest text-paper/50">Multi-Agent Lab</span>
            {chapter.layer && (
              <span
                className={`ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${chapter.accentBorder} ${chapter.accentBg} text-[10px] font-semibold ${chapter.accent}`}
                title="One layer of the reference blueprint. Each layer chapter zooms into a single horizontal band of the full system diagram."
              >
                🧱 {chapter.layer}
              </span>
            )}
          </div>
          <h1 className={`text-3xl md:text-4xl font-bold leading-tight ${chapter.accent}`}>
            <span className="mr-2">{chapter.emoji}</span>
            {chapter.title}
          </h1>
          <p className="mt-2 text-paper/70 text-base md:text-lg">{chapter.tagline}</p>
        </div>
        {nextChip}
      </header>

      {intro}

      <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
        <section className="min-w-0">
          <div className="rounded-2xl border border-white/10 bg-ink-soft p-4 md:p-6">
            {watch}
          </div>
          {extras}
          {/* Outro lives in the main flow on mobile so the sticky panel stays small */}
          <div className="lg:hidden">{outroBlock}</div>
        </section>

        <aside className="lg:sticky lg:top-20 self-start fixed lg:relative bottom-0 left-0 right-0 z-30 lg:z-auto bg-ink-soft lg:bg-transparent border-t-2 lg:border-t-0 border-white/10 lg:border-0 p-4 lg:p-0 max-h-[55vh] lg:max-h-none overflow-y-auto lg:overflow-visible shadow-[0_-12px_32px_-12px_rgba(0,0,0,0.6)] lg:shadow-none">
          <StorySteps
            beats={beats}
            onStep={handleStep}
            accent={chapter.accent}
            accentBorder={chapter.accentBorder}
            accentBg={chapter.accentBg}
            noteLabel={noteLabel}
          />
          {/* Outro on desktop only — lives in main flow on mobile */}
          <div className="hidden lg:block">{outroBlock}</div>
        </aside>
      </div>

      <JourneyNav current={chapter.path} />
    </div>
  )
}
