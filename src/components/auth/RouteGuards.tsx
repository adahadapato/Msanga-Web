import { Navigate, Outlet, useLocation } from 'react-router'
import { MemberContext } from '../../auth/memberContext'
import { useMe } from '../../auth/useSession'
import { safeReturnPath } from '../layout/page'

function Loading() {
  return <p className="page-loading" role="status">Loading Msanga…</p>
}

/** The API couldn't be reached while checking the session: say so, with Try again (the token is kept). */
function Unreachable({ retry }: { retry: () => void }) {
  return (
    <main id="main" className="page-loading">
      <h1>Can't reach Msanga right now</h1>
      <p>Check your internet connection and try again.</p>
      <button type="button" className="button" onClick={retry}>Try again</button>
    </main>
  )
}

/**
 * Pages for signed-in members only, handed the member (useMember). Signed out: Sign in, which brings you back to the
 * page afterwards.
 */
export function RequireMember() {
  const { data: member, isPending, isError, refetch } = useMe()
  const location = useLocation()

  if (isPending) return <Loading />
  if (isError) return <Unreachable retry={() => void refetch()} />
  if (!member) return <Navigate to="/sign-in" replace state={{ from: location.pathname + location.search }} />
  return (
    <MemberContext.Provider value={member}>
      <Outlet />
    </MemberContext.Provider>
  )
}

/** Sign in (and later Create account, Forgot password): once signed in, go on to where you were heading, or Home. */
export function RedirectIfMember() {
  const { data: member, isPending } = useMe()
  const location = useLocation()

  if (isPending) return <Loading />
  if (member) return <Navigate to={safeReturnPath((location.state as { from?: string } | null)?.from)} replace />
  return <Outlet />
}
