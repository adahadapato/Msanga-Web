import { useEffect, useState } from 'react'
import type { Community, CommunityLevel } from '../../api/communities'

/** How each level is shown (decided 13 Nov 2026: "University / Polytechnic" for tertiary). */
export const LEVEL_LABELS: Record<CommunityLevel, string> = {
  Primary: 'Primary school',
  Secondary: 'Secondary school',
  Tertiary: 'University / Polytechnic',
}

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
