import { useEffect, useId, useRef, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import type { FieldProblem } from './formHelpers'

/**
 * Form pieces, built so every field is usable with a screen reader, a keyboard, a password manager and 200% text:
 * - a visible label (never placeholder-only), and "(optional)" on fields you can skip, instead of asterisks;
 * - a hint and an error, both tied to the field (aria-describedby), the error also marking it aria-invalid;
 * - forms use noValidate, so our clear messages replace the browser's pop-ups, listed in an ErrorSummary.
 */

function describedBy(...ids: (string | false | undefined)[]) {
  const list = ids.filter(Boolean).join(' ')
  return list || undefined
}

function Label({ htmlFor, label, optional }: { htmlFor: string; label: string; optional?: boolean }) {
  return (
    <label className="field-label" htmlFor={htmlFor}>
      {label}
      {optional && <span className="field-optional"> (optional)</span>}
    </label>
  )
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string
  label: string
  hint?: string
  error?: string
  optional?: boolean
}

export function TextField({ id, label, hint, error, optional, className, ...input }: TextFieldProps) {
  return (
    <div className={`field${error ? ' field-has-error' : ''}`}>
      <Label htmlFor={id} label={label} optional={optional} />
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field-error"><span className="visually-hidden">Error: </span>{error}</p>}
      <input
        id={id}
        name={id}
        className={`field-input ${className ?? ''}`}
        required={!optional}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint && `${id}-hint`, error && `${id}-error`)}
        {...input}
      />
    </div>
  )
}

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'optional'> & { autoComplete: 'current-password' | 'new-password' }

/** A password field with a Show / Hide button (helps people who can't see what they type, and on phones). */
export function PasswordField({ id, label, hint, error, ...input }: PasswordFieldProps) {
  const [shown, setShown] = useState(false)
  return (
    <div className={`field${error ? ' field-has-error' : ''}`}>
      <Label htmlFor={id} label={label} />
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field-error"><span className="visually-hidden">Error: </span>{error}</p>}
      <div className="password-input">
        <input
          id={id}
          name={id}
          type={shown ? 'text' : 'password'}
          className="field-input"
          required
          spellCheck={false}
          autoCapitalize="none"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(hint && `${id}-hint`, error && `${id}-error`)}
          {...input}
        />
        <button
          type="button"
          className="password-toggle"
          aria-controls={id}
          aria-pressed={shown}
          onClick={() => setShown((s) => !s)}
        >
          {shown ? 'Hide' : 'Show'}{' '}<span className="visually-hidden">password</span>
        </button>
      </div>
    </div>
  )
}

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  id: string
  label: string
  hint?: string
  error?: string
  optional?: boolean
}

export function TextArea({ id, label, hint, error, optional, ...area }: TextAreaProps) {
  return (
    <div className={`field${error ? ' field-has-error' : ''}`}>
      <Label htmlFor={id} label={label} optional={optional} />
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field-error"><span className="visually-hidden">Error: </span>{error}</p>}
      <textarea
        id={id}
        name={id}
        className="field-input field-textarea"
        required={!optional}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint && `${id}-hint`, error && `${id}-error`)}
        {...area}
      />
    </div>
  )
}

/**
 * "There is a problem": shown at the top of a form after a failed submit, with a link to each field. It takes the
 * focus (so screen readers read it at once); `attempt` changes on every submit, so it is focused again each time.
 */
export function ErrorSummary({ problems, message, attempt }: { problems: FieldProblem[]; message?: string; attempt: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const headingId = useId()
  const show = problems.length > 0 || Boolean(message)

  useEffect(() => {
    if (show) ref.current?.focus()
  }, [show, attempt])

  if (!show) return null
  return (
    <div ref={ref} className="error-summary" tabIndex={-1} role="alert" aria-labelledby={headingId}>
      <h2 id={headingId}>There is a problem</h2>
      {message && <p>{message}</p>}
      {problems.length > 0 && (
        <ul>
          {problems.map((p) => (
            <li key={p.field}>
              <a
                href={`#${p.field}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(p.field)?.focus()
                }}
              >
                {p.message}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
