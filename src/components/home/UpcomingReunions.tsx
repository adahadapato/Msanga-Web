import { CalendarDays, Check, Globe, MapPin } from 'lucide-react'
import type { MockReunion } from '../../mock/homeData'
import { formatEventDate } from './format'
import { SectionHeader } from './SectionHeader'

/**
 * Upcoming reunions with your answer: "Going" (a badge with a tick AND the word, never colour alone), or a Join /
 * Register button whose full name includes the event ("Join University Alumni Meet").
 */
export function UpcomingReunions({ reunions }: { reunions: MockReunion[] }) {
  return (
    <section className="panel" aria-labelledby="reunions-heading">
      <SectionHeader id="reunions-heading" title="Upcoming Reunions" seeAllHref="/events" seeAllWhat="reunions and events" />
      <ul className="reunion-list">
        {reunions.map((r) => (
          <li key={r.id} className="reunion">
            <img className="reunion-picture" src={r.picture} alt="" loading="lazy" />
            <div className="reunion-body">
              <h3>{r.title}</h3>
              <p className="reunion-line">
                <CalendarDays size={16} aria-hidden="true" /> <time dateTime={r.date}>{formatEventDate(r.date)}</time>
              </p>
              <p className="reunion-line">
                {r.isOnline ? <Globe size={16} aria-hidden="true" /> : <MapPin size={16} aria-hidden="true" />} {r.place}
              </p>
            </div>
            <div className="reunion-action">
              {r.rsvp === 'going' && (
                <span className="badge-going">Going <Check size={16} aria-hidden="true" /></span>
              )}
              {r.rsvp === 'invited' && (
                <button type="button" className="button button-small">
                  Join{' '}<span className="visually-hidden">{r.title}</span>
                </button>
              )}
              {r.rsvp === 'open' && (
                <button type="button" className="button button-small button-soft">
                  Register{' '}<span className="visually-hidden">for {r.title}</span>
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
