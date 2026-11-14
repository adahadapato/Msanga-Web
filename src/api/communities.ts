import { authorizedFetch } from '../auth/session'

/**
 * /api/communities: schools. Signed-in members only (through authorizedFetch, so the session is refreshed when
 * needed). The API matches "fgc ikot", "Govt. Coll. Umuahia" or "UNILAG" for us; this side just sends the text.
 */

/** Primary, secondary or tertiary (university, polytechnic, college of education). */
export type CommunityLevel = 'Primary' | 'Secondary' | 'Tertiary'

/** A school, as the API sends it (CommunityDto). Who added it is never sent. */
export interface Community {
  id: string
  name: string
  kind: 'School'
  level: CommunityLevel
  town: string
  /** Null = none (some countries). */
  state: string | null
  /** Two letters, e.g. "NG". */
  countryCode: string
  /** Added by a member and not checked yet: show the "New" label. */
  isNew: boolean
  /** "Also known as…", A–Z. */
  otherNames: string[]
}

/** Fewer letters than this and the API answers with no schools, so the page doesn't ask (saves data). */
export const SEARCH_MIN_LENGTH = 2

export const communitiesApi = {
  /** Schools matching what was typed, best first, at most 20. */
  search: (text: string, signal?: AbortSignal) =>
    authorizedFetch<Community[]>(`api/communities?search=${encodeURIComponent(text)}`, { signal }),

  /** One school, for its page. 404 (`Community.NotFound`) if there's no such school. */
  get: (id: string, signal?: AbortSignal) =>
    authorizedFetch<Community>(`api/communities/${encodeURIComponent(id)}`, { signal }),
}
