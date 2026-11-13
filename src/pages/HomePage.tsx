import { ConnectionCheck } from '../components/ConnectionCheck'
import { MemoryWall } from '../components/home/MemoryWall'
import { MySets } from '../components/home/MySets'
import { ProfileCard } from '../components/home/ProfileCard'
import { QuickActions } from '../components/home/QuickActions'
import { ThenAndNow } from '../components/home/ThenAndNow'
import { UpcomingReunions } from '../components/home/UpcomingReunions'
import { WelcomeHero } from '../components/home/WelcomeHero'
import { member, memories, reunions, sets } from '../mock/homeData'

/**
 * Home (mock-up, made-up data from src/mock/homeData.ts). Wide screens: the main column (welcome, quick actions,
 * your sets, memories) and a side column (your card, reunions, Then & Now). Phones: one column in the same order.
 * The connection check stays at the end while the API is still being built.
 */
export function HomePage() {
  return (
    <div className="home">
      <div className="home-main">
        <WelcomeHero />
        <QuickActions />
        <MySets sets={sets} />
        <MemoryWall memories={memories} />
      </div>
      <div className="home-side">
        <ProfileCard member={member} />
        <UpcomingReunions reunions={reunions} />
        <ThenAndNow />
        <ConnectionCheck />
      </div>
    </div>
  )
}
