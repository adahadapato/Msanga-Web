import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { accessibilityProblems } from '../test/axe'
import { ConnectionCheck } from './ConnectionCheck'

/** Replaces the browser's fetch for one test: the API "answers" with this. */
function apiAnswers(answer: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(answer))
}

const greeting = () => Response.json({ title: 'Mme nsanga!', message: 'Your set is waiting.', serverTime: '2026-11-13T03:10:00Z' })

afterEach(() => vi.unstubAllGlobals())

/** The connection check (now on Settings): asks msanga-api for its greeting. */
describe('Connection check', () => {
  it('shows the greeting from the API, with no accessibility problems', async () => {
    apiAnswers(async () => greeting())
    render(<main><ConnectionCheck /></main>)
    expect(await screen.findByText('Mme nsanga!')).toBeTruthy()
    expect(screen.getByText('Your set is waiting.')).toBeTruthy()
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('https://api.msanga.test/api/hello')
    expect(await accessibilityProblems()).toEqual([])
  })

  it('says clearly when the API is not running, with a Try again button', async () => {
    apiAnswers(async () => { throw new TypeError('Failed to fetch') })
    render(<main><ConnectionCheck /></main>)
    expect(await screen.findByText("Can't reach the Msanga API. Is it running?")).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy()
    expect(await accessibilityProblems()).toEqual([])
  })

  it('announces the result to screen readers (polite live region)', async () => {
    apiAnswers(async () => greeting())
    render(<main><ConnectionCheck /></main>)
    const status = screen.getByRole('status')
    expect(status.textContent).toContain('Asking the Msanga API')
    await screen.findByText('Mme nsanga!')
    expect(status.textContent).toContain('Mme nsanga!')
  })
})
