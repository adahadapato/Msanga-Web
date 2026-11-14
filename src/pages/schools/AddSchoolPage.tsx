import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import {
  communitiesApi, notAddedBecause, type CommunityLevel, type NewCommunity, type NotAdded,
} from '../../api/communities'
import { COUNTRIES, NIGERIA, NIGERIAN_STATES } from '../../data/places'
import { ErrorSummary, RadioGroup, SelectField, TextField } from '../../components/forms/fields'
import { formValues, problemFor, type FieldProblem } from '../../components/forms/formHelpers'
import { useFormProblems } from '../../components/forms/useFormProblems'
import { usePageTitle } from '../../components/layout/page'
import { SchoolResult } from '../../components/schools/SchoolResult'
import { LEVEL_LABELS } from '../../components/schools/schoolText'

/** The most other names (the API's rule too). */
const MAX_OTHER_NAMES = 5

const LEVELS = (Object.keys(LEVEL_LABELS) as CommunityLevel[]).map((value) => ({ value, label: LEVEL_LABELS[value] }))
const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name }))
const STATE_OPTIONS = NIGERIAN_STATES.map((s) => ({ value: s, label: s }))

/**
 * Add your school (POST /api/communities): name, kind, country, state, town, other names. It's marked "New" until
 * an admin checks it (M7).
 *
 * "Did you mean…?": if the API says schools look like it, they're shown ("Is it one of these?") with "No, add my
 * school", which sends the same details again with addAnyway. If it's already listed, that school is shown and there's
 * no way to add a second copy (it would split its classmates).
 *
 * Coming from a search that found nothing, the name starts as what was typed (?name=…).
 */
export function AddSchoolPage() {
  usePageTitle('Add your school')
  const navigate = useNavigate()
  const client = useQueryClient()
  const [params] = useSearchParams()
  const [country, setCountry] = useState(NIGERIA)
  const form = useFormProblems()
  const [notAdded, setNotAdded] = useState<{ reason: NotAdded; sent: NewCommunity }>()
  const add = useMutation({ mutationFn: communitiesApi.add })

  async function send(school: NewCommunity) {
    if (add.isPending) return
    try {
      const added = await add.mutateAsync(school)
      client.setQueryData(['communities', added.id], added)
      await client.invalidateQueries({ queryKey: ['communities', 'search'] })   // searches now find it
      navigate(`/schools/${added.id}`, { state: { school: added, added: true } })
    } catch (error) {
      const reason = notAddedBecause(error)
      if (reason) {
        form.clear()
        setNotAdded({ reason, sent: school })
      } else {
        setNotAdded(undefined)
        form.showApiError(error)
      }
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const v = formValues(event.currentTarget)
    const otherNames = (v.otherNames ?? '').split(',').map((n) => n.trim()).filter(Boolean)

    const found: FieldProblem[] = []
    if (!v.name?.trim()) found.push({ field: 'name', message: "Enter the school's name" })
    if (!v.level) found.push({ field: 'level', message: 'Choose what kind of school it is' })
    if (country === NIGERIA && !v.state) found.push({ field: 'state', message: 'Choose the state' })
    if (!v.town?.trim()) found.push({ field: 'town', message: 'Enter the town or city' })
    if (otherNames.length > MAX_OTHER_NAMES) {
      found.push({ field: 'otherNames', message: `Add up to ${MAX_OTHER_NAMES} other names` })
    }
    if (found.length) {
      setNotAdded(undefined)
      return form.show(found)
    }

    void send({
      name: v.name.trim(), level: v.level as CommunityLevel, town: v.town.trim(), state: (v.state ?? '').trim(),
      countryCode: country, otherNames, addAnyway: false,
    })
  }

  return (
    <div className="schools-page">
      <section className="panel form-panel" aria-labelledby="add-school-title">
        <h1 id="add-school-title">Add your school</h1>
        <p className="muted">
          Check it isn't on Msanga already: <Link to="/schools/find">find your school</Link>. A school you add shows
          as <strong>New</strong> until it's checked.
        </p>

        {notAdded && (
          <NotAddedPanel
            reason={notAdded.reason}
            pending={add.isPending}
            onAddAnyway={() => void send({ ...notAdded.sent, addAnyway: true })}
          />
        )}

        <ErrorSummary problems={form.problems} message={form.message} attempt={form.attempt} />

        <form className="form" noValidate onSubmit={onSubmit}>
          <TextField
            id="name"
            label="School's name"
            hint="Its full name, as on its signboard or your certificate, e.g. Federal Government College, Ikot Ekpene."
            defaultValue={params.get('name') ?? ''}
            autoComplete="off"
            maxLength={150}
            error={problemFor(form.problems, 'name')}
          />
          <RadioGroup name="level" legend="What kind of school?" options={LEVELS}
                      error={problemFor(form.problems, 'level')} />
          <SelectField
            id="countryCode"
            label="Country"
            options={COUNTRY_OPTIONS}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            error={problemFor(form.problems, 'countryCode')}
          />
          {country === NIGERIA ? (
            <SelectField key="ng-state" id="state" label="State" placeholder="Choose a state" options={STATE_OPTIONS}
                         defaultValue="" error={problemFor(form.problems, 'state')} />
          ) : (
            <TextField key="other-state" id="state" label="State, county or region" optional autoComplete="off"
                       maxLength={100} error={problemFor(form.problems, 'state')} />
          )}
          <TextField id="town" label="Town or city" autoComplete="off" maxLength={100}
                     error={problemFor(form.problems, 'town')} />
          <TextField
            id="otherNames"
            label="Other names"
            optional
            hint={`Nicknames people use for it, separated by commas, up to ${MAX_OTHER_NAMES}: FGCIE, FGC Ikot.`}
            autoComplete="off"
            error={problemFor(form.problems, 'otherNames')}
          />
          <div className="form-buttons">
            <button type="submit" className="button" aria-disabled={add.isPending}>
              {add.isPending ? 'Adding…' : 'Add school'}
            </button>
            <Link to="/schools/find" className="button button-outline">Cancel</Link>
          </div>
        </form>
      </section>
    </div>
  )
}

/**
 * Why the school wasn't added, with the schools to open. Its heading takes the focus when it appears (and again
 * after another try), so screen readers read it at once.
 */
function NotAddedPanel({ reason, pending, onAddAnyway }: {
  reason: NotAdded
  pending: boolean
  onAddAnyway: () => void
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus(), [reason])
  const listed = reason.kind === 'alreadyListed'

  return (
    <section className="did-you-mean" aria-labelledby="did-you-mean-title">
      <h2 id="did-you-mean-title" ref={heading} tabIndex={-1}>
        {listed ? 'Your school is already on Msanga' : 'Is it one of these?'}
      </h2>
      <p>
        {listed
          ? 'Open it below: that’s where its classmates will gather.'
          : 'These look like the school you’re adding. If yours is one of them, open it. If not, add yours.'}
      </p>
      <ul className="school-results" aria-label={listed ? 'The school already on Msanga' : 'Schools like yours'}>
        {reason.schools.map((school) => <SchoolResult key={school.id} school={school} />)}
      </ul>
      {!listed && (
        <button type="button" className="button button-soft" aria-disabled={pending}
                onClick={() => !pending && onAddAnyway()}>
          {pending ? 'Adding…' : "No, it's none of these: add my school"}
        </button>
      )}
    </section>
  )
}
