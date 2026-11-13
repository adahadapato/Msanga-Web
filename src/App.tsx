import { Outlet, Route, Routes } from 'react-router'
import { useSessionEndedHandler } from './auth/useSession'
import { AuthLayout } from './components/auth/AuthLayout'
import { RedirectIfMember, RequireMember } from './components/auth/RouteGuards'
import { AppLayout } from './components/layout/AppLayout'
import { useFocusOnNavigate } from './components/layout/page'
import { CheckEmailPage } from './pages/auth/CheckEmailPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { SignInPage } from './pages/auth/SignInPage'
import { COMING_SOON, COMING_SOON_SIGNED_OUT } from './pages/comingSoon'
import { HomePage } from './pages/HomePage'
import { ComingSoonPage, NotFoundPage, SettingsPage } from './pages/OtherPages'

/**
 * Every page in one place (React Router).
 * - Signed out: Sign in, Create account and Check your email (the 6-digit code), and "coming soon" for Forgot
 *   password (W4), in the account frame.
 * - Signed in: the app frame with Home, Settings and a "coming soon" page for every menu place not built yet.
 * Signed out and asking for a signed-in page: Sign in, then back to that page.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Root />}>
        <Route element={<RedirectIfMember />}>
          <Route element={<AuthLayout />}>
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/check-email" element={<CheckEmailPage />} />
            {COMING_SOON_SIGNED_OUT.map(({ path, title, when }) => (
              <Route key={path} path={path}
                     element={<ComingSoonPage title={title} when={when} back={{ to: '/sign-in', label: 'Back to sign in' }} />} />
            ))}
          </Route>
        </Route>

        <Route element={<RequireMember />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {COMING_SOON.map(({ path, title, when }) => (
              <Route key={path} path={path} element={<ComingSoonPage title={title} when={when} />} />
            ))}
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

/** Wraps every page: after moving to another page, the focus goes to its h1; a session that ends shows Sign in. */
function Root() {
  useFocusOnNavigate()
  useSessionEndedHandler()
  return <Outlet />
}
