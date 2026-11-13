import { Link } from 'react-router'
import { isCurrent, type NavItem } from './navItems'

/**
 * A list of navigation links. The current page is marked with aria-current="page" (screen readers say "current
 * page"), not by colour alone. A count badge is read as e.g. "Messages, 3 unread".
 */
export function NavLinks({ items, current, className }: { items: NavItem[]; current: string; className: string }) {
  return (
    <ul className={className}>
      {items.map(({ label, href, icon: Icon, count, countLabel }) => (
        <li key={label}>
          <Link to={href} aria-current={isCurrent(href, current) ? 'page' : undefined}>
            <Icon className="nav-icon" size={22} aria-hidden="true" />
            <span className="nav-label">{label}</span>
            {count ? (
              <span className="nav-count">
                <span aria-hidden="true">{count}</span>
                <span className="visually-hidden">, {count} {countLabel}</span>
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  )
}
