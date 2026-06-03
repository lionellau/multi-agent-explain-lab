import { Link } from 'react-router-dom'
import { CHAPTERS } from '../chapters'

export default function JourneyNav({ current }: { current: string }) {
  const i = CHAPTERS.findIndex((c) => c.path === current)
  if (i < 0) return null
  const prev = i > 0 ? CHAPTERS[i - 1] : null
  const next = i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : null

  return (
    <div className="hidden lg:block max-w-5xl mx-auto px-4 mt-12 mb-8">
      <div className="flex gap-3 justify-between items-stretch">
        {prev ? (
          <Link
            to={prev.path}
            className="group flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all"
          >
            <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
            <div className="text-left min-w-0">
              <p className="text-xs text-paper/40">Previous</p>
              <p className={`font-semibold truncate ${prev.accent}`}>{prev.emoji} {prev.title}</p>
            </div>
          </Link>
        ) : <div className="flex-1" />}

        {next ? (
          <Link
            to={next.path}
            className="group flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-grape/10 hover:bg-grape/20 border border-grape-soft/30 hover:border-grape-soft transition-all justify-end"
          >
            <div className="text-right min-w-0">
              <p className="text-xs text-paper/40">Next up</p>
              <p className={`font-semibold truncate ${next.accent}`}>{next.emoji} {next.title}</p>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        ) : <div className="flex-1" />}
      </div>

      <div className="mt-5 flex gap-1.5 justify-center">
        {CHAPTERS.map((c, idx) => (
          <Link
            key={c.path}
            to={c.path}
            title={c.title}
            className={`h-1.5 rounded-full transition-all ${
              idx === i ? `w-8 ${c.accent.replace('text-', 'bg-')}` :
              idx < i  ? 'w-3 bg-white/30 hover:bg-white/50' :
                         'w-3 bg-white/10 hover:bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
