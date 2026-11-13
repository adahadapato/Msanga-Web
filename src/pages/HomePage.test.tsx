import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

/** The mock-up's promises: one h1, clear link names, the current page marked, no personal counts. */
describe('Home (mock-up)', () => {
  beforeEach(() => {
    // The connection check asks the API; here it never answers
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    render(<App />)
  })

  afterEach(() => vi.unstubAllGlobals())

  it('has exactly one h1: the welcome', () => {
    const h1s = screen.getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0].textContent).toBe('Welcome back to Msanga!')
  })

  it('names every Open link after its set, not just "Open"', () => {
    expect(screen.getByRole('link', { name: 'Open Government College, Lagos, Class of 1998' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Open University of Benin, Alumni Network' })).toBeTruthy()
  })

  it('names every "See all" link after its section', () => {
    for (const name of ['See all school sets', 'See all memories', 'See all reunions and events']) {
      expect(screen.getByRole('link', { name })).toBeTruthy()
    }
  })

  it('says "Going" in words, and names Join / Register after the event', () => {
    expect(screen.getByText('Going')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Join University Alumni Meet' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Register for Msanga Global Reunion' })).toBeTruthy()
  })

  it('marks Home as the current page in both menus', () => {
    for (const nav of [screen.getByRole('navigation', { name: 'Main' }), screen.getByRole('navigation', { name: 'Main (phone)' })]) {
      expect(within(nav).getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBe('page')
    }
  })

  it('reads the unread count with its meaning ("Messages, 3 unread")', () => {
    const main = screen.getByRole('navigation', { name: 'Main' })
    expect(within(main).getByRole('link', { name: 'Messages, 3 unread' })).toBeTruthy()
  })

  it('shows no follower or connection counts on the profile card (Msanga promise)', () => {
    const card = screen.getByRole('heading', { name: 'Hilary A.' }).closest('section')!
    expect(card.textContent).not.toMatch(/connections|followers/i)
  })

  it('labels the search box and keeps it to your sets, schools and classes', () => {
    expect(screen.getByRole('searchbox', { name: 'Search your sets, schools and classes' })).toBeTruthy()
  })
})
