import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

/** Sets the browser tab's title, e.g. "Sign in – Msanga" (screen readers announce it; WCAG 2.4.2). */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} – Msanga`
  }, [title])
}

/**
 * After moving to another page inside the app, puts the focus on the new page's h1, the way a full page load
 * would start at the top: screen readers then read the new page's name, and Tab carries on from there.
 * Not on the very first load (the browser starts at the top already).
 */
export function useFocusOnNavigate() {
  const { pathname } = useLocation()
  const previous = useRef(pathname)

  useEffect(() => {
    if (previous.current === pathname) return
    previous.current = pathname
    // The new page is already on screen here (this runs after the page's own effects)
    const heading = document.querySelector<HTMLElement>('main h1')
    if (!heading) return
    heading.tabIndex = -1
    heading.focus()
  }, [pathname])
}
