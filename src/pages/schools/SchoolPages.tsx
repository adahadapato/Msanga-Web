import { useQuery } from '@tanstack/react-query'
import { GraduationCap, Search, UsersRound } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router'
import { communitiesApi, membershipApi, type Community } from '../../api/communities'
import { ApiError } from '../../api/http'
import { usePageTitle } from '../../components/layout/page'
import { MembershipPanel } from '../../components/schools/MembershipPanel'
import { NewLabel, SchoolResult } from '../../components/schools/SchoolResult'
import { levelAndPlace, MY_SCHOOLS, yearsText } from '../../components/schools/schoolText'

/**
 * A school's page: its name, level and place, its other names; "Were you a student here?" (MembershipPanel). Its
 * sets (Class of 1998…) come in M3b.
 * Opened from a result, it shows at once (the result came along with the link) and is checked with the API.
 */
export function SchoolPage() {
  const { schoolId = '' } = useParams()
  const state = useLocation().state as { school?: Community; added?: boolean } | null
  const fromResult = state?.school
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
        <p role="status" className="form-status form-status-good">
          {state?.added ? 'Your school is added. Classmates can find it now.' : ''}
        </p>
        <section className="panel school-head" aria-labelledby="school-title">
          <GraduationCap size={40} aria-hidden="true" className="school-head-icon" />
          <div>
            <h1 id="school-title">{s.name}</h1>
            <p className="muted">{levelAndPlace(s)} {s.isNew && <NewLabel />}</p>
            {s.otherNames.length > 0 && <p>Also known as <strong>{s.otherNames.join(', ')}</strong></p>}
          </div>
        </section>

        <MembershipPanel school={s} />

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
 * My Schools: the schools you joined, with your years, most recent first; Find your school to add another.
 */
export function MySchoolsPage() {
  usePageTitle('My Schools')
  const mine = useQuery({ queryKey: MY_SCHOOLS, queryFn: ({ signal }) => membershipApi.mySchools(signal) })

  return (
    <div className="schools-page">
      <section className="panel" aria-labelledby="my-schools-title">
        <h1 id="my-schools-title">My Schools</h1>

        {mine.isPending && <p role="status">Loading your schools…</p>}

        {mine.isError && (
          <div className="form-status form-status-problem">
            <p>{mine.error.message}</p>
            <button type="button" className="button button-soft" onClick={() => mine.refetch()}>Try again</button>
          </div>
        )}

        {mine.data?.length === 0 && (
          <p>You haven't joined a school yet. Find the schools you went to: primary, secondary, university.</p>
        )}

        {mine.data && mine.data.length > 0 && (
          <ul className="school-results" aria-label="Your schools">
            {mine.data.map((m) => (
              <SchoolResult key={m.school.id} school={m.school}>
                <p className="membership-years">You: {yearsText(m)}</p>
              </SchoolResult>
            ))}
          </ul>
        )}

        <p>
          <Link to="/schools/find" className="button">
            <Search size={18} aria-hidden="true" /> {mine.data?.length ? 'Find another school' : 'Find your school'}
          </Link>
        </p>
      </section>
    </div>
  )
}
