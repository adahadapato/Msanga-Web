import { MemoryWall } from '../components/home/MemoryWall'
import { MySets } from '../components/home/MySets'
import { ProfileCard } from '../components/home/ProfileCard'
import { QuickActions } from '../components/home/QuickActions'
import { ThenAndNow } from '../components/home/ThenAndNow'
import { UpcomingReunions } from '../components/home/UpcomingReunions'
import { WelcomeHero } from '../components/home/WelcomeHero'
import { usePageTitle } from '../components/layout/page'
import { member, memories, reunions, sets } from '../mock/homeData'

/**
 * Home (made-up data from src/mock/homeData.ts until the API has it). Wide screens: the main column (welcome,
 * quick actions, your sets, memories) and a side column (your card, reunions, Then & Now). Phones: one column, as
 * in the phone mock-up (greeting, four tiles, sets, reunions, Then & Now); your card is the Profile tab there.
 * The connection check moved to Settings (W1).
 */
export function HomePage() {
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
