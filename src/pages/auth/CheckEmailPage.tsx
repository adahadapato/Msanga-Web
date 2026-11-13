import { useMutation } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { authApi } from '../../api/auth'
import { ApiError } from '../../api/http'
import { ErrorSummary, TextField } from '../../components/forms/fields'
import { codeDigits, codeProblem, formValues, looksLikeEmail, problemFor, type FieldProblem } from '../../components/forms/formHelpers'
import { useFormProblems } from '../../components/forms/useFormProblems'
import { usePageTitle } from '../../components/layout/page'

/**
 * "Check your email": type the 6-digit code from the email (after Create account, or from Sign in when the email
 * isn't confirmed yet). The email comes with the page (navigation state); opened on its own, the page asks for it.
 * Confirmed: on to Sign in, with the email filled in.
 */
export function CheckEmailPage() {
  usePageTitle('Check your email')
  const navigate = useNavigate()
  const knownEmail = (useLocation().state as { email?: string } | null)?.email
  const form = useFormProblems()
  const confirm = useMutation({ mutationFn: ({ email, code }: { email: string; code: string }) => authApi.confirmEmail(email, code) })
  const resend = useMutation({ mutationFn: (email: string) => authApi.resendConfirmation(email) })

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (confirm.isPending) return
    const v = formValues(event.currentTarget)
    const email = (knownEmail ?? v.email ?? '').trim().toLowerCase()

    const found: FieldProblem[] = []
    if (!knownEmail && !looksLikeEmail(email)) found.push({ field: 'email', message: 'Enter the email address you signed up with' })
    const badCode = codeProblem(v.code)
    if (badCode) found.push({ field: 'code', message: badCode })
    if (found.length) return form.show(found)

    try {
      await confirm.mutateAsync({ email, code: codeDigits(v.code) })
      navigate('/sign-in', { state: { confirmedEmail: email } })
    } catch (error) {
      // A wrong, expired or used code: show it on the code field (the API gives one message for all of them)
      if (error instanceof ApiError && error.code === 'Auth.InvalidCode') form.show([{ field: 'code', message: error.message }])
      else form.showApiError(error)
    }
  }

  function sendNewCode() {
    if (!knownEmail || resend.isPending) return
    resend.mutate(knownEmail)
  }

  return (
    <>
      <h1>Check your email</h1>
      <p className="auth-lead">
        We've sent a 6-digit code to {knownEmail ? <strong>{knownEmail}</strong> : 'your email address'}. Type it
        below to confirm your email. It works for 30 minutes; after 5 wrong tries, ask for a new one.
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
          hint="For example 482 913. Your phone may offer it from the email."
          error={problemFor(form.problems, 'code')}
        />
        <button type="submit" className="button button-wide" aria-disabled={confirm.isPending}>
          {confirm.isPending ? 'Confirming…' : 'Confirm my email'}
        </button>
      </form>

      <div className="form-more">
        <p className="muted">Can't see it? Look in your spam or junk folder.</p>
        {knownEmail && (
          <p>
            <button type="button" className="button button-soft" aria-disabled={resend.isPending} onClick={sendNewCode}>
              Send a new code
            </button>
          </p>
        )}
        <p role="status" className="form-status">
          {resend.isSuccess ? `We've sent a new code to ${knownEmail}. Use the newest one.` : ''}
          {resend.isError ? (resend.error instanceof Error ? resend.error.message : 'That didn’t work. Please try again.') : ''}
        </p>
      </div>

      <p className="auth-switch">
        Already confirmed? <Link to="/sign-in">Sign in</Link>. Wrong email? <Link to="/register">Create your account again</Link>
      </p>
    </>
  )
}
