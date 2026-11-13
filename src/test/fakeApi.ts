import { vi } from 'vitest'
import type { AuthTokens, Member } from '../api/auth'

/** The one account the pretend API knows from the start (like Ada, made in Swagger). Reset for every test. */
export const ADA = { email: 'ada@example.com', password: 'my old school bell' }
const ADA_PASSWORD = ADA.password

const ada: Member = {
  id: '0193a000-0000-7000-8000-000000000001',
  email: ADA.email,
  firstName: 'Ada',
  lastName: 'Okon',
  schoolSurname: null,
  displayName: 'Ada O.',
  mainSet: null,
  bio: '',
  photo: null,
}

/**
 * A pretend msanga-api for the tests (replaces the browser's fetch): create account with a 6-digit code (one
 * InvalidCode answer for everything wrong, 5 tries per code), sign in, refresh (rotating: a refresh token works once,
 * like the real API), sign out, /api/me and /api/hello. `calls` records every request; `sentCodes` the "emails".
 */
export function installFakeApi() {
  ADA.password = ADA_PASSWORD
  let n = 0
  const refreshTokens = new Map<string, 'active' | 'used'>()
  const accessTokens = new Set<string>()
  const calls: string[] = []
  /** Accounts created in the test: email → password, first name, confirmed or not. */
  const accounts = new Map<string, { password: string; firstName: string; confirmed: boolean }>()
  /** The codes "emailed": email → the newest code and wrong tries so far. */
  const codes = new Map<string, { code: string; wrongTries: number }>()
  /** Every code "emailed", oldest first (the tests read them like an inbox). */
  const sentCodes: { email: string; code: string }[] = []
  let codeNumber = 482912
  const sendCode = (email: string) => {
    codeNumber += 1
    codes.set(email, { code: String(codeNumber), wrongTries: 0 })
    sentCodes.push({ email, code: String(codeNumber) })
  }
  /** Reset codes "emailed": email → the newest code and wrong tries so far. */
  const resetCodes = new Map<string, { code: string; wrongTries: number }>()
  const passwordOf = (email: string) => (email === ADA.email ? ADA.password : accounts.get(email)?.password)
  const invalidCode = () => problem(400, 'Auth.InvalidCode', "That code isn't right or has expired. Check it, or ask for a new code.")

  const problem = (status: number, code: string, detail: string) => Response.json({ status, code, detail }, { status })

  /** A new session, as the API's login / refresh answer it. */
  function issue(): AuthTokens {
    n += 1
    const accessToken = `access-${n}`
    const refreshToken = `refresh-${n}`
    accessTokens.add(accessToken)
    refreshTokens.set(refreshToken, 'active')
    return {
      accessToken,
      accessTokenExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      member: ada,
    }
  }

  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET'
    const path = new URL(url).pathname
    const body = init?.body ? JSON.parse(String(init.body)) : undefined
    const bearer = (init?.headers as Record<string, string> | undefined)?.Authorization?.replace('Bearer ', '')
    calls.push(`${method} ${path}`)

    switch (`${method} ${path}`) {
      case 'POST /api/auth/register': {
        const email = String(body.email).toLowerCase()
        if (String(body.password).length < 10) {
          return Response.json({ status: 400, title: 'Validation failed', errors: { Password: ['Passwords must be at least 10 characters.'] } }, { status: 400 })
        }
        const existing = accounts.get(email)
        if (!existing && email !== ADA.email) {
          accounts.set(email, { password: body.password, firstName: body.firstName, confirmed: false })
          sendCode(email)
        } else if (existing && !existing.confirmed) {
          sendCode(email)
        }
        return new Response(null, { status: 204 })
      }
      case 'POST /api/auth/confirm-email': {
        const email = String(body.email).toLowerCase()
        const account = accounts.get(email)
        const current = codes.get(email)
        if (!account || account.confirmed || !current || current.wrongTries >= 5) return invalidCode()
        if (String(body.code).replace(/[ -]/g, '') !== current.code) {
          current.wrongTries += 1
          return invalidCode()
        }
        account.confirmed = true
        codes.delete(email)
        return new Response(null, { status: 204 })
      }
      case 'POST /api/auth/resend-confirmation': {
        const email = String(body.email).toLowerCase()
        if (accounts.get(email)?.confirmed === false) sendCode(email)
        return new Response(null, { status: 204 })
      }
      case 'POST /api/auth/forgot-password': {
        const email = String(body.email).toLowerCase()
        if (passwordOf(email)) {
          codeNumber += 1
          resetCodes.set(email, { code: String(codeNumber), wrongTries: 0 })
          sentCodes.push({ email, code: String(codeNumber) })
        }
        return new Response(null, { status: 204 })
      }
      case 'POST /api/auth/reset-password': {
        const email = String(body.email).toLowerCase()
        if (String(body.newPassword).length < 10) {
          return problem(400, 'Auth.WeakPassword', 'Passwords must be at least 10 characters.')
        }
        const current = resetCodes.get(email)
        if (!passwordOf(email) || !current || current.wrongTries >= 5) return invalidCode()
        if (String(body.code).replace(/[ -]/g, '') !== current.code) {
          current.wrongTries += 1
          return invalidCode()
        }
        resetCodes.delete(email)
        if (email === ADA.email) ADA.password = body.newPassword
        else accounts.get(email)!.password = body.newPassword
        refreshTokens.forEach((_, token) => refreshTokens.set(token, 'used'))     // every session signed out
        return new Response(null, { status: 204 })
      }
      case 'POST /api/auth/login': {
        const email = String(body.email).toLowerCase()
        const account = accounts.get(email)
        if (account && account.password === body.password) {
          if (!account.confirmed) return problem(403, 'Auth.EmailNotConfirmed', 'Please confirm your email first: enter the code we sent you.')
          return Response.json({ ...issue(), member: { ...ada, email, firstName: account.firstName, displayName: `${account.firstName} N.` } })
        }
        return email === ADA.email && body.password === ADA.password
          ? Response.json(issue())
          : problem(401, 'Auth.InvalidCredentials', 'The email or password is not right. Check them and try again.')
      }
      case 'POST /api/auth/refresh':
        if (refreshTokens.get(body.refreshToken) !== 'active') {
          return problem(401, 'Auth.InvalidToken', 'Your session has ended. Please sign in again.')
        }
        refreshTokens.set(body.refreshToken, 'used')
        return Response.json(issue())
      case 'POST /api/auth/logout':
        refreshTokens.set(body.refreshToken, 'used')
        return new Response(null, { status: 204 })
      case 'GET /api/me':
        return bearer && accessTokens.has(bearer)
          ? Response.json(ada)
          : problem(401, 'Auth.SessionExpired', 'Your session has expired. Please sign in again.')
      case 'GET /api/hello':
        return Response.json({ title: 'Mme nsanga!', message: 'Your set is waiting.', serverTime: '2026-11-13T22:00:00Z' })
      default:
        return problem(404, 'Http.404', 'Not found.')
    }
  }))

  return {
    calls,
    sentCodes,
    issue,
    /** Every access token stops working (as if 15 minutes had passed). */
    expireAccessTokens: () => accessTokens.clear(),
    /** Every refresh token stops working (as if the session had ended on the server). */
    endAllSessions: () => refreshTokens.forEach((_, token) => refreshTokens.set(token, 'used')),
  }
}
