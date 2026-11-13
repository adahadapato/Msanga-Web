import { useMutation } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { authApi } from '../../api/auth'
import { ErrorSummary, PasswordField, TextField } from '../../components/forms/fields'
import { formValues, looksLikeEmail, problemFor, type FieldProblem } from '../../components/forms/formHelpers'
import { useFormProblems } from '../../components/forms/useFormProblems'
import { usePageTitle } from '../../components/layout/page'

/** Passwords: at least this long (the API's rule too). Long beats complicated: no "one capital, one symbol". */
const MIN_PASSWORD_LENGTH = 10

/**
 * Create account: name (and surname at school), email, password. The API always answers "done" (even for a taken
 * email: its owner gets an email instead), then "Check your email" asks for the 6-digit code.
 */
export function RegisterPage() {
  usePageTitle('Create your account')
  const navigate = useNavigate()
  const form = useFormProblems()
  const register = useMutation({ mutationFn: authApi.register })

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (register.isPending) return
    const v = formValues(event.currentTarget)

    const found: FieldProblem[] = []
    if (!v.firstName.trim()) found.push({ field: 'firstName', message: 'Enter your first name' })
    if (!v.lastName.trim()) found.push({ field: 'lastName', message: 'Enter your last name' })
    if (!v.email.trim()) found.push({ field: 'email', message: 'Enter your email address' })
    else if (!looksLikeEmail(v.email)) found.push({ field: 'email', message: 'Enter an email address like name@example.com' })
    if (!v.password) found.push({ field: 'password', message: 'Choose a password' })
    else if (v.password.length < MIN_PASSWORD_LENGTH) {
      found.push({ field: 'password', message: `Your password must be at least ${MIN_PASSWORD_LENGTH} characters` })
    }
    if (found.length) return form.show(found)

    const email = v.email.trim().toLowerCase()
    try {
      await register.mutateAsync({
        firstName: v.firstName.trim(), lastName: v.lastName.trim(), schoolSurname: v.schoolSurname.trim(), email,
        password: v.password,
      })
      navigate('/check-email', { state: { email } })
    } catch (error) {
      form.showApiError(error)
    }
  }

  return (
    <>
      <h1>Create your account</h1>
      <p className="auth-lead">Find your classmates, then keep your set together. It takes a minute.</p>

      <ErrorSummary problems={form.problems} message={form.message} attempt={form.attempt} />

      <form className="form" noValidate onSubmit={onSubmit}>
        <div className="field-row">
          <TextField id="firstName" label="First name" autoComplete="given-name" error={problemFor(form.problems, 'firstName')} />
          <TextField id="lastName" label="Last name" autoComplete="family-name" error={problemFor(form.problems, 'lastName')} />
        </div>
        <TextField
          id="schoolSurname"
          label="Surname at school"
          optional
          hint="If it's different now, so classmates who knew you by it can still find you."
          autoComplete="off"
          error={problemFor(form.problems, 'schoolSurname')}
        />
        <TextField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          hint="We'll send a 6-digit code to confirm it. We only use it to sign you in and for messages you ask for."
          error={problemFor(form.problems, 'email')}
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters. A short sentence you'll remember works well.`}
          error={problemFor(form.problems, 'password')}
        />
        <button type="submit" className="button button-wide" aria-disabled={register.isPending}>
          {register.isPending ? 'Creating your account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        Already on Msanga? <Link to="/sign-in">Sign in</Link>
      </p>
    </>
  )
}
