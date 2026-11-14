import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, UserRoundCheck } from 'lucide-react'
import { useState } from 'react'
import { membershipApi, type Community, type Person } from '../../api/communities'
import { membershipKey, personText, waitingKey } from './schoolText'

/**
 * "People waiting to be confirmed" on a school's page, for those who may vouch (confirmed, or the school's early
 * days). Each person: name, school surname, set, years, house / department; **I know them**. Two vouches confirm them.
 *
 * What happened is announced (role="status"); the focus stays where it was (the button is replaced by "You know
 * them", which is read out).
 */
export function WaitingPanel({ school }: { school: Community }) {
  const client = useQueryClient()
  const membership = useQuery({
    queryKey: membershipKey(school.id),
    queryFn: ({ signal }) => membershipApi.mine(school.id, signal),
    staleTime: 5 * 60_000,
  })
  const mayVouch = membership.data?.canVouch === true
  const waiting = useQuery({
    queryKey: waitingKey(school.id),
    queryFn: ({ signal }) => membershipApi.waiting(school.id, signal),
    enabled: mayVouch,
  })
  const [said, setSaid] = useState('')

  const vouch = useMutation({
    mutationFn: (person: Person) => membershipApi.vouch(school.id, person.memberId),
    onSuccess: ({ nowConfirmed }, person) => {
      setSaid(nowConfirmed
        ? `Thank you. ${person.name} is confirmed now.`
        : `Thank you. ${person.name} needs one more classmate to say they know them.`)
      // Confirmed people leave the list; the others show "You know them"
      client.setQueryData<Person[]>(waitingKey(school.id), (list) => list
        ?.filter((p) => !(nowConfirmed && p.memberId === person.memberId))
        .map((p) => (p.memberId === person.memberId ? { ...p, youVouched: true } : p)))
      void client.invalidateQueries({ queryKey: ['communities', school.id, 'sets'] })
    },
    onError: (error) => setSaid(error.message),
  })

  if (!mayVouch) return null
  const joinedOnly = membership.data?.status === 'Joined'

  return (
    <section className="panel" aria-labelledby="waiting-title">
      <h2 id="waiting-title" className="heading-with-icon">
        <UserRoundCheck size={22} aria-hidden="true" /> People waiting to be confirmed
      </h2>
      <p>
        Do you know them from {school.name}, from any year? Say so: two classmates are enough to confirm someone.
        Only say it if you're sure.
      </p>
      {joinedOnly && (
        <p className="muted">
          This school is just starting on Msanga, so you can vouch for people before you're confirmed yourself.
        </p>
      )}
      <p role="status" className="form-status form-status-good">{said}</p>

      {waiting.isPending && <p>Loading…</p>}
      {waiting.isError && (
        <div className="form-status form-status-problem">
          <p>{waiting.error.message}</p>
          <button type="button" className="button button-soft" onClick={() => waiting.refetch()}>Try again</button>
        </div>
      )}
      {waiting.data?.length === 0 && <p>Nobody is waiting right now.</p>}

      {waiting.data && waiting.data.length > 0 && (
        <ul className="people" aria-label="People waiting">
          {waiting.data.map((person) => (
            <li key={person.memberId} className="person">
              <div>
                <p className="person-name">
                  {person.name}
                  {person.schoolSurname && <span className="muted"> (at school: {person.schoolSurname})</span>}
                </p>
                <p className="muted">{personText(person)}</p>
              </div>
              {person.youVouched ? (
                <p className="person-vouched"><Check size={18} aria-hidden="true" /> You know them</p>
              ) : (
                <button
                  type="button"
                  className="button button-soft"
                  aria-disabled={vouch.isPending}
                  onClick={() => !vouch.isPending && vouch.mutate(person)}
                >
                  {/* Read out as "I know them: Nse Udo" (the words on the button come first: WCAG 2.5.3) */}
                  I know them<span className="visually-hidden">: {person.name}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
