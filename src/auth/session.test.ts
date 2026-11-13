import { describe, expect, it, vi } from 'vitest'
import { installFakeApi } from '../test/fakeApi'
import { authorizedFetch, onSignedOut, refreshSession, signIn, signOut } from './session'

const STORED = 'msanga.refreshToken'

/** The session keeper (auth/session.ts), against the pretend API. */
describe('Sign-in session', () => {
  it('keeps the refresh token in this browser after signing in, and forgets it on sign out', async () => {
    const api = installFakeApi()
    const member = await signIn('ada@example.com', 'my old school bell')
    expect(member.displayName).toBe('Ada O.')
    expect(localStorage.getItem(STORED)).toBeTruthy()

    await signOut()
    expect(localStorage.getItem(STORED)).toBeNull()
    expect(api.calls).toContain('POST /api/auth/logout')
  })

  it('signs a returning visitor in from the stored refresh token (and stores the new one)', async () => {
    const api = installFakeApi()
    localStorage.setItem(STORED, api.issue().refreshToken)
    const before = localStorage.getItem(STORED)

    expect((await refreshSession())?.firstName).toBe('Ada')
    expect(localStorage.getItem(STORED)).not.toBe(before)
  })

  it('refreshes only once when several requests need it at the same moment (a token works once)', async () => {
    const api = installFakeApi()
    localStorage.setItem(STORED, api.issue().refreshToken)

    const [a, b, c] = await Promise.all([refreshSession(), refreshSession(), refreshSession()])
    expect([a, b, c].every((m) => m?.firstName === 'Ada')).toBe(true)
    expect(api.calls.filter((call) => call === 'POST /api/auth/refresh')).toHaveLength(1)
  })

  it('refreshes and tries again once when the access token has expired', async () => {
    const api = installFakeApi()
    await signIn('ada@example.com', 'my old school bell')
    api.expireAccessTokens()

    const me = await authorizedFetch<{ firstName: string }>('api/me')
    expect(me.firstName).toBe('Ada')
    expect(api.calls.slice(-3)).toEqual(['GET /api/me', 'POST /api/auth/refresh', 'GET /api/me'])
  })

  it('ends the session (and says so) when the refresh token no longer works', async () => {
    const api = installFakeApi()
    await signIn('ada@example.com', 'my old school bell')
    api.expireAccessTokens()
    api.endAllSessions()
    const ended = vi.fn()
    onSignedOut(ended)

    await expect(authorizedFetch('api/me')).rejects.toMatchObject({ status: 401 })
    expect(ended).toHaveBeenCalledOnce()
    expect(localStorage.getItem(STORED)).toBeNull()
  })
})
