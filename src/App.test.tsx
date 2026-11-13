import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { accessibilityProblems } from './test/axe'

/** Replaces the browser's fetch for one test: the API "answers" with this. */
function apiAnswers(answer: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(answer))
}

afterEach(() => vi.unstubAllGlobals())

describe('Msanga app frame and connection check', () => {
  it('shows the greeting from the API', async () => {
    apiAnswers(async () => Response.json({
      title: 'Mme nsanga!', message: 'Your set is waiting.', serverTime: '2026-11-13T03:10:00Z',
    }))
    render(<App />)

    expect(await screen.findByText('Mme nsanga!')).toBeTruthy()
    expect(screen.getByText('Your set is waiting.')).toBeTruthy()
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('https://api.msanga.test/api/hello')
  })

  it('has no accessibility problems once the greeting is shown', async () => {
    apiAnswers(async () => Response.json({
      title: 'Mme nsanga!', message: 'Your set is waiting.', serverTime: '2026-11-13T03:10:00Z',
    }))
    render(<App />)
    await screen.findByText('Mme nsanga!')

    expect(await accessibilityProblems()).toEqual([])
  })

  it('says clearly when the API is not running, with a Try again button', async () => {
    apiAnswers(async () => { throw new TypeError('Failed to fetch') })
    render(<App />)

    expect(await screen.findByText("Can't reach the Msanga API. Is it running?")).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy()
    expect(await accessibilityProblems()).toEqual([])
  })

  it('announces the result to screen readers (polite live region)', async () => {
    apiAnswers(async () => Response.json({
      title: 'Mme nsanga!', message: 'Your set is waiting.', serverTime: '2026-11-13T03:10:00Z',
    }))
    render(<App />)

    const status = screen.getByRole('status')
    expect(status.textContent).toContain('Asking the Msanga API')
    await screen.findByText('Mme nsanga!')
    expect(status.textContent).toContain('Mme nsanga!')
  })

  it('starts with a skip link to the main content', () => {
    apiAnswers(() => new Promise(() => {}))   // never answers
    render(<App />)

    const links = screen.getAllByRole('link')
    expect(links[0].textContent).toBe('Skip to the main content')
    expect(links[0].getAttribute('href')).toBe('#main')
    expect(document.getElementById('main')?.tagName).toBe('MAIN')
  })
})
