import { useCallback, useEffect, useState } from 'react'
import { apiBaseUrl } from '../api/config'
import { getGreeting, type Greeting } from '../api/hello'

type State =
  | { status: 'loading' }
  | { status: 'ok'; greeting: Greeting }
  | { status: 'error'; message: string }

/** "13:05" in the visitor's own time. */
const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

/**
 * M0: asks the API for its greeting and shows the answer, or a clear message and a "Try again" button when the API
 * isn't running.
 *
 * Accessibility: the result is in a polite live region (role="status"), so screen readers announce it when it
 * arrives without interrupting; while loading, the region says so in words (no spinner-only feedback).
 */
export function ConnectionCheck() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getGreeting(controller.signal)
      .then((greeting) => setState({ status: 'ok', greeting }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({ status: 'error', message: error instanceof Error ? error.message : 'Something went wrong.' })
      })
    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  return (
    <section className="card" aria-labelledby="connection-heading">
      <h2 id="connection-heading">Connection check</h2>

      <div role="status" className="card-result">
        {state.status === 'loading' && <p>Asking the Msanga API…</p>}

        {state.status === 'ok' && (
          <>
            <p className="greeting-title" lang="anw">{state.greeting.title}</p>
            <p className="greeting-message">{state.greeting.message}</p>
            <p className="muted">
              The API answered at <time dateTime={state.greeting.serverTime}>{timeLabel(state.greeting.serverTime)}</time>.
            </p>
          </>
        )}

        {state.status === 'error' && (
          <>
            <p className="problem">{state.message}</p>
            <p className="muted">It should be running at <code>{apiBaseUrl}</code>.</p>
          </>
        )}
      </div>

      {state.status === 'error' && (
        <button type="button" className="button" onClick={retry}>Try again</button>
      )}
    </section>
  )
}
