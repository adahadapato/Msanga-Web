import { createContext } from 'react'
import type { Member } from '../api/auth'

/**
 * The signed-in member, handed down by RequireMember to the pages it shows. Pages read it with useMember(). Because
 * RequireMember only shows its pages while there IS a member, a page can never see "no member" (e.g. in the moment
 * between signing out and the Sign in page).
 */
export const MemberContext = createContext<Member | null>(null)
