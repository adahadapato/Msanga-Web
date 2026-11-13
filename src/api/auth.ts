import { apiFetch } from './http'

/**
 * The account endpoints of msanga-api (/api/auth), exactly as the API has them. W2 uses sign in, refresh and sign
 * out; create account, the codes and the profile come in W3–W5.
 */

/** The signed-in member (the API's MemberDto). No popularity counts, by design. */
export interface Member {
  id: string
  email: string
  firstName: string
  lastName: string
  /** Their surname at school, if different now; null = none. */
  schoolSurname: string | null
  /** "Hilary A." */
  displayName: string
  /** e.g. "Class of 1998"; null until sets exist (M2–M3). */
  mainSet: string | null
  bio: string
  /** Their picture; null = initials. */
  photo: string | null
}

/** A signed-in session (the API's AuthTokensDto). Dates are ISO strings in UTC. */
export interface AuthTokens {
  /** 15 minutes; sent as "Authorization: Bearer …". */
  accessToken: string
  accessTokenExpiresAt: string
  /** 30 days; swapped for a new pair at /api/auth/refresh (the old one stops working). */
  refreshToken: string
  refreshTokenExpiresAt: string
  member: Member
}

export const authApi = {
  /** 401 Auth.InvalidCredentials, 403 Auth.EmailNotConfirmed or Auth.LockedOut, 429 too many tries. */
  login: (email: string, password: string) =>
    apiFetch<AuthTokens>('api/auth/login', { method: 'POST', body: { email, password } }),

  /** 401 Auth.InvalidToken when the token is unknown, expired, or was already used (then every session ends). */
  refresh: (refreshToken: string) =>
    apiFetch<AuthTokens>('api/auth/refresh', { method: 'POST', body: { refreshToken } }),

  /** Always 204. */
  logout: (refreshToken: string) =>
    apiFetch<void>('api/auth/logout', { method: 'POST', body: { refreshToken } }),
}
