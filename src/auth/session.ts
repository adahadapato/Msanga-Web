import { authApi, type AuthTokens, type Member } from '../api/auth'
import { ApiError, apiFetch, type ApiOptions } from '../api/http'

/**
 * Keeps the sign-in session (no React here; the hooks are in useSession.ts).
 *
 * - The ACCESS token (15 minutes) lives only in this page's memory.
 * - The REFRESH token (30 days) is kept in this browser's storage under "msanga.refreshToken", so members stay
 *   signed in between visits (decided 13 Nov 2026). Signing out removes it.
 * - The API rotates refresh tokens and treats a token used twice as stolen (it then ends EVERY session). So only one
 *   refresh may run at a time: within this page (one shared promise) and across tabs (the browser's Web Locks), and
 *   each refresh reads the newest token from storage.
 */

const STORAGE_KEY = 'msanga.refreshToken'

/** Refresh this long before the access token runs out, so a request never starts with a token about to expire. */
const REFRESH_EARLY_MS = 60_000

let access: { token: string; expiresAt: number } | null = null
let refreshing: Promise<Member | null> | null = null
const signedOutListeners = new Set<() => void>()

// ───────────── storage (wrapped: storage can be full, blocked or missing) ─────────────

function readRefreshToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeRefreshToken(token: string | null) {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // storage blocked: the session lasts as long as this page
  }
}

function keep(tokens: AuthTokens): Member {
  access = { token: tokens.accessToken, expiresAt: Date.parse(tokens.accessTokenExpiresAt) }
  writeRefreshToken(tokens.refreshToken)
  return tokens.member
}

function forget() {
  access = null
  writeRefreshToken(null)
}

/** Runs `run` while holding the "msanga-refresh" lock shared by every tab of this site (if the browser has locks). */
function oneAtATime<T>(run: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === 'undefined' ? undefined : navigator.locks
  return locks ? (locks.request('msanga-refresh', run) as Promise<T>) : run()
}

// ───────────── the session ─────────────

/** Signs in. @throws ApiError (wrong details, email not confirmed, locked out, can't reach the API). */
export async function signIn(email: string, password: string): Promise<Member> {
  return keep(await authApi.login(email, password))
}

/**
 * Swaps the stored refresh token for a new pair (also how a returning visitor is signed in on page load).
 * @returns the member, or null when there's no stored token or it no longer works (then it's forgotten).
 * @throws ApiError status 0 when the API can't be reached (the token is kept, to try again later).
 */
export function refreshSession(): Promise<Member | null> {
  refreshing ??= oneAtATime(async () => {
    const stored = readRefreshToken()
    if (!stored) {
      access = null
      return null
    }
    try {
      return keep(await authApi.refresh(stored))
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        forget()
        return null
      }
      throw error
    }
  }).finally(() => {
    refreshing = null
  })
  return refreshing
}

/** Signs out: forgets the tokens here, then tells the API (if that fails, the token still expires by itself). */
export async function signOut(): Promise<void> {
  const stored = readRefreshToken()
  forget()
  if (stored) {
    try {
      await authApi.logout(stored)
    } catch {
      // nothing to do: this browser no longer has the token
    }
  }
}

/** Called when the session ends by itself (the refresh token stopped working). Returns "stop listening". */
export function onSignedOut(listener: () => void): () => void {
  signedOutListeners.add(listener)
  return () => {
    signedOutListeners.delete(listener)
  }
}

function endedByItself() {
  forget()
  signedOutListeners.forEach((listener) => listener())
}

/**
 * Calls an endpoint that needs sign-in. Refreshes first when the access token is about to run out, and once more
 * if the API still says the session expired; if that fails too, the session has ended (listeners are told).
 * @throws ApiError, e.g. 401 "Please sign in again." when the session has ended.
 */
export async function authorizedFetch<T>(path: string, options: Omit<ApiOptions, 'accessToken'> = {}): Promise<T> {
  const sessionEnded = () => {
    endedByItself()
    return new ApiError(401, 'Auth.SignInRequired', 'Please sign in again.')
  }

  if (!access || access.expiresAt - Date.now() < REFRESH_EARLY_MS) {
    if (!(await refreshSession())) throw sessionEnded()
  }

  try {
    return await apiFetch<T>(path, { ...options, accessToken: access!.token })
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 401)) throw error
    if (!(await refreshSession())) throw sessionEnded()
    return apiFetch<T>(path, { ...options, accessToken: access!.token })
  }
}

/** Tests only: forgets everything held in memory (storage is cleared by the test setup). */
export function resetSessionForTests() {
  access = null
  refreshing = null
  signedOutListeners.clear()
}
