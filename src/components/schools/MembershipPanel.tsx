import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CircleCheck } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  EARLIEST_YEAR, MAX_YEARS_AT_ONE_SCHOOL, membershipApi, type Community, type Membership, type SchoolYears,
} from '../../api/communities'
import { ErrorSummary, RadioGroup, SelectField } from '../forms/fields'
import { formValues, problemFor, type FieldProblem } from '../forms/formHelpers'
import { useFormProblems } from '../forms/useFormProblems'
import { Link } from 'react-router'
import { confirmationText, detailsText, membershipKey, MY_SCHOOLS, yearsText } from './schoolText'
import { SetForm } from './SetForm'

/**
 * On a school's page: "Were you a student here?" (join with your years), or "You were a student here" (your years,
 * your set and details, Change years, Leave this school). Joining goes straight on to "Your set". Only ever about the
 * signed-in member.
 *
 * Focus: opening the form goes to its first field; after saving, joining or cancelling, the focus returns to this
 * box's heading, and what happened is announced (role="status").
 */
export function MembershipPanel({ school }: { school: Community }) {
  const client = useQueryClient()
  const key = membershipKey(school.id)
  const membership = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => membershipApi.mine(school.id, signal),
    staleTime: 5 * 60_000,
  })
  const [mode, setMode] = useState<'view' | 'form' | 'set' | 'leave'>('view')
  const [said, setSaid] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  const leaveQuestion = useRef<HTMLParagraphElement>(null)

  const backToView = (message = '') => {
    setMode('view')
    setSaid(message)
    heading.current?.focus()   // the heading is always there, so the focus can move at once
  }

  /** Shows a saved answer at once (keeping who vouched, which only GET sends), then asks again for the full one. */
  const remember = (m: Membership | null) => {
    client.setQueryData<Membership | null>(key, (before) =>
      m && before ? { ...m, vouchedBy: before.vouchedBy, canVouch: before.canVouch } : m)
    void client.invalidateQueries({ queryKey: key })
    void client.invalidateQueries({ queryKey: MY_SCHOOLS })
  }

  const leave = useMutation({
    mutationFn: () => membershipApi.leave(school.id),
    onSuccess: () => {
      remember(null)
      backToView(`You've left ${school.name}.`)
    },
  })

  useEffect(() => {
    if (mode === 'leave') leaveQuestion.current?.focus()
  }, [mode])

  const mine = membership.data
  const title = mine ? 'You were a student here' : 'Were you a student here?'

  return (
    <section className="panel membership" aria-labelledby="membership-title">
      <h2 id="membership-title" ref={heading} tabIndex={-1}>
        {mine && <CircleCheck size={22} aria-hidden="true" />} {title}
      </h2>
      <p role="status" className="form-status form-status-good">{said}</p>

      {membership.isPending && <p>Checking…</p>}

      {membership.isError && (
        <div className="form-status form-status-problem">
          <p>{membership.error.message}</p>
          <button type="button" className="button button-soft" onClick={() => membership.refetch()}>Try again</button>
        </div>
      )}

      {mode === 'form' && membership.isSuccess && (
        <SchoolYearsForm
          initial={mine ?? undefined}
          submitLabel={mine ? 'Save years' : 'Join this school'}
          onCancel={() => backToView()}
          onSave={async (years) => {
            const saved = mine ? await membershipApi.change(school.id, years) : await membershipApi.join(school.id, years)
            remember(saved)
            if (mine) {
              backToView(saved.setYear === null && mine.setYear !== null
                ? 'Your years are saved. Your set no longer fits them: choose it again.'
                : 'Your years are saved.')
            } else {
              setMode('set')   // the set form takes the focus
              setSaid(`You've joined ${school.name}. Now choose your set.`)
            }
          }}
        />
      )}

      {mode !== 'form' && membership.isSuccess && !mine && (
        <>
          <p>Join it with the years you were there. Classmates from any year will be able to find and confirm you.</p>
          <button type="button" className="button" onClick={() => setMode('form')}>Yes, I was a student here</button>
        </>
      )}

      {mode === 'set' && mine && (
        <SetForm
          membership={mine}
          onCancel={() => backToView()}
          onSave={async (set) => {
            remember(await membershipApi.chooseSet(school.id, set))
            backToView('Your set is saved.')
          }}
        />
      )}

      {mode === 'view' && mine && (
        <>
          <p className="membership-years">{yearsText(mine)}</p>
          {mine.setName && mine.setYear !== null ? (
            <p className="membership-set">
              Your set: <Link to={`/schools/${school.id}/sets/${mine.setYear}`}>{mine.setName}</Link>
              {detailsText(mine) && <span className="muted"> · {detailsText(mine)}</span>}
            </p>
          ) : (
            <p>You haven't chosen your set yet.</p>
          )}
          <p className={mine.status === 'Confirmed' ? 'membership-confirmed' : 'muted'}>{confirmationText(mine)}</p>
          <div className="form-buttons">
            <button type="button" className={mine.setName ? 'button button-soft' : 'button'} onClick={() => setMode('set')}>
              {mine.setName ? 'Change your set' : 'Choose your set'}
            </button>
            <button type="button" className="button button-soft" onClick={() => setMode('form')}>Change years</button>
            <button type="button" className="button button-outline" onClick={() => setMode('leave')}>
              Leave this school
            </button>
          </div>
        </>
      )}

      {mode === 'leave' && mine && (
        <div className="membership-leave">
          <p ref={leaveQuestion} tabIndex={-1}>
            <strong>Leave {school.name}?</strong> Your years here will be removed. You can join again later.
          </p>
          {leave.isError && <p className="form-status form-status-problem" role="alert">{leave.error.message}</p>}
          <div className="form-buttons">
            <button type="button" className="button button-danger" aria-disabled={leave.isPending}
                    onClick={() => !leave.isPending && leave.mutate()}>
              {leave.isPending ? 'Leaving…' : 'Yes, leave'}
            </button>
            <button type="button" className="button button-outline" onClick={() => backToView()}>Keep it</button>
          </div>
        </div>
      )}
    </section>
  )
}

