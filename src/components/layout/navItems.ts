import {
  Bell, CalendarDays, GraduationCap, House, Image, MessageCircle, Search, Settings, User, Users, UsersRound,
  type LucideIcon,
} from 'lucide-react'

/** A place in the app. Places not built yet show a "coming soon" page saying when (pages/comingSoon.ts). */
export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** A count shown as a badge, e.g. unread messages. */
  count?: number
  /** What the count means, for screen readers ("3 unread"). */
  countLabel?: string
}

/** The sidebar on wide screens. */
export const SIDEBAR_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', icon: House },
  { label: 'My Schools', href: '/schools', icon: GraduationCap },
  { label: 'My Sets', href: '/sets', icon: UsersRound },
  { label: 'Find Classmates', href: '/find', icon: Search },
  { label: 'Reunions & Events', href: '/events', icon: CalendarDays },
  { label: 'Memories', href: '/memories', icon: Image },
  { label: 'Groups', href: '/groups', icon: Users },
  { label: 'Messages', href: '/messages', icon: MessageCircle, count: 3, countLabel: 'unread' },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
]

/** The tab bar at the bottom on phones (five at most, each with a word under the icon). */
export const BOTTOM_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', icon: House },
  { label: 'People', href: '/find', icon: UsersRound },
  { label: 'Events', href: '/events', icon: CalendarDays },
  { label: 'Messages', href: '/messages', icon: MessageCircle, count: 3, countLabel: 'unread' },
  { label: 'Profile', href: '/profile', icon: User },
]

/** Is this menu item the page you're on? Home only on "/", the others also on their sub-pages (/sets/gcl-1998). */
export const isCurrent = (href: string, pathname: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
