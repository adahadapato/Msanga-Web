import { Construction } from 'lucide-react'
import { Link } from 'react-router'
import { ConnectionCheck } from '../components/ConnectionCheck'
import { usePageTitle } from '../components/layout/page'

/** A menu place that isn't built yet: its name, when it comes, and the way back. */
export function ComingSoonPage({ title, when }: { title: string; when: string }) {
  usePageTitle(title)
  return (
    <section className="panel coming-soon" aria-labelledby="coming-soon-title">
      <Construction size={40} aria-hidden="true" />
      <h1 id="coming-soon-title">{title}</h1>
      <p>This part of Msanga is coming {when}.</p>
      <Link to="/" className="button button-soft">Back to Home</Link>
    </section>
  )
}

/** Settings: for now, the check that the web app can reach the API (moved here from Home). */
export function SettingsPage() {
  usePageTitle('Settings')
  return (
    <div className="settings">
      <section className="panel" aria-labelledby="settings-title">
        <h1 id="settings-title">Settings</h1>
        <p>Your account settings (password, privacy, deleting your account) come with accounts and the privacy
          milestone.</p>
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
