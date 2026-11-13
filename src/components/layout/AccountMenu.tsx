import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import type { Member } from '../../api/auth'
import { useSignOut } from '../../auth/useSession'
import { Avatar } from '../ui/Avatar'

/**
 * The account button in the top bar (photo, name, ▾) and its little list: Your profile, Settings, Sign out.
 * A simple show/hide list (aria-expanded), not an ARIA "menu": Tab moves through it, Esc closes it and returns to
 * the button, and clicking anywhere else closes it. Signing out shows Sign in (the route guard does that).
 */
export function AccountMenu({ member }: { member: Member }) {
  const [open, setOpen] = useState(false)
  const wrapper = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const listId = useId()
  const signOut = useSignOut()

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    const onFocus = (e: FocusEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocus)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('focusin', onFocus)
    }
  }, [open])

  return (
    <div className="account-menu top-bar-wide-only" ref={wrapper}>
      <button
        ref={button}
        type="button"
        className="top-bar-account"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar name={member.displayName} photo={member.photo} size="sm" />
        <span>{member.displayName}</span>
        <ChevronDown size={18} aria-hidden="true" />
        <span className="visually-hidden">, your account</span>
      </button>
      <ul id={listId} className="account-menu-list" hidden={!open}>
        <li>
          <Link to="/profile" onClick={() => setOpen(false)}><User size={18} aria-hidden="true" /> Your profile</Link>
        </li>
        <li>
          <Link to="/settings" onClick={() => setOpen(false)}><Settings size={18} aria-hidden="true" /> Settings</Link>
        </li>
        <li>
          <button
            type="button"
            aria-disabled={signOut.isPending}
            onClick={() => !signOut.isPending && signOut.mutate()}
          >
            <LogOut size={18} aria-hidden="true" /> Sign out
          </button>
        </li>
      </ul>
    </div>
  )
}
