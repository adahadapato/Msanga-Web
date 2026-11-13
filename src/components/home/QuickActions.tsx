import { Link } from 'react-router'
import { CalendarPlus, GraduationCap, Image, Users, UsersRound, type LucideIcon } from 'lucide-react'

interface QuickAction {
  label: string
  href: string
  icon: LucideIcon
  /** The tile's soft background (Midnight text on each is ≥ 15:1). */
  tone: 'aqua' | 'lilac' | 'cream' | 'sky' | 'mint'
  /** Hidden on phones (four tiles fit there, as in the phone mock-up; My Sets is right below anyway). */
  wideOnly?: boolean
}

const ACTIONS: QuickAction[] = [
  { label: 'Find Classmates', href: '/find', icon: UsersRound, tone: 'aqua' },
  { label: 'Create Reunion', href: '/events/new', icon: CalendarPlus, tone: 'lilac' },
  { label: 'Share Memories', href: '/memories/new', icon: Image, tone: 'cream' },
  { label: 'My School Sets', href: '/sets', icon: GraduationCap, tone: 'sky', wideOnly: true },
  { label: 'My Groups', href: '/groups', icon: Users, tone: 'mint' },
]

/** Big tiles for the five most common things to do: a word under every icon, large enough to tap. */
export function QuickActions() {
  return (
    <nav className="quick-actions" aria-label="Quick actions">
      <ul>
        {ACTIONS.map(({ label, href, icon: Icon, tone, wideOnly }) => (
          <li key={label} className={wideOnly ? 'wide-only' : undefined}>
            <Link to={href} className={`quick-action quick-action-${tone}`}>
              <Icon size={30} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