/**
 * The years form: started, left (lists from this year back to 1940) and "Did you finish here?". Checked here with
 * the API's rules and messages; the API's own answer (400) is shown the same way.
 */
function SchoolYearsForm({ initial, submitLabel, onSave, onCancel }: {
  initial?: SchoolYears
  submitLabel: string
  onSave: (years: SchoolYears) => Promise<void>
  onCancel: () => void
}) {
  const form = useFormProblems()
  const [saving, setSaving] = useState(false)
  const firstField = useRef<HTMLSelectElement>(null)
  const [thisYear] = useState(() => new Date().getFullYear())   // read once, when the form opens
  const years = Array.from({ length: thisYear - EARLIEST_YEAR + 1 }, (_, i) => String(thisYear - i))
  const options = years.map((y) => ({ value: y, label: y }))

  useEffect(() => firstField.current?.focus(), [])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const v = formValues(event.currentTarget)
    const from = Number(v.fromYear)
    const to = Number(v.toYear)

    const found: FieldProblem[] = []
    if (!v.fromYear) found.push({ field: 'fromYear', message: 'Choose the year you started' })
    if (!v.toYear) found.push({ field: 'toYear', message: 'Choose the year you left' })
    else if (v.fromYear && to < from) {
      found.push({ field: 'toYear', message: "The year you left can't be before the year you started" })
    } else if (v.fromYear && to - from + 1 > MAX_YEARS_AT_ONE_SCHOOL) {
      found.push({ field: 'toYear', message: `That's more than ${MAX_YEARS_AT_ONE_SCHOOL} years at one school. Check the years` })
    }
    if (!v.finished) found.push({ field: 'finished', message: 'Say whether you finished here' })
    if (found.length) return form.show(found)

    setSaving(true)
    try {
      await onSave({ fromYear: from, toYear: to, finished: v.finished === 'yes' })
    } catch (error) {
      form.showApiError(error)
      setSaving(false)
    }
  }

  return (
    <>
      <ErrorSummary problems={form.problems} message={form.message} attempt={form.attempt} />
      <form className="form membership-form" noValidate onSubmit={onSubmit}>
        <div className="membership-years-fields">
          <SelectField ref={firstField} id="fromYear" label="Year you started" placeholder="Choose" options={options}
                       defaultValue={initial ? String(initial.fromYear) : ''}
                       error={problemFor(form.problems, 'fromYear')} />
          <SelectField id="toYear" label="Year you left" placeholder="Choose" options={options}
                       defaultValue={initial ? String(initial.toYear) : ''}
                       error={problemFor(form.problems, 'toYear')} />
        </div>
        <RadioGroup
          name="finished"
          legend="Did you finish here?"
          options={[{ value: 'yes', label: 'Yes, I finished here' }, { value: 'no', label: 'No, I left before the end' }]}
          defaultValue={initial ? (initial.finished ? 'yes' : 'no') : undefined}
          error={problemFor(form.problems, 'finished')}
        />
        <div className="form-buttons">
          <button type="submit" className="button" aria-disabled={saving}>{saving ? 'Saving…' : submitLabel}</button>
          <button type="button" className="button button-outline" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </>
  )
}
