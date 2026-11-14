import { useQuery } from '@tanstack/react-query'
import { GraduationCap, Search, UsersRound } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router'
import { communitiesApi, membershipApi, type Community } from '../../api/communities'
import { ApiError } from '../../api/http'
import { usePageTitle } from '../../components/layout/page'
import { MembershipPanel } from '../../components/schools/MembershipPanel'
import { NewLabel, SchoolResult } from '../../components/schools/SchoolResult'
import { detailsText, levelAndPlace, MY_SCHOOLS, personText } from '../../components/schools/schoolText'
import { WaitingPanel } from '../../components/schools/WaitingPanel'

/**
 * A school's page: its name, level and place, its other names; "Were you a student here?" with your set
 * (MembershipPanel); how its sets are named.
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
        <WaitingPanel school={s} />

        <section className="panel" aria-labelledby="school-sets-title">
          <h2 id="school-sets-title"><UsersRound size={22} aria-hidden="true" /> Sets</h2>
          <p>
            Each year here is a set, named by the year students{' '}
            {s.setNaming === 'ByEntryYear' ? 'came in' : 'left'}: the 1998 Set, the 1999 Set… Open your set to see
            who's there; you see names once classmates have confirmed you.
          </p>
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
                <p className="membership-years">
                  You: {m.fromYear === m.toYear ? m.fromYear : `${m.fromYear}–${m.toYear}`} ·{' '}
                  {m.setName && m.setYear !== null
                    ? <Link to={`/schools/${m.school.id}/sets/${m.setYear}`}>{m.setName}</Link>
                    : 'set not chosen yet'}
                  {detailsText(m) && <span className="muted"> · {detailsText(m)}</span>}
                </p>
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

/**
 * A set's page: "1998 Set" at a school. Only for people who joined the school (the API answers 403 otherwise). Who's
 * in it shows once classmates can confirm each other (M3c): until then, nobody is listed.
 */
export function SetPage() {
  const { schoolId = '', year = '' } = useParams()
  const set = useQuery({
    queryKey: ['communities', schoolId, 'sets', year],
    queryFn: ({ signal }) => membershipApi.set(schoolId, Number(year), signal),
    staleTime: 5 * 60_000,
  })
  const error = set.error instanceof ApiError ? set.error : undefined
  usePageTitle(set.data ? `${set.data.name}, ${set.data.school.name}` : `${year} Set`)

  if (set.data) {
    const s = set.data
    return (
      <div className="schools-page">
        <section className="panel" aria-labelledby="set-title">
          <h1 id="set-title" className="heading-with-icon"><UsersRound size={32} aria-hidden="true" /> {s.name}</h1>
          <p className="muted">
            at <Link to={`/schools/${s.school.id}`}>{s.school.name}</Link>
          </p>
          {s.isMine && <p className="membership-years">This is your set.</p>}
        </section>
        <section className="panel" aria-labelledby="set-people-title">
          <h2 id="set-people-title">Who's here</h2>
          {!s.canSeeMembers ? (
            <p>
              You'll see who's here once classmates have confirmed you. Until then, nobody's name is shown to you,
              and yours isn't shown to others.
            </p>
          ) : s.members.length === 0 ? (
            <p>Nobody from the {s.name} is confirmed yet. Classmates show here once two people say they know them.</p>
          ) : (
            <ul className="people" aria-label={`Confirmed members of the ${s.name}`}>
              {s.members.map((person) => (
                <li key={person.memberId} className="person">
                  <div>
                    <p className="person-name">
                      {person.name}
                      {person.schoolSurname && <span className="muted"> (at school: {person.schoolSurname})</span>}
                    </p>
                    <p className="muted">{personText(person)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    )
  }

  return (
    <section className="panel coming-soon" aria-labelledby="set-title">
      <UsersRound size={40} aria-hidden="true" />
      <h1 id="set-title">{year} Set</h1>
      {error?.code === 'Community.MembersOnly' ? (
        <>
          <p>Only people who were students at this school can see its sets.</p>
          <Link to={`/schools/${schoolId}`} className="button button-soft">Go to the school</Link>
        </>
      ) : set.isError ? (
        <>
          <p role="alert">{set.error.message}</p>
          <button type="button" className="button button-soft" onClick={() => set.refetch()}>Try again</button>
        </>
      ) : (
        <p role="status">Loading the set…</p>
      )}
    </section>
  )
}
