import { useState } from 'react'
import { problemsFromApi, type FieldProblem } from './formHelpers'

/**
 * A form's problems after the last submit: per-field ones, and/or one message for the whole form. `attempt` changes
 * on every submit, so the ErrorSummary takes the focus again each time.
 */
export function useFormProblems() {
  const [problems, setProblems] = useState<FieldProblem[]>([])
  const [message, setMessage] = useState<string>()
  const [attempt, setAttempt] = useState(0)

  /** Shows these problems (the summary takes the focus). */
  function show(found: FieldProblem[], formMessage?: string) {
    setProblems(found)
    setMessage(formMessage)
    setAttempt((a) => a + 1)
  }

  /** Shows what the API said: on its fields if it names them, else for the whole form. */
  function showApiError(error: unknown) {
    const fromApi = problemsFromApi(error)
    show(fromApi.problems, fromApi.message)
  }

  return { problems, message, attempt, show, showApiError, clear: () => show([]) }
}
