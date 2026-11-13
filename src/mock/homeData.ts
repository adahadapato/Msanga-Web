/**
 * MADE-UP DATA for the Home page mock-up (13 Nov 2026). Nothing here comes from the API yet.
 *
 * It shows what each part of the page needs, so the API can be built to match:
 *   member      → M1 (accounts)            sets      → M2–M3 (communities and sets)
 *   reunions    → Reunion planner          memories  → Memory Wall
 * When those exist, each list is replaced by a call to the API and this file is deleted.
 * The people, schools and events are invented; any likeness to real ones is accidental.
 *
 * The pictures (public/mock-images) were cut from Enobong's ChatGPT mock-up: AI-made, not photos of real people.
 * Real pictures will be members' own uploads, each with a written description.
 */

/** Where the mock-up's pictures live (public/mock-images, served from the site's root). */
const picture = (name: string) => `/mock-images/${name}.webp`

export interface MockMember {
  firstName: string
  displayName: string
  /** The set shown under the name, e.g. "Class of 1998". */
  mainSet: string
  /** Their profile picture; null = initials. */
  photo: string | null
}

export interface MockSet {
  id: string
  /** The community: a school (later also NYSC, workplaces…). */
  community: string
  /** The set inside it, e.g. "Class of 1998". */
  set: string
  members: number
  /** The set's cover picture. */
  picture: string
}

export type RsvpStatus = 'going' | 'invited' | 'open'

export interface MockReunion {
  id: string
  title: string
  /** ISO date, e.g. "2027-02-20". */
  date: string
  place: string
  isOnline: boolean
  rsvp: RsvpStatus
  picture: string
}

export interface MockMemory {
  id: string
  caption: string
  year: number
  picture: string
}

export const member: MockMember = {
  firstName: 'Hilary',
  displayName: 'Hilary A.',
  mainSet: 'Class of 1998',
  photo: picture('avatar-hilary'),
}

/** The welcome banner and the sidebar's evening scene. */
export const scenes = {
  hero: picture('hero'),
  evening: picture('sidebar-evening'),
}

export const sets: MockSet[] = [
  { id: 'gcl-1998', community: 'Government College, Lagos', set: 'Class of 1998', members: 248, picture: picture('set-gcl') },
  { id: 'uniben-alumni', community: 'University of Benin', set: 'Alumni Network', members: 1542, picture: picture('set-uniben') },
]

export const reunions: MockReunion[] = [
  { id: 'r1', title: 'Class of 1998 Reunion', date: '2027-02-20', place: 'London, UK', isOnline: false, rsvp: 'going', picture: picture('reunion-1998') },
  { id: 'r2', title: 'University Alumni Meet', date: '2027-05-15', place: 'Birmingham, UK', isOnline: false, rsvp: 'invited', picture: picture('reunion-alumni') },
  { id: 'r3', title: 'Msanga Global Reunion', date: '2027-06-27', place: 'Online', isOnline: true, rsvp: 'open', picture: picture('reunion-global') },
]

export const memories: MockMemory[] = [
  { id: 'm1', caption: 'Class photo', year: 1996, picture: picture('memory-class-photo') },
  { id: 'm2', caption: 'Friends after prep', year: 1997, picture: picture('memory-friends') },
  { id: 'm3', caption: 'Inter-house sports', year: 1997, picture: picture('memory-sports') },
  { id: 'm4', caption: 'Our old textbooks', year: 1998, picture: picture('memory-books') },
]
