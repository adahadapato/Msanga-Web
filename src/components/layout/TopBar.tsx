import { Link } from 'react-router'
import { Bell, MessageCircle, Search } from 'lucide-react'
import { useId } from 'react'
import type { Member } from '../../api/auth'
import { Logo } from '../ui/Logo'
import { AccountMenu } from './AccountMenu'

/**
 * The bar across the top: logo, search (your sets, schools and classes only, never all members), notifications,
 * messages and your account. On phones only the logo and notifications stay.
 */
export function TopBar({ member, newNotifications, unreadMessages }: {
  member: Member
  newNotifications: number
  unreadMessages: number
}) {
  const searchId = useId()

  return (
    <header className="top-bar">
      <Link to="/" className="top-bar-home">
        <Logo withTagline />
        <span className="visually-hidden">, home</span>
      </Link>

      <form className="top-bar-search" role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor={searchId} className="visually-hidden">Search your sets, schools and classes</label>
        <Search className="top-bar-search-icon" size={20} aria-hidden="true" />
        <input id={searchId} type="search" placeholder="Search your sets, schools and classes" />
      </form>

      <div className="top-bar-actions">
        <Link to="/notifications" className="icon-button">
          <Bell size={22} aria-hidden="true" />
          {newNotifications > 0 && <span className="icon-button-dot" aria-hidden="true" />}
          <span className="visually-hidden">Notifications{newNotifications > 0 ? `, ${newNotifications} new` : ''}</span>
        </Link>
        <Link to="/messages" className="icon-button top-bar-wide-only">
          <MessageCircle size={22} aria-hidden="true" />
          {unreadMessages > 0 && <span className="icon-button-dot" aria-hidden="true" />}
          <span className="visually-hidden">Messages{unreadMessages > 0 ? `, ${unreadMessages} unread` : ''}</span>
        </Link>
        <AccountMenu member={member} />
      </div>
    </header>
  )
}
