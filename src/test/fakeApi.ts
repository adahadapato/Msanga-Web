import { vi } from 'vitest'
import type { AuthTokens, Member } from '../api/auth'
import type { Community, Membership, MySet, Person, SchoolYears } from '../api/communities'

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

/** The schools the pretend API knows (like the API's development seed, plus one added by a member). */
export const SCHOOLS: Community[] = [
  { id: 'fgcie', name: 'Federal Government College, Ikot Ekpene', kind: 'School', level: 'Secondary', town: 'Ikot Ekpene', state: 'Akwa Ibom', countryCode: 'NG', isNew: false, otherNames: ['FGCIE'], setNaming: 'ByLeavingYear' },
  { id: 'gcu', name: 'Government College, Umuahia', kind: 'School', level: 'Secondary', town: 'Umuahia', state: 'Abia', countryCode: 'NG', isNew: false, otherNames: ['GCU'], setNaming: 'ByLeavingYear' },
  { id: 'uniuyo', name: 'University of Uyo', kind: 'School', level: 'Tertiary', town: 'Uyo', state: 'Akwa Ibom', countryCode: 'NG', isNew: false, otherNames: ['UniUyo'], setNaming: 'ByLeavingYear' },
  { id: 'kcl', name: "King's College", kind: 'School', level: 'Secondary', town: 'Lagos', state: 'Lagos', countryCode: 'NG', isNew: false, otherNames: ['KC'], setNaming: 'ByLeavingYear' },
  { id: 'hcc', name: 'Holy Child College', kind: 'School', level: 'Secondary', town: 'Ikoyi', state: 'Lagos', countryCode: 'NG', isNew: true, otherNames: [], setNaming: 'ByLeavingYear' },
  { id: 'croydon', name: 'Croydon High School', kind: 'School', level: 'Secondary', town: 'Croydon', state: 'Greater London', countryCode: 'GB', isNew: false, otherNames: [], setNaming: 'ByLeavingYear' },
]

