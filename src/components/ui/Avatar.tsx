/** Soft background colours for initials, each checked with Midnight text (≥ 10:1). */
const COLOURS = ['#d9b3ff', '#b8f0f7', '#ffe1a8', '#c6f0d0', '#ffd0d6']

/** "Hilary A." → "HA". */
const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]!.toUpperCase()).join('')

/**
 * A member's picture: their photo, or their initials in a soft circle when they have none. Decorative: the name is
 * always written next to it, so screen readers skip it (alt="", aria-hidden).
 */
export function Avatar({ name, photo, size = 'md' }: { name: string; photo?: string | null; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  if (photo) return <img className={`avatar avatar-${size}`} src={photo} alt="" />

  const colour = COLOURS[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % COLOURS.length]
  return (
    <span className={`avatar avatar-${size}`} style={{ background: colour }} aria-hidden="true">
      {initials(name)}
    </span>
  )
}
