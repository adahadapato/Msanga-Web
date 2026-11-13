import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { accessibilityProblems } from '../../test/axe'
import { renderApp, where } from '../../test/renderApp'

type User = ReturnType<typeof renderApp>['user']

async function askForCode(user: User, email: string) {
  await screen.findByRole('heading', { level: 1, name: 'Reset your password' })
  await user.type(screen.getByLabelText('Email address'), email)
  await user.click(screen.getByRole('button', { name: 'Send me a code' }))
  await screen.findByRole('heading', { level: 1, name: 'Choose a new password' })
}

async function choose(user: User, code: string, password: string) {
  await user.clear(screen.getByLabelText('6-digit code'))
  await user.type(screen.getByLabelText('6-digit code'), code)
  await user.clear(screen.getByLabelText('New password'))
  await user.type(screen.getByLabelText('New password'), password)
  await user.click(screen.getByRole('button', { name: 'Save new password' }))
}

describe('Forgot and reset password with a code (against the pretend API)', () => {
  it('is reached from Sign in, with no accessibility problems', async () => {
    const { user } = renderApp('/sign-in')
    await user.click(await screen.findByRole('link', { name: 'Forgot your password?' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Reset your password' })).toBeTruthy()
    expect(await accessibilityProblems()).toEqual([])
  })

  it('goes all the way: code, new password, sign in with it (the old one no longer works)', async () => {
    const { user, api } = renderApp('/forgot-password')
    await askForCode(user, 'ada@example.com')
    expect(screen.getByText('ada@example.com')).toBeTruthy()
    expect(await accessibilityProblems()).toEqual([])

    await choose(user, api.sentCodes.at(-1)!.code, 'a brand new password')
    expect(await screen.findByText('Your password is changed. Sign in with the new one.')).toBeTruthy()
    expect(where.path).toBe('/sign-in')
    expect((screen.getByLabelText('Email address') as HTMLInputElement).value).toBe('ada@example.com')

    await user.type(screen.getByLabelText('Password'), 'my old school bell')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText(/The email or password is not right/)).toBeTruthy()

    await user.clear(screen.getByLabelText('Password'))
    await user.type(screen.getByLabelText('Password'), 'a brand new password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Welcome back, Ada!' })).toBeTruthy()
  })

  it('shows a wrong code on the code field, and keeps the page', async () => {
    const { user } = renderApp('/forgot-password')
    await askForCode(user, 'ada@example.com')
    await choose(user, '000000', 'a brand new password')
    expect(await screen.findAllByText(/That code isn't right or has expired/)).toHaveLength(2)
    expect(where.path).toBe('/reset-password')
  })

  it('checks the new password is long enough before asking the API', async () => {
    const { user, api } = renderApp('/forgot-password')
    await askForCode(user, 'ada@example.com')
    await choose(user, api.sentCodes.at(-1)!.code, 'short')
    expect(await screen.findAllByText('Your password must be at least 10 characters')).toHaveLength(2)
    expect(api.calls).not.toContain('POST /api/auth/reset-password')
  })

  it('looks the same for an email with no account (no way to find out who is on Msanga)', async () => {
    const { user, api } = renderApp('/forgot-password')
    await askForCode(user, 'nobody@example.com')
    expect(screen.getByText(/has a Msanga account, we've sent it a 6-digit code/)).toBeTruthy()
    expect(api.sentCodes).toHaveLength(0)
  })

  it('sends a new code on request', async () => {
    const { user, api } = renderApp('/forgot-password')
    await askForCode(user, 'ada@example.com')
    await user.click(screen.getByRole('button', { name: 'Send a new code' }))
    expect(await screen.findByText(/a new code is on its way/)).toBeTruthy()
    expect(api.sentCodes).toHaveLength(2)
  })
})
