/** The menu's places that come later, each saying when, so no link leads nowhere (signed-in pages). */
export const COMING_SOON: { path: string; title: string; when: string }[] = [
  { path: '/profile', title: 'Your profile', when: 'with accounts (W5)' },
  { path: '/schools', title: 'My Schools', when: 'with communities and sets (M2–M3)' },
  { path: '/sets', title: 'My Sets', when: 'with communities and sets (M2–M3)' },
  { path: '/sets/:setId', title: 'School set', when: 'with communities and sets (M2–M3)' },
  { path: '/find', title: 'Find Classmates', when: 'with communities and sets (M2–M3)' },
  { path: '/events', title: 'Reunions & Events', when: 'with the reunion planner' },
  { path: '/events/new', title: 'Create a reunion', when: 'with the reunion planner' },
  { path: '/memories', title: 'Memories', when: 'with the Memory Wall' },
  { path: '/memories/new', title: 'Share a memory', when: 'with the Memory Wall' },
  { path: '/groups', title: 'Groups', when: 'with communities and sets (M2–M3)' },
  { path: '/messages', title: 'Messages', when: 'with messaging' },
  { path: '/notifications', title: 'Notifications', when: 'with messaging' },
]
