import { scenes } from '../../mock/homeData'

/**
 * The welcome banner, as in the mock-up: the words on a soft lilac background on the left, the picture of friends on
 * the school lawn fading in from the right, and a violet wave along the bottom. The h1 is the page's only h1; the
 * picture and wave are decoration (alt="", aria-hidden). The fade is wide enough that the words never sit on the
 * picture, so they stay readable (Midnight on lilac ≥ 14:1).
 */
export function WelcomeHero() {
  return (
    <section className="hero" aria-labelledby="welcome-heading">
      <img className="hero-picture" src={scenes.hero} alt="" />
      <svg className="hero-wave" viewBox="0 0 800 90" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="hero-wave-fill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8e2de2" />
            <stop offset="0.45" stopColor="#b77cf0" />
            <stop offset="0.8" stopColor="#d9b3ff" stopOpacity="0.6" />
            <stop offset="1" stopColor="#d9b3ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 60 C 160 20, 330 25, 470 55 S 690 95, 800 70 V 90 H 0 Z" fill="url(#hero-wave-fill)" />
      </svg>
      <div className="hero-text">
        <h1 id="welcome-heading"><span className="nowrap">Welcome back to</span> Msanga!</h1>
        <p>The home for school reunions, classmates and shared memories.</p>
      </div>
    </section>
  )
}
