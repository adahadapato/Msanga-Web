import { useEffect, useState } from 'react'
import type { Community, CommunityLevel, Membership, Person, SchoolYears } from '../../api/communities'

/** How each level is shown (decided 13 Nov 2026: "University / Polytechnic" for tertiary). */
export const LEVEL_LABELS: Record<CommunityLevel, string> = {
  Primary: 'Primary school',
  Secondary: 'Secondary school',
  Tertiary: 'University / Polytechnic',
}

/** The query keys: my membership of one school, and My Schools (both forgotten on sign-out, like everything but
 *  "who is signed in"). */
export const membershipKey = (communityId: string) => ['communities', communityId, 'membership'] as const
export const MY_SCHOOLS = ['my-schools'] as const
export const waitingKey = (communityId: string) => ['communities', communityId, 'waiting'] as const

/** "1992–1998 · Finished here" (one year: "1998 · Left before the end"). */
export const yearsText = (m: SchoolYears) =>
  `${m.fromYear === m.toYear ? m.fromYear : `${m.fromYear}–${m.toYear}`} · ${m.finished ? 'Finished here' : 'Left before the end'}`

/** Who vouched, as words: "Nse U. and Utibe E." ("Nse U., Utibe E. and Ada O." for three). */
export const namesText = (names: string[]) =>
  names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`

/** Ends a sentence with a dot, unless it already ends with one ("… Utibe E."). */
const endSentence = (text: string) => (text.endsWith('.') ? text : `${text}.`)

/**
 * Where you stand at a school: "Confirmed by Nse U. and Utibe E." (an admin: "Confirmed by Msanga"); while joined,
 * how to get confirmed, or "Nse U. knows you. One more classmate to go."
 */
export function confirmationText(m: Pick<Membership, 'status' | 'vouchedBy'>): string {
  // Short names end with a dot ("Utibe E."): no second dot after them
  if (m.status === 'Confirmed') return endSentence(`Confirmed by ${m.vouchedBy.length ? namesText(m.vouchedBy) : 'Msanga'}`)
  if (m.vouchedBy.length === 0) {
    return 'Not confirmed yet. Ask classmates who are already on Msanga (your WhatsApp group, say) to find you here ' +
      'and say "I know them". Two are enough.'
  }
  return `${namesText(m.vouchedBy)} ${m.vouchedBy.length === 1 ? 'knows' : 'know'} you. One more classmate to go.`
}

/** "1999 Set · 1993–1999 · Red House" for a person (what schoolmates see). */
export const personText = (p: Pick<Person, 'setName' | 'fromYear' | 'toYear' | 'house' | 'classArm' | 'department'>) =>
  [p.setName, p.fromYear === p.toYear ? String(p.fromYear) : `${p.fromYear}–${p.toYear}`, p.house, p.classArm,
   p.department].filter(Boolean).join(' · ')

/** "Blue House · SS3B" (the details given, in order; "" if none). */
export const detailsText = (m: Pick<Membership, 'house' | 'classArm' | 'hostel' | 'department'>) =>
  [m.house, m.classArm, m.hostel, m.department].filter(Boolean).join(' · ')

const countryNames = new Intl.DisplayNames(['en-GB'], { type: 'region' })

/** "Ikot Ekpene, Akwa Ibom" in Nigeria; elsewhere with the country: "Croydon, Greater London, United Kingdom".
 *  A state named like its town is said once: "Enugu", not "Enugu, Enugu". */
export function placeOf(school: Pick<Community, 'town' | 'state' | 'countryCode'>): string {
  const country = school.countryCode === 'NG' ? null : (countryNames.of(school.countryCode) ?? school.countryCode)
  const state = school.state?.toLowerCase() === school.town.toLowerCase() ? null : school.state
  return [school.town, state, country].filter(Boolean).join(', ')
}

/** "Secondary school · Ikot Ekpene, Akwa Ibom". */
export const levelAndPlace = (school: Community) => `${LEVEL_LABELS[school.level]} · ${placeOf(school)}`

/**
 * The value, once it has stopped changing for `delayMs`: the search waits until you pause typing, so a slow
 * connection isn't asked for "f", "fg", "fgc"… one after another.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [settled, setSettled] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return settled
}
