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
  /** How the school names its sets: 1992–1998 is the "1998 Set" (by leaving year) or the "1992 Set" (by entry). */
  setNaming: SetNaming
}

/** How a school names its sets (each school chooses; by leaving year unless an admin changes it). */
export type SetNaming = 'ByLeavingYear' | 'ByEntryYear'

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

/** My set and details at a school, as the form sends them ("" = not given). */
export interface MySet {
  setYear: number
  house: string
  classArm: string
  hostel: string
  department: string
}

/** One of my schools: the school, my years there, my set and details (MembershipDto). */
export interface Membership extends SchoolYears {
  school: Community
  status: MembershipStatus
  /** My set's year; null until I choose it. */
  setYear: number | null
  /** "1998 Set"; null until I choose. */
  setName: string | null
  /** The set my years suggest (pre-selected on the form); null if I must choose (left early). */
  suggestedSetYear: number | null
  /** The sets my years allow, first to last. */
  setYearChoices: number[]
  house: string | null
  classArm: string | null
  hostel: string | null
  department: string | null
  /** Who said "I know them", oldest first ("Nse U."): "Confirmed by…". Empty if an admin confirmed me, or nobody yet.
   *  Only GET …/membership fills it (the other answers send it empty). */
  vouchedBy: string[]
  /** True if I may vouch here (confirmed, or the school's early days): show "People waiting". Only from GET. */
  canVouch: boolean
}

/** A person at a school, as schoolmates see them (PersonDto): enough to recognise a classmate, nothing more. */
export interface Person {
  memberId: string
  /** Their name now, "Nse Udo". */
  name: string
  /** Their surname at school if different; null if not given. */
  schoolSurname: string | null
  fromYear: number
  toYear: number
  /** "1999 Set"; null if not chosen. */
  setName: string | null
  house: string | null
  classArm: string | null
  department: string | null
  /** True if I've already said "I know them". */
  youVouched: boolean
}

/** After "I know them" (VouchOutcomeDto). */
export interface VouchOutcome {
  person: Person
  /** True if my vouch confirmed them. */
  nowConfirmed: boolean
}

/** A set's page (SetDto). */
export interface SchoolSet {
  school: Community
  year: number
  /** "1998 Set". */
  name: string
  /** True if it's my set. */
  isMine: boolean
  /** True if I'm confirmed at the school: only confirmed members see who's in a set. */
  canSeeMembers: boolean
  /** The set's confirmed members, by name (empty unless canSeeMembers). */
  members: Person[]
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

  /** Choose my set, with my details (400 Community.SetOutOfRange if the set doesn't fit my years). */
  chooseSet: (communityId: string, set: MySet) =>
    authorizedFetch<Membership>(`${membershipPath(communityId)}/set`, { method: 'PUT', body: set }),

  /** A set's page (403 Community.MembersOnly if I haven't joined the school). */
  set: (communityId: string, year: number, signal?: AbortSignal) =>
    authorizedFetch<SchoolSet>(`api/communities/${encodeURIComponent(communityId)}/sets/${year}`, { signal }),

  /** People waiting to be confirmed (403 unless I may vouch). */
  waiting: (communityId: string, signal?: AbortSignal) =>
    authorizedFetch<Person[]>(`api/communities/${encodeURIComponent(communityId)}/waiting`, { signal }),

  /** "I know them": the second vouch confirms them. 409 if already vouched or already confirmed. */
  vouch: (communityId: string, memberId: string) =>
    authorizedFetch<VouchOutcome>(
      `api/communities/${encodeURIComponent(communityId)}/members/${encodeURIComponent(memberId)}/vouch`,
      { method: 'POST' }),

  /** Leave the school (my membership is deleted). */
  leave: (communityId: string) => authorizedFetch<void>(membershipPath(communityId), { method: 'DELETE' }),

  /** My Schools: my schools and years, most recent first. */
  mySchools: (signal?: AbortSignal) => authorizedFetch<Membership[]>('api/me/schools', { signal }),
}
