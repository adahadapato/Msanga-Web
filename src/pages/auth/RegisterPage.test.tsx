import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { accessibilityProblems } from '../../test/axe'
import { renderApp, where } from '../../test/renderApp'

type User = ReturnType<typeof renderApp>['user']

async function createAccount(user: User, { first = 'Bola', last = 'Eze', email = 'bola@example.com', password = 'my old school bell' } = {}) {
  await screen.findByRole('heading', { level: 1, name: 'Create your account' })
  if (first) await user.type(screen.getByLabelText('First name'), first)
  if (last) await user.type(screen.getByLabelText('Last name'), last)
  if (email) await user.type(screen.getByLabelText('Email address'), email)
  if (password) await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Create account' }))
}

async function typeCode(user: User, code: string) {
  const field = screen.getByLabelText('6-digit code')
  await user.clear(field)
  await user.type(field, code)
  await user.click(screen.getByRole('button', { name: 'Confirm my email' }))
}

describe('Create account and the 6-digit code (against the pretend API)', () => {
  it('lists every problem at the top and ties each message to its field, with no accessibility problems', async () => {
    const { user } = renderApp('/register')
    await createAccount(user, { first: '', last: '', email: '', password: '' })

    const summary = await screen.findByRole('alert')
    expect(document.activeElement).toBe(summary)
    expect(within(summary).getAllByRole('link').map((a) => a.textContent)).toEqual([
      'Enter your first name', 'Enter your last name', 'Enter your email address', 'Choose a password',
    ])
    expect(screen.getByText('(optional)')).toBeTruthy()
    expect(await accessibilityProblems()).toEqual([])
  })

  it('goes all the way: create, wrong code, right code, sign in, Home', async () => {
    const { user, api } = renderApp('/register')
    await createAccount(user)

    expect(await screen.findByRole('heading', { level: 1, name: 'Check your email' })).toBeTruthy()
    expect(screen.getByText('bola@example.com')).toBeTruthy()
    const code = screen.getByLabelText('6-digit code')
    expect(code.getAttribute('inputmode')).toBe('numeric')
    expect(code.getAttribute('autocomplete')).toBe('one-time-code')
    expect(await accessibilityProblems()).toEqual([])

    await typeCode(user, '000000')
    expect(await screen.findAllByText(/That code isn't right or has expired/)).toHaveLength(2)

    const sent = api.sentCodes.at(-1)!.code
    await typeCode(user, `${sent.slice(0, 3)} ${sent.slice(3)}`)     // with a space, as written in the email

    expect(await screen.findByText('Your email is confirmed. Sign in to start.')).toBeTruthy()
    expect(where.path).toBe('/sign-in')
    expect((screen.getByLabelText('Email address') as HTMLInputElement).value).toBe('bola@example.com')

    await user.type(screen.getByLabelText('Password'), 'my old school bell')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Welcome back, Bola!' })).toBeTruthy()
  })

  it('checks the code looks like 6 digits before asking the API', async () => {
    const { user, api } = renderApp('/register')
    await createAccount(user)
    await screen.findByRole('heading', { level: 1, name: 'Check your email' })
    await typeCode(user, '12a')
    expect(await screen.findAllByText('The code is 6 digits, like 482 913')).toHaveLength(2)
    expect(api.calls).not.toContain('POST /api/auth/confirm-email')
  })

  it('sends a new code on request, and the newest code works', async () => {
    const { user, api } = renderApp('/register')
    await createAccount(user)
    await screen.findByRole('heading', { level: 1, name: 'Check your email' })

    await user.click(screen.getByRole('button', { name: 'Send a new code' }))
    expect(await screen.findByText(/We've sent a new code to bola@example.com/)).toBeTruthy()
    expect(api.sentCodes).toHaveLength(2)

    await typeCode(user, api.sentCodes[1].code)
    expect(await screen.findByText('Your email is confirmed. Sign in to start.')).toBeTruthy()
  })

  it('answers the same for an email that already has an account (no way to find out who is on Msanga)', async () => {
    const { user } = renderApp('/register')
    await createAccount(user, { email: 'ada@example.com' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Check your email' })).toBeTruthy()
  })

  it('from Sign in, an unconfirmed account is offered the way to enter its code', async () => {
    const { user, api } = renderApp('/register')
    await createAccount(user)
    await screen.findByRole('heading', { level: 1, name: 'Check your email' })
    await user.click(screen.getByRole('link', { name: 'Sign in' }))

    await screen.findByRole('heading', { level: 1, name: 'Sign in' })
    await user.type(screen.getByLabelText('Email address'), 'bola@example.com')
    await user.type(screen.getByLabelText('Password'), 'my old school bell')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Please confirm your email first'))

    await user.click(screen.getByRole('link', { name: 'Enter the code from your email' }))
    expect(await screen.findByText('bola@example.com')).toBeTruthy()
    await typeCode(user, api.sentCodes.at(-1)!.code)
    expect(await screen.findByText('Your email is confirmed. Sign in to start.')).toBeTruthy()
  })

  it('opened on its own, Check your email asks for the email too', async () => {
    renderApp('/check-email')
    await screen.findByRole('heading', { level: 1, name: 'Check your email' })
    expect(screen.getByLabelText('Email address')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Send a new code' })).toBeNull()
  })
})
