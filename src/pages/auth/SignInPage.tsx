import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { ApiError } from '../../api/http'
import { useSignIn } from '../../auth/useSession'
import { ErrorSummary, PasswordField, TextField } from '../../components/forms/fields'
import { formValues, looksLikeEmail, problemFor, type FieldProblem } from '../../components/forms/formHelpers'
import { useFormProblems } from '../../components/forms/useFormProblems'
import { usePageTitle } from '../../components/layout/page'

/**
 * Sign in with email and password, against the real API. A wrong email and a wrong password get the same message
 * (the API decides that). Coming from "Check your email": says the email is confirmed and fills it in. Email not
 * confirmed yet: offers the way to enter the code. On success the route guard (RedirectIfMember) takes you where you
 * were heading, or Home.
 */
export function SignInPage() {
  usePageTitle('Sign in')
  const confirmedEmail = (useLocation().state as { confirmedEmail?: string } | null)?.confirmedEmail
  const signIn = useSignIn()
  const form = useFormProblems()
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string>()

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (signIn.isPending) return
    const { email, password } = formValues(event.currentTarget)

    const found: FieldProblem[] = []
    if (!email.trim()) found.push({ field: 'email', message: 'Enter your email address' })
    else if (!looksLikeEmail(email)) found.push({ field: 'email', message: 'Enter an email address like name@example.com' })
    if (!password) found.push({ field: 'password', message: 'Enter your password' })
    setUnconfirmedEmail(undefined)
    if (found.length) return form.show(found)

    try {
      await signIn.mutateAsync({ email: email.trim(), password })
    } catch (error) {
      if (error instanceof ApiError && error.code === 'Auth.EmailNotConfirmed') setUnconfirmedEmail(email.trim().toLowerCase())
      form.showApiError(error)
    }
  }

  return (
    <>
      <h1>Sign in</h1>
      {confirmedEmail
        ? <p className="form-status-good" role="status">Your email is confirmed. Sign in to start.</p>
        : <p className="auth-lead">Welcome back. Your set is waiting.</p>}

      <ErrorSummary problems={form.problems} message={form.message} attempt={form.attempt} />
      {unconfirmedEmail && (
        <p className="form-more">
          <Link to="/check-email" state={{ email: unconfirmedEmail }}>Enter the code from your email</Link>
        </p>
      )}

      <form className="form" noValidate onSubmit={onSubmit}>
        <TextField
          id="email"
          label="Email address"
          type="email"
          autoComplete="username"
          inputMode="email"
          spellCheck={false}
          defaultValue={confirmedEmail}
          error={problemFor(form.problems, 'email')}
        />
        <PasswordField id="password" label="Password" autoComplete="current-password" error={problemFor(form.problems, 'password')} />
        <p className="form-aside">
          <Link to="/forgot-password">Forgot your password?</Link>
        </p>
        <button type="submit" className="button button-wide" aria-disabled={signIn.isPending}>
          {signIn.isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="auth-switch">
        New to Msanga? <Link to="/register">Create an account</Link>
      </p>
    </>
  )
}
