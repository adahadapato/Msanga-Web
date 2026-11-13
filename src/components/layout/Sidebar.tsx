import { scenes } from '../../mock/homeData'
import { NavLinks } from './NavLinks'
import { SIDEBAR_ITEMS } from './navItems'

/** Wide screens: the main menu down the left, with an evening scene and a short line at the bottom. */
export function Sidebar({ current }: { current: string }) {
  return (
    <nav className="sidebar" aria-label="Main">
      <NavLinks items={SIDEBAR_ITEMS} current={current} className="sidebar-links" />
      <div className="sidebar-art">
        <img className="sidebar-art-picture" src={scenes.evening} alt="" />
        <p className="sidebar-art-text">Bring your school family back together.</p>
      </div>
    </nav>
  )
}
