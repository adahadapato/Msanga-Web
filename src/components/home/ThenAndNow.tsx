import { memories } from '../../mock/homeData'

/** An invitation to share an old school photo next to a recent one. */
export function ThenAndNow() {
  return (
    <section className="then-now" aria-labelledby="then-now-heading">
      <div>
        <h2 id="then-now-heading">Then &amp; Now</h2>
        <p>Share your school memories and stories, an old photo next to a new one.</p>
        <a href="/memories/new" className="then-now-link">Share a memory</a>
      </div>
      <div className="then-now-pictures" aria-hidden="true">
        <img className="then-now-photo then-now-photo-old" src={memories[0].picture} alt="" />
        <img className="then-now-photo then-now-photo-new" src={memories[1].picture} alt="" />
      </div>
    </section>
  )
}
