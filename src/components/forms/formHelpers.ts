import { ApiError } from '../../api/http'

/** Small helpers for the forms (see fields.tsx). */

export interface FieldProblem {
  /** The field's id, so the summary can link to it. */
  field: string
  message: string
}

/** The message for one field from a list of problems. */
export const problemFor = (problems: FieldProblem[], field: string) => problems.find((p) => p.field === field)?.message

/** A form's text values (all fields are text here). */
export const formValues = (form: HTMLFormElement) =>
  Object.fromEntries([...new FormData(form).entries()].map(([k, v]) => [k, String(v)])) as Record<string, string>

/** Loose on purpose: something@something.something. The confirmation email is the real check. */
export const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

/**
 * What the API said, ready for the form: its per-field messages (keys already match the field ids), and a message
 * for the whole form when it named no field.
 */
export function problemsFromApi(error: unknown): { problems: FieldProblem[]; message?: string } {
  if (error instanceof ApiError) {
    const problems = Object.entries(error.fieldErrors).map(([field, messages]) => ({ field, message: messages[0] }))
    return problems.length ? { problems } : { problems: [], message: error.message }
  }
  return { problems: [], message: 'Something went wrong. Please try again.' }
}

/** "482 913", "482-913" → "482913". */
export const codeDigits = (typed: string) => typed.replace(/[\s-]/g, '')

/** Checks a typed 6-digit code; the message to show, or undefined when it looks right. */
export function codeProblem(typed: string): string | undefined {
  const digits = codeDigits(typed)
  if (!digits) return 'Enter the 6-digit code from the email'
  if (!/^\d{6}$/.test(digits)) return 'The code is 6 digits, like 482 913'
  return undefined
}
