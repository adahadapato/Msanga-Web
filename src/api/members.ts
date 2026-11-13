import { authorizedFetch } from '../auth/session'
import type { Member } from './auth'

/**
 * /api/me: the signed-in member. Goes through authorizedFetch, so the session is refreshed when needed (and a session
 * that has ended sends you to Sign in).
 */

/** What Edit profile sends. Photos come with uploads (later). */
export interface ProfileChanges {
  firstName: string
  lastName: string
  /** "" = none. */
  schoolSurname: string
  /** "" = none; at most 300 characters. */
  bio: string
}

export const membersApi = {
  /** The signed-in member, fresh from the API. */
  getMe: () => authorizedFetch<Member>('api/me'),

  /** Saves your profile; the API answers with the updated member. 400 with field errors. */
  updateMe: (changes: ProfileChanges) => authorizedFetch<Member>('api/me', { method: 'PUT', body: changes }),
}
