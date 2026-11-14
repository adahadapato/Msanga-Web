import { GraduationCap } from 'lucide-react'
import { Link } from 'react-router'
import type { Community } from '../../api/communities'
import { levelAndPlace } from './schoolText'

/** One school in a list of results: its name (the link), level and place, "New", and its other names. The school
 *  goes along with the link, so its page shows at once without asking the API again. */
export function SchoolResult({ school }: { school: Community }) {
  return (
    <li className="school-result">
      <GraduationCap size={28} aria-hidden="true" className="school-result-icon" />
      <div>
        <p className="school-result-name">
          <Link to={`/schools/${school.id}`} state={{ school }}>{school.name}</Link>
          {school.isNew && <NewLabel />}
        </p>
        <p className="muted">{levelAndPlace(school)}</p>
        {school.otherNames.length > 0 && (
          <p className="muted">Also known as {school.otherNames.join(', ')}</p>
        )}
      </div>
    </li>
  )
}

/** "New": added by a member and not checked yet (the explanation is read out, and shown as a tooltip). */
export function NewLabel() {
  return (
    <span className="school-new" title="Added by a member, not checked yet">
      New<span className="visually-hidden">: added by a member, not checked yet</span>
    </span>
  )
}
