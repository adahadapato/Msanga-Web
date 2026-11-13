import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { accessibilityProblems } from '../../test/axe'
import { renderApp, where } from '../../test/renderApp'

type User = ReturnType<typeof renderApp>['user']

async function signIn(user: User, email: string, password: string) {
  await screen.findByRole('heading', { level: 1, name: 'Sign in' })
  await user.type(screen.getByLabelText('Email address'), email)
  await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Sign in' }))
}

describe('Sign in (against the pretend API)', () => {
  it('shows Sign in to a signed-out visitor, with no accessibility problems', async () => {
    renderApp('/')
    expect(await screen.findByRole('heading', { level: 1, name: 'Sign in' })).toBeTruthy()
    expect(where.path).toBe('/sign-in')
    expect(document.title).toBe('Sign in – Msanga')
    expect(await accessibilityProblems()).toEqual([])
  })

  it('lists what is missing at the top, takes the focus there, and ties each message to its field', async () => {
    const { user } = renderApp('/sign-in')
    await screen.findByRole('heading', { level: 1, name: 'Sign in' })
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    const summary = await screen.findByRole('alert')
    expect(document.activeElement).toBe(summary)
    expect(within(summary).getAllByRole('link').map((a) => a.textContent)).toEqual(['Enter your email address', 'Enter your password'])
    const email = screen.getByLabelText('Email address')
    expect(email.getAttribute('aria-invalid')).toBe('true')
    expect(document.getElementById(email.getAttribute('aria-describedby')!)?.textContent).toContain('Enter your email address')
    expect(await accessibilityProblems()).toEqual([])
  })

  it("shows the API's message for a wrong password", async () => {
    const { user } = renderApp('/sign-in')
    await signIn(user, 'ada@example.com', 'not my password')
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('The email or password is not right'))
    expect(localStorage.getItem('msanga.refreshToken')).toBeNull()
  })

  it('signs in and greets the member by name on Home', async () => {
    const { user } = renderApp('/')
    await signIn(user, 'ada@example.com', 'my old school bell')
    expect(await screen.findByRole('heading', { level: 1, name: 'Welcome back, Ada!' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ada O., your account' })).toBeTruthy()
    expect(localStorage.getItem('msanga.refreshToken')).toBeTruthy()
  })

  it('takes you back to the page you wanted after signing in', async () => {
    const { user } = renderApp('/settings')
    await signIn(user, 'ada@example.com', 'my old school bell')
    expect(await screen.findByRole('heading', { level: 1, name: 'Settings' })).toBeTruthy()
    expect(where.path).toBe('/settings')
  })

  it('keeps a returning visitor signed in (no Sign in page)', async () => {
    renderApp('/', { signedIn: true })
    expect(await screen.findByRole('heading', { level: 1, name: 'Welcome back, Ada!' })).toBeTruthy()
  })

  it('takes a signed-in member from Sign in straight to Home', async () => {
    renderApp('/sign-in', { signedIn: true })
    expect(await screen.findByRole('heading', { level: 1, name: 'Welcome back, Ada!' })).toBeTruthy()
  })

  it('signs out from Settings: back to Sign in, and the token is gone from this browser and the API', async () => {
    const { user, api } = renderApp('/settings', { signedIn: true })
    await user.click(await screen.findByRole('button', { name: 'Sign out' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Sign in' })).toBeTruthy()
    expect(localStorage.getItem('msanga.refreshToken')).toBeNull()
    expect(api.calls).toContain('POST /api/auth/logout')
  })
})
