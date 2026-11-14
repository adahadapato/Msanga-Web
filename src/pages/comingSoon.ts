/** The menu's places that come later, each saying when, so no link leads nowhere (signed-in pages). `back` is where
 *  its button goes instead of Home, when there's a better first step. */
export const COMING_SOON: { path: string; title: string; when: string; back?: { to: string; label: string } }[] = [
  { path: '/sets', title: 'My Sets', when: 'with sets (M3)' },
  { path: '/sets/:setId', title: 'School set', when: 'with sets (M3)' },
  { path: '/find', title: 'Find Classmates', when: 'with sets (M3): you\'ll find classmates through your school\'s sets',
    back: { to: '/schools/find', label: 'Find your school first' } },
  { path: '/events', title: 'Reunions & Events', when: 'with the reunion planner' },
  { path: '/events/new', title: 'Create a reunion', when: 'with the reunion planner' },
  { path: '/memories', title: 'Memories', when: 'with the Memory Wall' },
  { path: '/memories/new', title: 'Share a memory', when: 'with the Memory Wall' },
  { path: '/groups', title: 'Groups', when: 'with sets (M3)' },
  { path: '/messages', title: 'Messages', when: 'with messaging' },
  { path: '/notifications', title: 'Notifications', when: 'with messaging' },
]
