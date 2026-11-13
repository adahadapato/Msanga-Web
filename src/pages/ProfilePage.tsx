import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LogOut, Pencil, Settings, UsersRound } from 'lucide-react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { membersApi } from '../api/members'
import { ME, useMember, useSignOut } from '../auth/useSession'
import { ErrorSummary, TextArea, TextField } from '../components/forms/fields'
import { formValues, problemFor, type FieldProblem } from '../components/forms/formHelpers'
import { useFormProblems } from '../components/forms/useFormProblems'
import { formatCount } from '../components/home/format'
import { usePageTitle } from '../components/layout/page'
import { Avatar } from '../components/ui/Avatar'
import { sets } from '../mock/homeData'

/** The longest "About you" (the API's rule too). */
const BIO_MAX = 300

/**
 * Your profile: photo (initials until uploads), name, surname at school, a line about you, your sets. As promised,
 * no counts of connections, groups or events: Msanga isn't a popularity contest. Edit profile and Sign out are here
 * too (on phones the account menu is hidden, so this is where they live). The sets are made up until M2.
 */
export function ProfilePage() {
  const member = useMember()
  usePageTitle('Your profile')
  const saved = Boolean((useLocation().state as { saved?: boolean } | null)?.saved)
  const signOut = useSignOut()
  const fullName = `${member.firstName} ${member.lastName}`

  return (
    <div className="profile-page">
      <p role="status" className="form-status form-status-good">{saved ? 'Your profile is saved.' : ''}</p>

      <section className="panel profile-head" aria-labelledby="profile-name">
        <div className="profile-cover" aria-hidden="true">
          {sets[0] && <img src={sets[0].picture} alt="" />}
        </div>
        <div className="profile-identity">
          <Avatar name={member.displayName} photo={member.photo} size="xl" />
          <div className="profile-names">
            <h1 id="profile-name">{fullName}</h1>
            <p className="muted">
              {member.mainSet ?? 'Not in a set yet'}
              {member.schoolSurname && <> · at school: {member.firstName} {member.schoolSurname}</>}
            </p>
          </div>
        </div>
        <p className="profile-bio">
          {member.bio || <span className="muted">You haven't written about yourself yet.</span>}
        </p>
        <div className="profile-actions">
          <Link to="/profile/edit" className="button">
            <Pencil size={18} aria-hidden="true" /> Edit profile
          </Link>
          <Link to="/settings" className="button button-soft">
            <Settings size={18} aria-hidden="true" /> Settings
          </Link>
          <button type="button" className="button button-outline" aria-disabled={signOut.isPending}
                  onClick={() => !signOut.isPending && signOut.mutate()}>
            <LogOut size={18} aria-hidden="true" /> Sign out
          </button>
        </div>
      </section>

      <section className="panel" aria-labelledby="profile-sets">
        <h2 id="profile-sets">My sets</h2>
        <ul className="profile-set-list">
          {sets.map((s) => (
            <li key={s.id}>
              <img src={s.picture} alt="" />
              <div>
                <Link to={`/sets/${s.id}`}><strong>{s.community}</strong></Link>
                <p className="muted">
                  {s.set} · <UsersRound size={15} aria-hidden="true" /> {formatCount(s.members)} members
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel" aria-labelledby="profile-account">
        <h2 id="profile-account">Your account</h2>
        <dl className="details">
          <div>
            <dt>Email</dt>
            <dd>{member.email} <span className="muted">(only you see this)</span></dd>
          </div>
          <div>
            <dt>Name classmates see</dt>
            <dd>{member.displayName}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}

/** Edit your names, your surname at school and a line about yourself (PUT /api/me). */
export function EditProfilePage() {
  const member = useMember()
  usePageTitle('Edit your profile')
  const navigate = useNavigate()
  const client = useQueryClient()
  const form = useFormProblems()
  const save = useMutation({
    mutationFn: membersApi.updateMe,
    onSuccess: (updated) => client.setQueryData(ME, updated),   // the top bar, Home and the profile update at once
  })

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (save.isPending) return
    const v = formValues(event.currentTarget)
    const found: FieldProblem[] = []
    if (!v.firstName.trim()) found.push({ field: 'firstName', message: 'Enter your first name' })
    if (!v.lastName.trim()) found.push({ field: 'lastName', message: 'Enter your last name' })
    if (v.bio.length > BIO_MAX) found.push({ field: 'bio', message: `Keep it to ${BIO_MAX} characters or fewer` })
    if (found.length) return form.show(found)

    try {
      await save.mutateAsync({
        firstName: v.firstName.trim(), lastName: v.lastName.trim(), schoolSurname: v.schoolSurname.trim(), bio: v.bio.trim(),
      })
      navigate('/profile', { state: { saved: true } })
    } catch (error) {
      form.showApiError(error)
    }
  }

  return (
    <div className="profile-page">
      <section className="panel form-panel" aria-labelledby="edit-title">
        <h1 id="edit-title">Edit your profile</h1>
        <ErrorSummary problems={form.problems} message={form.message} attempt={form.attempt} />
        <form className="form" noValidate onSubmit={onSubmit}>
          <div className="field-row">
            <TextField id="firstName" label="First name" autoComplete="given-name" defaultValue={member.firstName}
                       error={problemFor(form.problems, 'firstName')} />
            <TextField id="lastName" label="Last name" autoComplete="family-name" defaultValue={member.lastName}
                       error={problemFor(form.problems, 'lastName')} />
          </div>
          <TextField
            id="schoolSurname"
            label="Surname at school"
            optional
            hint="If it's different now, so classmates who knew you by it can still find you."
            defaultValue={member.schoolSurname ?? ''}
            autoComplete="off"
            error={problemFor(form.problems, 'schoolSurname')}
          />
          <TextArea
            id="bio"
            label="About you"
            optional
            rows={4}
            maxLength={BIO_MAX}
            hint={`A line or two for your classmates, up to ${BIO_MAX} characters.`}
            defaultValue={member.bio}
            error={problemFor(form.problems, 'bio')}
          />
          <p className="muted">Profile photos come later, with the photo milestone.</p>
          <div className="form-buttons">
            <button type="submit" className="button" aria-disabled={save.isPending}>
              {save.isPending ? 'Saving…' : 'Save profile'}
            </button>
            <Link to="/profile" className="button button-outline">Cancel</Link>
          </div>
        </form>
      </section>
    </div>
  )
}
