import { Link, Outlet } from 'react-router'
import { scenes } from '../../mock/homeData'
import { Logo } from '../ui/Logo'

/**
 * The frame for the account pages (Sign in now; Create account and the password pages in W3–W4). Wide screens: a
 * navy brand panel on the left (logo, a short line, the evening scene) and the form on the right. Phones: the logo
 * on a navy strip above the form. The page's h1 is in the form.
 */
export function AuthLayout() {
  return (
    <div className="auth">
      <a className="skip-link" href="#main">Skip to the main content</a>
      <header className="auth-brand">
        <Link to="/sign-in" className="auth-brand-home">
          <Logo tone="onDark" withTagline />
          <span className="visually-hidden">, sign in</span>
        </Link>
        <p className="auth-brand-line">Bring your school family back together.</p>
        <img className="auth-brand-picture" src={scenes.evening} alt="" />
      </header>
      <main id="main" tabIndex={-1} className="auth-main">
        <div className="auth-card">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
