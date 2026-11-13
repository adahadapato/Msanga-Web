import { useMutation } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { authApi } from '../../api/auth'
import { ErrorSummary, TextField } from '../../components/forms/fields'
import { formValues, looksLikeEmail, problemFor } from '../../components/forms/formHelpers'
import { useFormProblems } from '../../components/forms/useFormProblems'
import { usePageTitle } from '../../components/layout/page'

/**
 * "Forgot your password?": the email, then "Choose a new password" with the 6-digit code. The API always answers
 * "done", whether or not the email has an account, so this can't be used to find out who is on Msanga.
 */
export function ForgotPasswordPage() {
  usePageTitle('Reset your password')
  const navigate = useNavigate()
  const form = useFormProblems()
  const request = useMutation({ mutationFn: (email: string) => authApi.forgotPassword(email) })

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (request.isPending) return
    const email = formValues(event.currentTarget).email.trim().toLowerCase()
    if (!email) return form.show([{ field: 'email', message: 'Enter your email address' }])
    if (!looksLikeEmail(email)) return form.show([{ field: 'email', message: 'Enter an email address like name@example.com' }])

    try {
      await request.mutateAsync(email)
      navigate('/reset-password', { state: { email } })
    } catch (error) {
      form.showApiError(error)
    }
  }

  return (
    <>
      <h1>Reset your password</h1>
      <p className="auth-lead">
        Tell us the email you use for Msanga. We'll send it a 6-digit code to choose a new password.
      </p>

      <ErrorSummary problems={form.problems} message={form.message} attempt={form.attempt} />

      <form className="form" noValidate onSubmit={onSubmit}>
        <TextField id="email" label="Email address" type="email" autoComplete="email" inputMode="email"
                   spellCheck={false} error={problemFor(form.problems, 'email')} />
        <button type="submit" className="button button-wide" aria-disabled={request.isPending}>
          {request.isPending ? 'Sending…' : 'Send me a code'}
        </button>
      </form>

      <p className="auth-switch"><Link to="/sign-in">Back to sign in</Link></p>
    </>
  )
}
