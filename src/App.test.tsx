import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { accessibilityProblems } from './test/axe'
import { renderApp, where } from './test/renderApp'

describe('Msanga app: the frame and the way between pages', () => {
  it('starts every page with a skip link to the main content', async () => {
    renderApp('/', { signedIn: true })
    await screen.findByRole('heading', { level: 1, name: 'Welcome back, Ada!' })
    const first = screen.getAllByRole('link')[0]
    expect(first.textContent).toBe('Skip to the main content')
    expect(first.getAttribute('href')).toBe('#main')
    expect(document.getElementById('main')?.tagName).toBe('MAIN')
  })

  it("moves to another page without reloading, marks it current and puts the focus on its heading", async () => {
    const { user } = renderApp('/', { signedIn: true })
    const menu = await screen.findByRole('navigation', { name: 'Main' })
    await user.click(within(menu).getByRole('link', { name: 'Memories' }))

    const heading = await screen.findByRole('heading', { level: 1, name: 'Memories' })
    expect(where.path).toBe('/memories')
    expect(document.activeElement).toBe(heading)
    expect(within(menu).getByRole('link', { name: 'Memories' }).getAttribute('aria-current')).toBe('page')
    expect(document.title).toBe('Memories – Msanga')
  })

  it('says "coming soon" (and when) for places that come later, with no accessibility problems', async () => {
    renderApp('/messages', { signedIn: true })
    expect(await screen.findByRole('heading', { level: 1, name: 'Messages' })).toBeTruthy()
    expect(screen.getByText(/coming with messaging/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Back to Home' })).toBeTruthy()
    expect(await accessibilityProblems()).toEqual([])
  })

  it('marks a menu item current on its sub-pages too (/sets/gcl-1998 → My Sets)', async () => {
    renderApp('/sets/gcl-1998', { signedIn: true })
    const menu = await screen.findByRole('navigation', { name: 'Main' })
    expect(within(menu).getByRole('link', { name: 'My Sets' }).getAttribute('aria-current')).toBe('page')
    expect(within(menu).getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBeNull()
  })

  it('has the connection check on Settings', async () => {
    renderApp('/settings', { signedIn: true })
    expect(await screen.findByRole('heading', { level: 1, name: 'Settings' })).toBeTruthy()
    const settings = screen.getByRole('heading', { level: 1, name: 'Settings' }).closest('section')!
    expect(within(settings).getByText('Ada O.')).toBeTruthy()
    expect(await screen.findByText('Mme nsanga!')).toBeTruthy()
    expect(await accessibilityProblems()).toEqual([])
  })

  it('has a clear page for addresses that do not exist', () => {
    renderApp('/no-such-page')
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy()
    expect(document.title).toBe('Page not found – Msanga')
  })
})
