import { apiUrl } from './config'

/**
 * One place that talks to the Msanga API: the address, JSON in and out, and the API's error answers turned into an
 * {@link ApiError} with a plain-English message and the API's code (e.g. "Auth.InvalidCredentials").
 */

/** What the API sends back when something is wrong (RFC 7807 ProblemDetails, plus Msanga's "code"). */
interface ProblemDetails {
  title?: string
  detail?: string
  code?: string
  /** Validation: { "Email": ["Enter your email address."] } */
  errors?: Record<string, string[]>
}

/** A failed call: the HTTP status (0 = couldn't reach the API), the API's code, and a message ready to show. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  /** Per field, keyed like the web app's field ids ("email", "password"). */
  readonly fieldErrors: Record<string, string[]>

  constructor(status: number, code: string, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message)
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** Sent as JSON. */
  body?: unknown
  /** Sent as "Authorization: Bearer …" (use authorizedFetch in auth/session.ts rather than passing it by hand). */
  accessToken?: string
  signal?: AbortSignal
}

/**
 * Calls the API. Resolves with the answer's JSON (undefined for "204 No Content").
 * @throws ApiError for an error answer, or when the API can't be reached (status 0).
 */
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`

  let response: Response
  try {
    response = await fetch(apiUrl(path), {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, 'Network.Unreachable', "Can't reach Msanga right now. Check your internet connection and try again.")
  }

  if (response.status === 204) return undefined as T
  const text = await response.text()
  const data: unknown = text ? readJson(text) : undefined

  if (!response.ok) {
    const problem = (data ?? {}) as ProblemDetails
    throw new ApiError(
      response.status,
      problem.code ?? `Http.${response.status}`,
      problem.detail ?? problem.title ?? `Msanga answered with an error (${response.status}). Please try again.`,
      fieldKeys(problem.errors),
    )
  }
  return data as T
}

function readJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

/** The API names fields like C# ("Email", "NewPassword"); the web app's ids are "email", "newPassword". */
function fieldKeys(errors: Record<string, string[]> | undefined): Record<string, string[]> {
  if (!errors) return {}
  return Object.fromEntries(Object.entries(errors).map(([key, messages]) => [key.charAt(0).toLowerCase() + key.slice(1), messages]))
}
