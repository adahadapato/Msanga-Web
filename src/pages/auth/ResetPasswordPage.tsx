import { useMutation } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { authApi } from '../../api/auth'
import { ApiError } from '../../api/http'
import { ErrorSummary, PasswordField, TextField } from '../../components/forms/fields'
import { codeDigits, codeProblem, formValues, looksLikeEmail, problemFor, type FieldProblem } from '../../components/forms/formHelpers'
import { useFormProblems } from '../../components/forms/useFormProblems'
import { usePageTitle } from '../../components/layout/page'

/** Passwords: at least this long (the API's rule too). */
const MIN_PASSWORD_LENGTH = 10

/**
 * "Choose a new password": the 6-digit code from the email and the new password (the email comes with the page from
 * "Forgot your password?"; opened on its own, the page asks for it). Done: Sign in says so, with the email filled in;
 * the API has signed out every device and emailed "your password was changed".
 */
export function ResetPasswordPage() {
  usePageTitle('Choose a new password')
  const navigate = useNavigate()
  const knownEmail = (useLocation().state as { email?: string } | null)?.email
  const form = useFormProblems()
  const reset = useMutation({
    mutationFn: ({ email, code, password }: { email: string; code: string; password: string }) =>
      authApi.resetPassword(email, code, password),
  })
  const resend = useMutation({ mutationFn: (email: string) => authApi.forgotPassword(email) })

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (reset.isPending) return
    const v = formValues(event.currentTarget)
    const email = (knownEmail ?? v.email ?? '').trim().toLowerCase()

    const found: FieldProblem[] = []
    if (!knownEmail && !looksLikeEmail(email)) found.push({ field: 'email', message: 'Enter the email address you use for Msanga' })
    const badCode = codeProblem(v.code)
    if (badCode) found.push({ field: 'code', message: badCode })
    if (!v.newPassword) found.push({ field: 'newPassword', message: 'Choose a new password' })
    else if (v.newPassword.length < MIN_PASSWORD_LENGTH) {
      found.push({ field: 'newPassword', message: `Your password must be at least ${MIN_PASSWORD_LENGTH} characters` })
    }
    if (found.length) return form.show(found)

    try {
      await reset.mutateAsync({ email, code: codeDigits(v.code), password: v.newPassword })
      navigate('/sign-in', { state: { passwordChangedEmail: email } })
    } catch (error) {
      if (error instanceof ApiError && error.code === 'Auth.InvalidCode') form.show([{ field: 'code', message: error.message }])
      else if (error instanceof ApiError && error.code === 'Auth.WeakPassword') form.show([{ field: 'newPassword', message: error.message }])
      else form.showApiError(error)
    }
  }

  return (
    <>
      <h1>Choose a new password</h1>
      <p className="auth-lead">
        If {knownEmail ? <strong>{knownEmail}</strong> : 'your email'} has a Msanga account, we've sent it a 6-digit
        code. It works for 15 minutes; after 5 wrong tries, ask for a new one.
      </p>

      <ErrorSummary problems={form.problems} message={form.message} attempt={form.attempt} />

      <form className="form" noValidate onSubmit={onSubmit}>
        {!knownEmail && (
          <TextField id="email" label="Email address" type="email" autoComplete="email" inputMode="email"
                     spellCheck={false} error={problemFor(form.problems, 'email')} />
        )}
        <TextField
          id="code"
          label="6-digit code"
          className="code-input"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={7}
          spellCheck={false}
          hint="For example 482 913. Never give this code to anyone."
          error={problemFor(form.problems, 'code')}
        />
        <PasswordField
          id="newPassword"
          label="New password"
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters. A short sentence you'll remember works well.`}
          error={problemFor(form.problems, 'newPassword')}
        />
        <button type="submit" className="button button-wide" aria-disabled={reset.isPending}>
          {reset.isPending ? 'Saving…' : 'Save new password'}
        </button>
      </form>

      <div className="form-more">
        <p className="muted">Can't see it? Look in your spam or junk folder.</p>
        {knownEmail && (
          <p>
            <button type="button" className="button button-soft" aria-disabled={resend.isPending}
                    onClick={() => !resend.isPending && resend.mutate(knownEmail)}>
              Send a new code
            </button>
          </p>
        )}
        <p role="status" className="form-status">
          {resend.isSuccess ? `If ${knownEmail} has an account, a new code is on its way. Use the newest one.` : ''}
          {resend.isError ? (resend.error instanceof Error ? resend.error.message : 'That didn’t work. Please try again.') : ''}
        </p>
      </div>

      <p className="auth-switch"><Link to="/sign-in">Back to sign in</Link></p>
    </>
  )
}
