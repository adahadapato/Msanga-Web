import { NavLinks } from './NavLinks'
import { BOTTOM_ITEMS } from './navItems'

/** Phones: the five main places as a tab bar at the bottom of the screen. */
export function BottomNav({ current }: { current: string }) {
  return (
    <nav className="bottom-nav" aria-label="Main (phone)">
      <NavLinks items={BOTTOM_ITEMS} current={current} className="bottom-nav-links" />
    </nav>
  )
}
