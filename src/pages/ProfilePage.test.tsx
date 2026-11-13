import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { accessibilityProblems } from '../test/axe'
import { renderApp, where } from '../test/renderApp'

describe('Your profile and Edit profile (against the pretend API)', () => {
  it('shows your name, a line about you and your account, and no popularity counts', async () => {
    renderApp('/profile', { signedIn: true })
    const heading = await screen.findByRole('heading', { level: 1, name: 'Ada Okon' })
    expect(screen.getByText("You haven't written about yourself yet.")).toBeTruthy()
    expect(screen.getByText('ada@example.com')).toBeTruthy()
    // Msanga's promise: no counts of connections / followers / friends / groups / events about the person
    expect(heading.closest('section')!.textContent).not.toMatch(/\d+\s*(connections|followers|friends|groups|events)/i)
    expect(await accessibilityProblems()).toEqual([])
  })

  it('saves changes through the API, says so, and the new name shows everywhere at once', async () => {
    const { user, api } = renderApp('/profile/edit', { signedIn: true })
    await screen.findByRole('heading', { level: 1, name: 'Edit your profile' })
    expect(await accessibilityProblems()).toEqual([])

    await user.clear(screen.getByLabelText('First name'))
    await user.type(screen.getByLabelText('First name'), 'Adaeze')
    await user.type(screen.getByLabelText(/Surname at school/), 'Bassey')
    await user.type(screen.getByLabelText(/About you/), 'Physics Club, 1998.')
    await user.click(screen.getByRole('button', { name: 'Save profile' }))

    expect(await screen.findByText('Your profile is saved.')).toBeTruthy()
    expect(where.path).toBe('/profile')
    expect(screen.getByRole('heading', { level: 1, name: 'Adaeze Okon' })).toBeTruthy()
    expect(screen.getByText('Physics Club, 1998.')).toBeTruthy()
    expect(screen.getByText(/at school: Adaeze Bassey/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Adaeze O., your account' })).toBeTruthy()   // the top bar too
    expect(api.calls).toContain('PUT /api/me')
  })

  it('needs a first and a last name', async () => {
    const { user, api } = renderApp('/profile/edit', { signedIn: true })
    await user.clear(await screen.findByLabelText('First name'))
    await user.click(screen.getByRole('button', { name: 'Save profile' }))
    expect((await screen.findByRole('alert')).textContent).toContain('Enter your first name')
    expect(api.calls).not.toContain('PUT /api/me')
  })
})

describe('Account menu (top bar)', () => {
  it('opens and closes with the keyboard, saying whether it is open', async () => {
    const { user } = renderApp('/', { signedIn: true })
    const button = await screen.findByRole('button', { name: 'Ada O., your account' })
    expect(button.getAttribute('aria-expanded')).toBe('false')

    await user.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('link', { name: 'Your profile' })).toBeTruthy()
    expect(await accessibilityProblems()).toEqual([])

    await user.keyboard('{Escape}')
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(button)
  })

  it('goes to your profile', async () => {
    const { user } = renderApp('/', { signedIn: true })
    await user.click(await screen.findByRole('button', { name: 'Ada O., your account' }))
    await user.click(screen.getByRole('link', { name: 'Your profile' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Ada Okon' })).toBeTruthy()
  })

  it('signs you out', async () => {
    const { user, api } = renderApp('/', { signedIn: true })
    await user.click(await screen.findByRole('button', { name: 'Ada O., your account' }))
    const list = screen.getByRole('link', { name: 'Your profile' }).closest('ul')!
    await user.click(within(list).getByRole('button', { name: 'Sign out' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Sign in' })).toBeTruthy()
    expect(api.calls).toContain('POST /api/auth/logout')
  })
})
