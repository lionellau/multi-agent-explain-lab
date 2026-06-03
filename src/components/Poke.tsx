/* Discoverability affordance.
 *
 * Several chapters hide their best interaction in the left "watch" panel —
 * sliders, knobs, a trace scrubber — that don't obviously look clickable.
 * PokeHint is a small pulsing pill that announces "this is interactive" and
 * fades out the moment the user touches the control. pokeRing drops the same
 * grape glow onto the control itself.
 *
 * Grape-soft is the lab's "featured neutral" in the colour legend, so this
 * cue never collides with a knob colour (sky / mint / sun) or a pain marker
 * (coral). Everything here is disabled under prefers-reduced-motion, but the
 * label text still shows, so the hint survives without motion.
 */

export function PokeHint({
  show,
  label,
  className = '',
}: {
  show: boolean
  label: string
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={[
        'inline-flex items-center gap-1 rounded-full border border-grape-soft/50',
        'bg-grape/15 px-2 py-0.5 text-[10px] font-semibold text-grape-soft whitespace-nowrap',
        'transition-opacity duration-300',
        show ? 'anim-pulse-glow opacity-100' : 'opacity-0 pointer-events-none',
        className,
      ].join(' ')}
    >
      {label}
    </span>
  )
}

/** Ring class to add to a control while it is still untouched. */
export function pokeRing(show: boolean): string {
  return show ? 'anim-pulse-glow' : ''
}
