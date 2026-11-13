import { BottomNav } from './components/layout/BottomNav'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { member } from './mock/homeData'
import { HomePage } from './pages/HomePage'

/**
 * The app frame: skip link, top bar, sidebar (wide screens) or bottom tabs (phones), and the page. Only Home exists
 * so far (a mock-up with made-up data); the other menu addresses are placeholders for the pages to come.
 *
 * Accessibility: "Skip to the main content" first; landmarks (banner, navigation, main); one h1 per page; the
 * current page marked with aria-current, not colour alone.
 */
export default function App() {
  const current = window.location.pathname

  return (
    <div className="app">
      <a className="skip-link" href="#main">Skip to the main content</a>
      <TopBar member={member} newNotifications={1} unreadMessages={3} />
      <div className="app-body">
        <Sidebar current={current} />
        <main id="main" tabIndex={-1} className="app-main">
          <HomePage />
        </main>
      </div>
      <BottomNav current={current} />
    </div>
  )
}
