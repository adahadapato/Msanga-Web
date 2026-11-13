/**
 * The Msanga logo: two friends (Friendship cyan and Reunion violet) meeting to form an M, with a smile under them.
 * A simplified stand-in until the SVG logo rebuild; the word "Msanga" is real text.
 */
export function Logo({ withTagline = false }: { withTagline?: boolean }) {
  return (
    <span className="logo">
      <svg className="logo-mark" viewBox="0 0 48 44" aria-hidden="true" focusable="false">
        <circle cx="14" cy="8" r="7" fill="#00c7e6" />
        <circle cx="34" cy="8" r="7" fill="#8e2de2" />
        <path d="M4 40 V24 Q4 17 11 17 Q16 17 20 22 L24 27 L24 40 Z" fill="#00c7e6" />
        <path d="M44 40 V24 Q44 17 37 17 Q32 17 28 22 L24 27 L24 40 Z" fill="#8e2de2" />
        <path d="M14 33 Q24 41 34 33" stroke="#081b30" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
      <span className="logo-text">
        <span className="logo-word">Msanga</span>
        {withTagline && <span className="logo-tagline">My Sets Across Nations, Gathered Again</span>}
      </span>
    </span>
  )
}