const keyWords = (text: string) =>
  text.toLowerCase().replace(/'/g, '').replace(/\bfgc\b/g, 'federal government college').split(/[^a-z0-9]+/).filter(Boolean)

/** A rough stand-in for the API's search (which has its own tests there): every word must be in the name, town or
 *  another name. "fgc" stands for "federal government college", as in the API. */
function searchSchools(schools: Community[], text: string) {
  const words = keyWords(text)
  if (words.join(' ').length < 2) return []
  return schools.filter((s) => {
    const haystack = [s.name, s.town, ...s.otherNames].join(' ').toLowerCase()
    return words.every((w) => haystack.includes(w))
  })
}

/**
 * A pretend msanga-api for the tests (replaces the browser's fetch): create account with a 6-digit code (one
 * InvalidCode answer for everything wrong, 5 tries per code), sign in, refresh (rotating: a refresh token works once,
 * like the real API), sign out, /api/me (read and edit), /api/communities (search, one school, add one, membership), /api/me/schools and /api/hello. `calls` records every request; `sentCodes` the "emails".
 */
export function installFakeApi() {
  ADA.password = ADA_PASSWORD
  let me: Member = { ...ada }    // Ada as the API holds her (Edit profile changes this)
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

  const problem = (status: number, code: string, detail: string, extra: object = {}) =>
    Response.json({ status, code, detail, ...extra }, { status })

  /** The schools, for this test only (adding one doesn't leak into the next test). */
  const schools: Community[] = [...SCHOOLS]
  /** Ada's schools: school id → her years (only ever her own, like the API). */
  const memberships = new Map<string, SchoolYears & { status: Membership['status'] } & Partial<Record<keyof MySet, number | string | null>>>()
  /** Who vouched for Ada, per school ("Nse U."). */
  const adaVouchedBy = new Map<string, string[]>()
  /** Other people at the schools (like the API's development seed: Nse and Utibe joined at FGC Ikot Ekpene). */
  const others: (Omit<Person, 'youVouched'> & { schoolId: string; status: Membership['status']; setYear: number | null;
                                                 vouchedBy: string[] })[] = [
    { memberId: 'nse', name: 'Nse Udo', schoolSurname: null, schoolId: 'fgcie', fromYear: 1993, toYear: 1999,
      setYear: 1999, setName: '1999 Set', house: 'Red House', classArm: null, department: null, status: 'Joined', vouchedBy: [] },
    { memberId: 'utibe', name: 'Utibe Essien', schoolSurname: 'Bassey', schoolId: 'fgcie', fromYear: 1992, toYear: 1998,
      setYear: 1998, setName: '1998 Set', house: 'Blue House', classArm: 'SS3A', department: null, status: 'Joined', vouchedBy: [] },
  ]
  const confirmedAt = (schoolId: string) =>
    others.filter((o) => o.schoolId === schoolId && o.status === 'Confirmed').length +
    (memberships.get(schoolId)?.status === 'Confirmed' ? 1 : 0)
  const adaMayVouch = (schoolId: string) =>
    memberships.get(schoolId)?.status === 'Confirmed' || confirmedAt(schoolId) < 3
  const personOf = (o: (typeof others)[number]): Person => ({
    memberId: o.memberId, name: o.name, schoolSurname: o.schoolSurname, fromYear: o.fromYear, toYear: o.toYear,
    setName: o.setName, house: o.house, classArm: o.classArm, department: o.department,
    youVouched: o.vouchedBy.includes('Ada O.'),
  })

  /** GET …/waiting and POST …/members/{id}/vouch, like the API (rules: Domain/Rules/Vouching.cs there). */
  function vouching(method: string, school: Community, memberId: string | undefined) {
    if (!memberships.has(school.id)) return problem(403, 'Community.MembersOnly', 'Only people who were students here can see this. Join the school first.')
    if (method === 'GET') {
      if (!adaMayVouch(school.id)) return problem(403, 'Community.NotConfirmedYet', "You can vouch for others once classmates have confirmed you.")
      return Response.json(others.filter((o) => o.schoolId === school.id && o.status === 'Joined').map(personOf))
    }
    const them = others.find((o) => o.schoolId === school.id && o.memberId === memberId)
    if (!them) return problem(404, 'Community.PersonNotFound', "We couldn't find that person at this school.")
    if (them.status === 'Confirmed') return problem(409, 'Community.AlreadyConfirmed', "They're already confirmed. Thank you!")
    if (!adaMayVouch(school.id)) return problem(403, 'Community.NotConfirmedYet', "You can vouch for others once classmates have confirmed you.")
    if (them.vouchedBy.includes('Ada O.')) return problem(409, 'Community.AlreadyVouched', "You've already said you know them.")
    them.vouchedBy.push('Ada O.')
    if (them.vouchedBy.length >= 2) them.status = 'Confirmed'
    return Response.json({ person: personOf(them), nowConfirmed: them.status === 'Confirmed' })
  }

  /** GET …/sets/{year}: who's here only for confirmed members (Ada included when she's in the set). */
  function setPage(school: Community, year: number) {
    if (!memberships.has(school.id)) return problem(403, 'Community.MembersOnly', 'Only people who were students here can see this. Join the school first.')
    const mine = memberships.get(school.id)!
    const canSeeMembers = mine.status === 'Confirmed'
    const members = canSeeMembers
      ? [...others.filter((o) => o.schoolId === school.id && o.status === 'Confirmed' && o.setYear === year).map(personOf),
         ...(mine.setYear === year ? [{ memberId: 'ada', name: 'Ada Okon', schoolSurname: null, fromYear: mine.fromYear,
             toYear: mine.toYear, setName: `${year} Set`, house: null, classArm: null, department: null, youVouched: false }] : [])]
        .sort((a, b) => a.name.localeCompare(b.name))
      : []
    return Response.json({ school, year, name: `${year} Set`, isMine: mine.setYear === year, canSeeMembers, members })
  }

  /** Like the API's MembershipDto: the suggested set and the allowed sets come from the years and the school's naming.
   *  Only GET fills who vouched and whether Ada may vouch (`full`). */
  const membershipOf = (school: Community, full = false): Membership => {
    const m = memberships.get(school.id)!
    const byEntry = school.setNaming === 'ByEntryYear'
    const [first, last] = byEntry ? [m.fromYear - 6, m.toYear] : [m.fromYear, m.toYear + 6]
    const setYear = (m.setYear as number | undefined) ?? null
    const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)
    return {
      school, fromYear: m.fromYear, toYear: m.toYear, finished: m.finished, status: m.status,
      setYear, setName: setYear ? `${setYear} Set` : null,
      suggestedSetYear: byEntry ? m.fromYear : m.finished ? m.toYear : null,
      setYearChoices: Array.from({ length: last - first + 1 }, (_, i) => first + i),
      house: text(m.house), classArm: text(m.classArm), hostel: text(m.hostel), department: text(m.department),
      vouchedBy: full ? (adaVouchedBy.get(school.id) ?? []) : [],
      canVouch: full ? adaMayVouch(school.id) : false,
    }
  }

  /** /api/communities/{id}/membership, like the API: the same year rules, one per school, 404 if not joined. */
  /** PUT …/membership/set, like the API: the set must fit the years (400 Community.SetOutOfRange). */
  function chooseSet(school: Community, body: MySet) {
    if (!memberships.has(school.id)) return problem(404, 'Community.NotAMember', "You haven't joined this school.")
    const { setYearChoices } = membershipOf(school)
    if (!setYearChoices.includes(body.setYear)) {
      const [first, last] = [setYearChoices[0], setYearChoices[setYearChoices.length - 1]]
      return problem(400, 'Community.SetOutOfRange', `Choose a set between ${first} and ${last}: those fit the years you were here.`)
    }
    memberships.set(school.id, { ...memberships.get(school.id)!, ...body })
    return Response.json(membershipOf(school))
  }

  function membership(method: string, school: Community, body: SchoolYears) {
    const notAMember = () => problem(404, 'Community.NotAMember', "You haven't joined this school.")
    if (method === 'GET') return memberships.has(school.id) ? Response.json(membershipOf(school, true)) : notAMember()
    if (method === 'DELETE') {
      return memberships.delete(school.id) ? new Response(null, { status: 204 }) : notAMember()
    }
    if (method === 'POST' && memberships.has(school.id)) {
      return problem(409, 'Community.AlreadyMember', "You've already joined this school. You can change your years instead.")
    }
    if (method === 'PUT' && !memberships.has(school.id)) return notAMember()
    if (body.toYear < body.fromYear) {
      return Response.json({ status: 400, title: 'Validation failed',
        errors: { ToYear: ["The year you left can't be before the year you started."] } }, { status: 400 })
    }
    memberships.set(school.id, { ...memberships.get(school.id), ...body, status: memberships.get(school.id)?.status ?? 'Joined' })
    // New years that no longer fit the chosen set clear it (like the API)
    const now = membershipOf(school)
    if (now.setYear !== null && !now.setYearChoices.includes(now.setYear)) {
      memberships.set(school.id, { ...memberships.get(school.id)!, setYear: null })
    }
    return Response.json(membershipOf(school), { status: method === 'POST' ? 201 : 200 })
  }
  /** Adding a school, like the API: the same name and town → AlreadyListed; a search by the name finds some →
   *  LooksLike (unless addAnyway); Nigeria needs a state. */
  function addSchool(body: { name: string; level: Community['level']; town: string; state: string; countryCode: string; otherNames: string[]; addAnyway: boolean }) {
    if (body.countryCode === 'NG' && !body.state) {
      return Response.json({ status: 400, title: 'Validation failed', errors: { State: ['Choose the state.'] } }, { status: 400 })
    }
    const key = (s: { name: string; town: string }) => [...new Set(keyWords(`${s.name} ${s.town}`))].join(' ')
    const same = schools.find((s) => key(s) === key(body))
    if (same) return problem(409, 'Community.AlreadyListed', 'That school is already on Msanga.', { suggestions: [same] })
    const lookalikes = searchSchools(schools, body.name).slice(0, 5)
    if (!body.addAnyway && lookalikes.length) {
      return problem(409, 'Community.LooksLike', 'Is it one of these? If not, you can still add yours.', { suggestions: lookalikes })
    }
    const added: Community = {
      id: `added-${schools.length}`, name: body.name, kind: 'School', level: body.level, town: body.town,
      state: body.state || null, countryCode: body.countryCode, isNew: true, otherNames: body.otherNames, setNaming: 'ByLeavingYear',
    }
    schools.push(added)
    return Response.json(added, { status: 201 })
  }

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
      member: me,
    }
  }

  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET'
    const address = new URL(url)
    const path = address.pathname
    const body = init?.body ? JSON.parse(String(init.body)) : undefined
    const bearer = (init?.headers as Record<string, string> | undefined)?.Authorization?.replace('Bearer ', '')
    calls.push(`${method} ${path}${address.search}`)

    // Schools (members only)
    if (path.startsWith('/api/communities')) {
      if (!bearer || !accessTokens.has(bearer)) return problem(401, 'Auth.SessionExpired', 'Your session has expired. Please sign in again.')
      const [, , , id, part, rest] = path.split('/')
      if (method === 'POST' && !id) return addSchool(body)
      if (part === 'membership' || part === 'sets' || part === 'waiting' || part === 'members') {
        const school = schools.find((s) => s.id === id)
        if (!school) return problem(404, 'Community.NotFound', "We couldn't find that school.")
        if (part === 'membership') return rest === 'set' ? chooseSet(school, body) : membership(method, school, body)
        if (part === 'waiting' || part === 'members') return vouching(method, school, rest)
        return setPage(school, Number(rest))
      }
      if (!id) return Response.json(searchSchools(schools, address.searchParams.get('search') ?? ''))
      const school = schools.find((s) => s.id === id)
      return school ? Response.json(school) : problem(404, 'Community.NotFound', "We couldn't find that school.")
    }

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
          ? Response.json(me)
          : problem(401, 'Auth.SessionExpired', 'Your session has expired. Please sign in again.')
      case 'PUT /api/me': {
        if (!bearer || !accessTokens.has(bearer)) return problem(401, 'Auth.SessionExpired', 'Your session has expired. Please sign in again.')
        if (String(body.bio ?? '').length > 300) {
          return Response.json({ status: 400, title: 'Validation failed', errors: { Bio: ['Keep it to 300 characters or fewer.'] } }, { status: 400 })
        }
        me = {
          ...me, firstName: body.firstName, lastName: body.lastName, schoolSurname: body.schoolSurname || null,
          bio: body.bio ?? '', displayName: `${body.firstName} ${String(body.lastName).charAt(0).toUpperCase()}.`,
        }
        return Response.json(me)
      }
      case 'GET /api/me/schools':
        if (!bearer || !accessTokens.has(bearer)) return problem(401, 'Auth.SessionExpired', 'Your session has expired. Please sign in again.')
        return Response.json(schools.filter((s) => memberships.has(s.id)).map((school) => membershipOf(school))
          .sort((a, b) => b.toYear - a.toYear))
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
    /** Ada's schools (to start a test with her already in some). */
    memberships,
    /** The schools of this test (to change one, e.g. its set naming). */
    schools,
    /** Other people at the schools (Nse and Utibe at FGCIE): to confirm one, or add a vouch from someone else. */
    others,
    /** Who vouched for Ada, per school. */
    adaVouchedBy,
    /** Every access token stops working (as if 15 minutes had passed). */
    expireAccessTokens: () => accessTokens.clear(),
    /** Every refresh token stops working (as if the session had ended on the server). */
    endAllSessions: () => refreshTokens.forEach((_, token) => refreshTokens.set(token, 'used')),
  }
}
