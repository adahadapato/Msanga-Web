import type { Member } from '../../api/auth'
import { scenes } from '../../mock/homeData'
import { Avatar } from '../ui/Avatar'

/**
 * The welcome banner, as in the mock-ups. Wide screens: the words on soft lilac on the left, the picture of friends
 * on the school lawn on the right (it starts after the words, so they never sit on the photo), and a violet wave
 * along the bottom. Phones: the phone mock-up's greeting instead: your photo, "Welcome back, Hilary!" and one line.
 * The h1 is the page's only h1; the picture, wave and photo are decoration.
 */
export function WelcomeHero({ member }: { member: Member }) {
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
        <span className="hero-avatar"><Avatar name={member.displayName} photo={member.photo} size="lg" /></span>
        <div>
          <h1 id="welcome-heading">Welcome back, <span className="nowrap">{member.firstName}!</span></h1>
          <p>
            <span className="hero-line-wide">The home for school reunions, classmates and shared memories.</span>
            <span className="hero-line-phone">Ready to reconnect?</span>
          </p>
        </div>
      </div>
    </section>
  )
}
