import { Construction } from 'lucide-react'
import { Link } from 'react-router'
import { useMember, useSignOut } from '../auth/useSession'
import { ConnectionCheck } from '../components/ConnectionCheck'
import { usePageTitle } from '../components/layout/page'

/** A place that isn't built yet: its name, when it comes, and the way back (Home, or Sign in when signed out). */
export function ComingSoonPage({ title, when, back = { to: '/', label: 'Back to Home' } }: {
  title: string
  when: string
  back?: { to: string; label: string } | undefined
}) {
  usePageTitle(title)
  return (
    <section className="panel coming-soon" aria-labelledby="coming-soon-title">
      <Construction size={40} aria-hidden="true" />
      <h1 id="coming-soon-title">{title}</h1>
      <p>This part of Msanga is coming {when}.</p>
      <Link to={back.to} className="button button-soft">{back.label}</Link>
    </section>
  )
}

/** Settings: who you're signed in as, Sign out, and the check that the web app can reach the API. */
export function SettingsPage() {
  usePageTitle('Settings')
  const member = useMember()
  const signOut = useSignOut()
  return (
    <div className="settings">
      <section className="panel" aria-labelledby="settings-title">
        <h1 id="settings-title">Settings</h1>
        <p>Signed in as <strong>{member.displayName}</strong> ({member.email}).</p>
        <p>
          <button
            type="button"
            className="button button-soft"
            aria-disabled={signOut.isPending}
            onClick={() => !signOut.isPending && signOut.mutate()}
          >
            Sign out
          </button>
        </p>
        <p className="muted">Changing your password, privacy choices and deleting your account come later.</p>
      </section>
      <ConnectionCheck />
    </div>
  )
}

/** An address that doesn't exist. */
export function NotFoundPage() {
  usePageTitle('Page not found')
  return (
    <main id="main" tabIndex={-1} className="not-found">
      <h1>Page not found</h1>
      <p>We couldn't find that page. If you typed the address, check it's right.</p>
      <Link to="/" className="button">Go to Msanga</Link>
    </main>
  )
}
