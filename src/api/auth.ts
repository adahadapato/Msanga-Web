import { apiFetch } from './http'

/**
 * The account endpoints of msanga-api (/api/auth), exactly as the API has them: create account and the 6-digit code
 * (W3), sign in, refresh, sign out (W2), forgot / reset password with a code (W4). The profile comes in W5.
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
  /** e.g. "1998 Set"; null until sets exist (M2–M3). */
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

/** What the Create account form sends. */
export interface NewAccount {
  firstName: string
  lastName: string
  /** Surname at school, if different now; "" = none. */
  schoolSurname: string
  email: string
  password: string
}

export const authApi = {
  /**
   * Always 204, even when the email already has an account (its owner gets an email instead), so nobody can use
   * it to find out who is on Msanga. 400 with field errors; 429 too many tries.
   */
  register: (account: NewAccount) =>
    apiFetch<void>('api/auth/register', { method: 'POST', body: account }),

  /** 204; or 400 Auth.InvalidCode (wrong, expired, used, or 5 wrong tries: the same answer for an unknown email). */
  confirmEmail: (email: string, code: string) =>
    apiFetch<void>('api/auth/confirm-email', { method: 'POST', body: { email, code } }),

  /** Always 204 (a new code goes out only if the email has an account waiting to be confirmed). */
  resendConfirmation: (email: string) =>
    apiFetch<void>('api/auth/resend-confirmation', { method: 'POST', body: { email } }),

  /** Always 204 (a reset code goes out only if the email has an account). */
  forgotPassword: (email: string) =>
    apiFetch<void>('api/auth/forgot-password', { method: 'POST', body: { email } }),

  /**
   * 204: the new password is set, every session is signed out, and a "your password was changed" email goes out.
   * 400 Auth.InvalidCode (the same answer for an unknown email); 400 Auth.WeakPassword (the code still works).
   */
  resetPassword: (email: string, code: string, newPassword: string) =>
    apiFetch<void>('api/auth/reset-password', { method: 'POST', body: { email, code, newPassword } }),

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
