/**
 * The Msanga logo: two friends (Friendship cyan and Reunion violet) meeting to form an M, with a smile under them.
 * The mark is the SVG rebuild of the logo (docs/brand/svg/msanga-mark.svg); the word "Msanga" is real text.
 * It uses the logo's own brighter cyan and violet: the mark is decoration (hidden from screen readers), so it is
 * exempt from the contrast rule; text and buttons keep the contrast-checked palette in styles.css.
 */
const BODY =
  'M287,705 V540 A154,154 0 0 1 548.9,431.1 L614.9,496.9 A14,14 0 0 1 619.0,506.8 L619.0,617.9 A22,22 0 0 1 581.4,633.4 L486.8,538.8 A28,28 0 0 0 439.0,558.6 V705 A76,76 0 0 1 287,705 Z'

/** `tone="onDark"`: for navy panels (white smile and word). */
export function Logo({ withTagline = false, tone = 'onLight' }: { withTagline?: boolean; tone?: 'onLight' | 'onDark' }) {
  const smile = tone === 'onDark' ? '#ffffff' : '#081b30'
  return (
    <span className={`logo logo-${tone}`}>
      <svg className="logo-mark" viewBox="272 167 708 646" aria-hidden="true" focusable="false">
        <circle cx="462" cy="278" r="95.5" fill="#00e0ff" />
        <path d={BODY} fill="#00e0ff" />
        <g transform="matrix(-1 0 0 1 1252 0)">
          <circle cx="462" cy="278" r="95.5" fill="#ae3ff7" />
          <path d={BODY} fill="#ae3ff7" />
        </g>
        <path d="M494.3,708.5 A174.5,174.5 0 0 0 757.7,708.5" stroke={smile} strokeWidth="59" fill="none" strokeLinecap="round" />
      </svg>
      <span className="logo-text">
        <span className="logo-word">Msanga</span>
        {withTagline && <span className="logo-tagline">My Sets Across Nations, Gathered Again</span>}
      </span>
    </span>
  )
}
