import { MemoryWall } from '../components/home/MemoryWall'
import { MySets } from '../components/home/MySets'
import { ProfileCard } from '../components/home/ProfileCard'
import { QuickActions } from '../components/home/QuickActions'
import { ThenAndNow } from '../components/home/ThenAndNow'
import { UpcomingReunions } from '../components/home/UpcomingReunions'
import { WelcomeHero } from '../components/home/WelcomeHero'
import { usePageTitle } from '../components/layout/page'
import { useMember } from '../auth/useSession'
import { memories, reunions, sets } from '../mock/homeData'

/**
 * Home: you are the signed-in member (W2); sets, reunions and memories are made up (src/mock/homeData.ts) until the
 * API has them. Wide screens: the main column (welcome,
 * quick actions, your sets, memories) and a side column (your card, reunions, Then & Now). Phones: one column, as
 * in the phone mock-up (greeting, four tiles, sets, reunions, Then & Now); your card is the Profile tab there.
 * The connection check moved to Settings (W1).
 */
export function HomePage() {
  const member = useMember()
  usePageTitle('Home')
  return (
    <div className="home">
      <div className="home-main">
        <WelcomeHero member={member} />
        <QuickActions />
        <MySets sets={sets} />
        <MemoryWall memories={memories} />
      </div>
      <div className="home-side">
        <span className="wide-only"><ProfileCard member={member} /></span>
        <UpcomingReunions reunions={reunions} />
        <ThenAndNow />
      </div>
    </div>
  )
}
