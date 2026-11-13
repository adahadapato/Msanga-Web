import { Outlet, Route, Routes } from 'react-router'
import { AppLayout } from './components/layout/AppLayout'
import { useFocusOnNavigate } from './components/layout/page'
import { COMING_SOON } from './pages/comingSoon'
import { HomePage } from './pages/HomePage'
import { ComingSoonPage, NotFoundPage, SettingsPage } from './pages/OtherPages'

/**
 * Every page in one place (React Router). W1: the app frame with Home, Settings and a "coming soon" page for every
 * menu place that isn't built yet. Sign-in and the account pages come in W2–W6; until then Home shows the mock-up's
 * made-up member (src/mock/homeData.ts).
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Root />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {COMING_SOON.map(({ path, title, when }) => (
            <Route key={path} path={path} element={<ComingSoonPage title={title} when={when} />} />
          ))}
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

/** Wraps every page: after moving to another page, the focus goes to its h1. */
function Root() {
  useFocusOnNavigate()
  return <Outlet />
}
