import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useSignIn } from '../../auth/useSession'
import { ErrorSummary, PasswordField, TextField } from '../../components/forms/fields'
import { formValues, looksLikeEmail, problemFor, problemsFromApi, type FieldProblem } from '../../components/forms/formHelpers'
import { usePageTitle } from '../../components/layout/page'

/**
 * Sign in with email and password, against the real API. A wrong email and a wrong password get the same message
 * (the API decides that). On success the route guard (RedirectIfMember) takes you where you were heading, or Home.
 */
export function SignInPage() {
  usePageTitle('Sign in')
  const signIn = useSignIn()
  const [problems, setProblems] = useState<FieldProblem[]>([])
  const [message, setMessage] = useState<string>()
  const [attempt, setAttempt] = useState(0)

  function show(found: FieldProblem[], formMessage?: string) {
    setProblems(found)
    setMessage(formMessage)
    setAttempt((a) => a + 1)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (signIn.isPending) return
    const { email, password } = formValues(event.currentTarget)

    const found: FieldProblem[] = []
    if (!email.trim()) found.push({ field: 'email', message: 'Enter your email address' })
    else if (!looksLikeEmail(email)) found.push({ field: 'email', message: 'Enter an email address like name@example.com' })
    if (!password) found.push({ field: 'password', message: 'Enter your password' })
    if (found.length) return show(found)

    try {
      await signIn.mutateAsync({ email: email.trim(), password })
    } catch (error) {
      const fromApi = problemsFromApi(error)
      show(fromApi.problems, fromApi.message)
    }
  }

  return (
    <>
      <h1>Sign in</h1>
      <p className="auth-lead">Welcome back. Your set is waiting.</p>

      <ErrorSummary problems={problems} message={message} attempt={attempt} />

      <form className="form" noValidate onSubmit={onSubmit}>
        <TextField
          id="email"
          label="Email address"
          type="email"
          autoComplete="username"
          inputMode="email"
          spellCheck={false}
          error={problemFor(problems, 'email')}
        />
        <PasswordField id="password" label="Password" autoComplete="current-password" error={problemFor(problems, 'password')} />
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
