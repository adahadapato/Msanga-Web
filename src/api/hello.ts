import { apiUrl } from './config'

/** GET /api/hello: M0's greeting, proving the web app can reach the API. */
export interface Greeting {
  /** "Mme nsanga!" */
  title: string
  /** "Your set is waiting." */
  message: string
  /** When the API answered (ISO date and time, UTC). */
  serverTime: string
}

/**
 * Asks the API for the greeting.
 * @throws Error with a plain-English message when the API can't be reached or answers with an error.
 */
export async function getGreeting(signal?: AbortSignal): Promise<Greeting> {
  let response: Response
  try {
    response = await fetch(apiUrl('api/hello'), { signal, headers: { Accept: 'application/json' } })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new Error("Can't reach the Msanga API. Is it running?")
  }

  if (!response.ok) throw new Error(`The Msanga API answered with an error (${response.status}).`)
  return (await response.json()) as Greeting
}
