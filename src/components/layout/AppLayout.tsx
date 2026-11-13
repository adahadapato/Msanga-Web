import { Outlet, useLocation } from 'react-router'
import { member } from '../../mock/homeData'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

/**
 * The app frame: skip link, top bar, sidebar (wide screens) or bottom tabs (phones), and the page (Outlet).
 * Accessibility: "Skip to the main content" first; landmarks (banner, navigation, main); one h1 per page; the
 * current page marked with aria-current, not colour alone.
 * Until sign-in (W2–W4), the member and the counts are the mock-up's made-up ones.
 */
export function AppLayout() {
  const { pathname } = useLocation()

  return (
    <div className="app">
      <a className="skip-link" href="#main">Skip to the main content</a>
      <TopBar member={member} newNotifications={1} unreadMessages={3} />
      <div className="app-body">
        <Sidebar current={pathname} />
        <main id="main" tabIndex={-1} className="app-main">
          <Outlet />
        </main>
      </div>
      <BottomNav current={pathname} />
    </div>
  )
}
