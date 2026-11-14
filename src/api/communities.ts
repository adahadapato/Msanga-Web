import { authorizedFetch } from '../auth/session'
import { ApiError } from './http'

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

/** What "Add your school" sends. */
export interface NewCommunity {
  name: string
  level: CommunityLevel
  town: string
  /** Nigeria: one of the states. Elsewhere: "" = none. */
  state: string
  countryCode: string
  /** Up to 5. */
  otherNames: string[]
  /** True after the member has seen the lookalikes and said theirs is different. */
  addAnyway: boolean
}

/** Why a school wasn't added, with the schools to show: it's already there, or some look like it. */
export type NotAdded =
  | { kind: 'alreadyListed'; schools: Community[] }
  | { kind: 'looksLike'; schools: Community[] }

/** Reads a 409 from adding a school; undefined for any other error. */
export function notAddedBecause(error: unknown): NotAdded | undefined {
  if (!(error instanceof ApiError) || error.status !== 409) return undefined
  const schools = (error.body.suggestions as Community[] | undefined) ?? []
  if (error.code === 'Community.AlreadyListed') return { kind: 'alreadyListed', schools }
  if (error.code === 'Community.LooksLike') return { kind: 'looksLike', schools }
  return undefined
}

export const communitiesApi = {
  /** Schools matching what was typed, best first, at most 20. */
  search: (text: string, signal?: AbortSignal) =>
    authorizedFetch<Community[]>(`api/communities?search=${encodeURIComponent(text)}`, { signal }),

  /** One school, for its page. 404 (`Community.NotFound`) if there's no such school. */
  get: (id: string, signal?: AbortSignal) =>
    authorizedFetch<Community>(`api/communities/${encodeURIComponent(id)}`, { signal }),

  /** Adds a school (marked new). 409 with `suggestions` if it's there already or looks like others (see
   *  {@link notAddedBecause}); 400 with field errors; 429 after 20 tries in a day. */
  add: (school: NewCommunity) => authorizedFetch<Community>('api/communities', { method: 'POST', body: school }),
}

/** Joined (says they were a student there), or Confirmed (vouched for by classmates; comes with M3c). */
export type MembershipStatus = 'Joined' | 'Confirmed'

/** My years at a school, as the form sends them. */
export interface SchoolYears {
  fromYear: number
  toYear: number
  /** True if I finished there (my home set is then my leaving year's, M3b). */
  finished: boolean
}

/** One of my schools: the school and my years there (MembershipDto). */
export interface Membership extends SchoolYears {
  school: Community
  status: MembershipStatus
}

/** The earliest year on the forms (the API's rule too). */
export const EARLIEST_YEAR = 1940
/** The longest stay at one school (the API's rule too). */
export const MAX_YEARS_AT_ONE_SCHOOL = 12

const membershipPath = (communityId: string) => `api/communities/${encodeURIComponent(communityId)}/membership`

/** "I was a student here": the signed-in member's own membership of a school. Only ever their own. */
export const membershipApi = {
  /** My membership of this school, or null if I haven't joined it (the API's 404 Community.NotAMember). */
  mine: async (communityId: string, signal?: AbortSignal): Promise<Membership | null> => {
    try {
      return await authorizedFetch<Membership>(membershipPath(communityId), { signal })
    } catch (error) {
      if (error instanceof ApiError && error.code === 'Community.NotAMember') return null
      throw error
    }
  },

  /** Join with my years (201; 409 Community.AlreadyMember; 400 with field errors). */
  join: (communityId: string, years: SchoolYears) =>
    authorizedFetch<Membership>(membershipPath(communityId), { method: 'POST', body: years }),

  /** Correct my years. */
  change: (communityId: string, years: SchoolYears) =>
    authorizedFetch<Membership>(membershipPath(communityId), { method: 'PUT', body: years }),

  /** Leave the school (my membership is deleted). */
  leave: (communityId: string) => authorizedFetch<void>(membershipPath(communityId), { method: 'DELETE' }),

  /** My Schools: my schools and years, most recent first. */
  mySchools: (signal?: AbortSignal) => authorizedFetch<Membership[]>('api/me/schools', { signal }),
}
