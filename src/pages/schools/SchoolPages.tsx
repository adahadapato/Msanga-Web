import { useQuery } from '@tanstack/react-query'
import { GraduationCap, Search, UsersRound } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router'
import { communitiesApi, type Community } from '../../api/communities'
import { ApiError } from '../../api/http'
import { usePageTitle } from '../../components/layout/page'
import { NewLabel } from '../../components/schools/SchoolResult'
import { levelAndPlace } from '../../components/schools/schoolText'

/**
 * A school's page: its name, level and place, its other names. Its sets (Class of 1998…) come in M3.
 * Opened from a result, it shows at once (the result came along with the link) and is checked with the API.
 */
export function SchoolPage() {
  const { schoolId = '' } = useParams()
  const fromResult = (useLocation().state as { school?: Community } | null)?.school
  const school = useQuery({
    queryKey: ['communities', schoolId],
    queryFn: ({ signal }) => communitiesApi.get(schoolId, signal),
    placeholderData: fromResult?.id === schoolId ? fromResult : undefined,
    staleTime: 5 * 60_000,
  })
  const notFound = school.error instanceof ApiError && school.error.status === 404
  usePageTitle(school.data?.name ?? (notFound ? 'School not found' : 'School'))

  if (school.data) {
    const s = school.data
    return (
      <div className="schools-page">
        <section className="panel school-head" aria-labelledby="school-title">
          <GraduationCap size={40} aria-hidden="true" className="school-head-icon" />
          <div>
            <h1 id="school-title">{s.name}</h1>
            <p className="muted">{levelAndPlace(s)} {s.isNew && <NewLabel />}</p>
            {s.otherNames.length > 0 && <p>Also known as <strong>{s.otherNames.join(', ')}</strong></p>}
          </div>
        </section>

        <section className="panel" aria-labelledby="school-sets-title">
          <h2 id="school-sets-title"><UsersRound size={22} aria-hidden="true" /> Sets</h2>
          <p>
            Soon you'll find your set here (Class of 1998, say), join it, and see who else from your year is on
            Msanga.
          </p>
          <p className="muted">Sets come in the next part of Msanga.</p>
        </section>

        <p><Link to="/schools/find">Find another school</Link></p>
      </div>
    )
  }

  return (
    <section className="panel coming-soon" aria-labelledby="school-title">
      <GraduationCap size={40} aria-hidden="true" />
      {notFound ? (
        <>
          <h1 id="school-title">School not found</h1>
          <p>We couldn't find that school. It may have been removed, or the address isn't quite right.</p>
          <Link to="/schools/find" className="button button-soft">Find your school</Link>
        </>
      ) : school.isError ? (
        <>
          <h1 id="school-title">School</h1>
          <p role="alert">{school.error.message}</p>
          <button type="button" className="button button-soft" onClick={() => school.refetch()}>Try again</button>
        </>
      ) : (
        <>
          <h1 id="school-title">School</h1>
          <p role="status">Loading the school…</p>
        </>
      )}
    </section>
  )
}

/**
 * My Schools: the schools of the sets you've joined. Joining comes with sets (M3), so for now this starts you off
 * with Find your school.
 */
export function MySchoolsPage() {
  usePageTitle('My Schools')
  return (
    <section className="panel coming-soon" aria-labelledby="my-schools-title">
      <GraduationCap size={40} aria-hidden="true" />
      <h1 id="my-schools-title">My Schools</h1>
      <p>You haven't joined a school's set yet. Start by finding your school.</p>
      <Link to="/schools/find" className="button">
        <Search size={18} aria-hidden="true" /> Find your school
      </Link>
    </section>
  )
}
