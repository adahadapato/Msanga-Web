import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Membership, MySet } from '../../api/communities'
import { ErrorSummary, SelectField, TextField } from '../forms/fields'
import { formValues, problemFor } from '../forms/formHelpers'
import { useFormProblems } from '../forms/useFormProblems'

/** Longest house, class arm, hostel or department (the API's rule too). */
const DETAIL_MAX = 60

/**
 * "Your set": choose your set from the ones your years allow (the suggested one is chosen for you), then the details
 * that fit the school (all optional, free text: tidied later with AI):
 * secondary → house, class arm, hostel; university / polytechnic → department; primary → none.
 */
export function SetForm({ membership, onSave, onCancel }: {
  membership: Membership
  onSave: (set: MySet) => Promise<void>
  onCancel: () => void
}) {
  const form = useFormProblems()
  const [saving, setSaving] = useState(false)
  const firstField = useRef<HTMLSelectElement>(null)
  const m = membership
  const level = m.school.level
  const byEntry = m.school.setNaming === 'ByEntryYear'
  const chosen = m.setYear ?? m.suggestedSetYear

  useEffect(() => firstField.current?.focus(), [])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const v = formValues(event.currentTarget)
    if (!v.setYear) return form.show([{ field: 'setYear', message: 'Choose your set' }])

    setSaving(true)
    try {
      await onSave({
        setYear: Number(v.setYear), house: v.house ?? '', classArm: v.classArm ?? '', hostel: v.hostel ?? '',
        department: v.department ?? '',
      })
    } catch (error) {
      form.showApiError(error)
      setSaving(false)
    }
  }

  return (
    <>
      <ErrorSummary problems={form.problems} message={form.message} attempt={form.attempt} />
      <form className="form" noValidate onSubmit={onSubmit}>
        <SelectField
          ref={firstField}
          id="setYear"
          label="Your set"
          hint={byEntry
            ? 'This school names its sets by the year students came in. If you came late, choose the set you joined.'
            : 'This school names its sets by the year students left. If you left early, choose the set you would have finished with.'}
          placeholder={chosen ? undefined : 'Choose your set'}
          options={m.setYearChoices.map((y) => ({ value: String(y), label: `${y} Set` }))}
          defaultValue={chosen ? String(chosen) : ''}
          error={problemFor(form.problems, 'setYear')}
        />

        {level === 'Secondary' && (
          <>
            <TextField id="house" label="House" optional hint="e.g. Blue House" defaultValue={m.house ?? ''}
                       maxLength={DETAIL_MAX} autoComplete="off" error={problemFor(form.problems, 'house')} />
            <TextField id="classArm" label="Class arm" optional hint="Your last class, e.g. SS3B"
                       defaultValue={m.classArm ?? ''} maxLength={DETAIL_MAX} autoComplete="off"
                       error={problemFor(form.problems, 'classArm')} />
            <TextField id="hostel" label="Hostel" optional hint="If you were a boarder" defaultValue={m.hostel ?? ''}
                       maxLength={DETAIL_MAX} autoComplete="off" error={problemFor(form.problems, 'hostel')} />
          </>
        )}
        {level === 'Tertiary' && (
          <TextField id="department" label="Department" optional hint="e.g. Microbiology"
                     defaultValue={m.department ?? ''} maxLength={DETAIL_MAX} autoComplete="off"
                     error={problemFor(form.problems, 'department')} />
        )}

        <p className="muted">Classmates will use these to find you. You can change them any time.</p>
        <div className="form-buttons">
          <button type="submit" className="button" aria-disabled={saving}>{saving ? 'Saving…' : 'Save my set'}</button>
          <button type="button" className="button button-outline" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </>
  )
}
