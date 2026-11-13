import { Link } from 'react-router'
import { UsersRound } from 'lucide-react'
import type { MockSet } from '../../mock/homeData'
import { formatCount } from './format'
import { SectionHeader } from './SectionHeader'

/**
 * "My School Sets": the sets the member belongs to, each with its picture, member count and an Open link. The heart
 * of Msanga (walking back into your old classroom). A set's member count is shown; personal counts never are.
 */
export function MySets({ sets }: { sets: MockSet[] }) {
  return (
    <section className="panel" aria-labelledby="my-sets-heading">
      <SectionHeader id="my-sets-heading" title="My School Sets" seeAllHref="/sets" seeAllWhat="school sets" />
      <ul className="set-cards">
        {sets.map((s) => (
          <li key={s.id} className="set-card">
            <img className="set-card-picture" src={s.picture} alt="" loading="lazy" />
            <div className="set-card-body">
              <h3>{s.community}</h3>
              <p className="muted">{s.set}</p>
              <div className="set-card-footer">
                <span className="set-card-members">
                  <UsersRound size={18} aria-hidden="true" /> {formatCount(s.members)} members
                </span>
                <Link to={`/sets/${s.id}`} className="pill-link">
                  Open{' '}<span className="visually-hidden">{s.community}, {s.set}</span>
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
