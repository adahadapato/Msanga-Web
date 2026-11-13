import { Link } from 'react-router'
import { Pencil } from 'lucide-react'
import type { Member } from '../../api/auth'
import { Avatar } from '../ui/Avatar'

/** Your card: name, your main set and a link to your profile. No follower or connection counts (Msanga's promise). */
export function ProfileCard({ member }: { member: Member }) {
  return (
    <section className="panel profile-card" aria-labelledby="profile-heading">
      <Avatar name={member.displayName} photo={member.photo} size="lg" />
      <div>
        <h2 id="profile-heading">{member.displayName}</h2>
        <p className="muted">{member.mainSet ?? 'Not in a set yet'}</p>
        <Link to="/profile" className="button button-small">
          <Pencil size={16} aria-hidden="true" /> View profile
        </Link>
      </div>
    </section>
  )
}
