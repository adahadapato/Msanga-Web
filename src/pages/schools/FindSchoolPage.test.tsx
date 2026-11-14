import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { accessibilityProblems } from '../../test/axe'
import { renderApp, where } from '../../test/renderApp'

const searchCalls = (calls: string[]) => calls.filter((c) => c.startsWith('GET /api/communities?'))

describe('Find your school (against the pretend API)', () => {
  it('shows schools as you type, announces how many, and keeps the search in the address', async () => {
    const { user, api } = renderApp('/schools/find', { signedIn: true })
    const box = await screen.findByRole('searchbox', { name: 'School name, nickname or town' })
    expect(await accessibilityProblems()).toEqual([])

    await user.type(box, 'fgc ikot')

    const results = await screen.findByRole('list', { name: 'Schools found' })
    expect(within(results).getByRole('link', { name: 'Federal Government College, Ikot Ekpene' })).toBeTruthy()
    expect(within(results).getByText('Secondary school · Ikot Ekpene, Akwa Ibom')).toBeTruthy()
    expect(within(results).getByText('Also known as FGCIE')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe('1 school found.')
    expect(where.path + where.search).toBe('/schools/find?q=fgc+ikot')
    // Asked once, after the pause: not once per letter
    expect(searchCalls(api.calls)).toEqual(['GET /api/communities?search=fgc%20ikot'])
    expect(await accessibilityProblems()).toEqual([])
  })

  it('does not ask the API for a single letter', async () => {
    const { user, api } = renderApp('/schools/find', { signedIn: true })
    await user.type(await screen.findByRole('searchbox', { name: 'School name, nickname or town' }), 'f')
    await new Promise((resolve) => setTimeout(resolve, 450))
    expect(searchCalls(api.calls)).toEqual([])
    expect(screen.queryByRole('list', { name: 'Schools found' })).toBeNull()
  })

  it('says when nothing matches, and offers to add the school', async () => {
    const { user } = renderApp('/schools/find?q=nowhere', { signedIn: true })
    expect((await screen.findByText('No schools match “nowhere”.')).getAttribute('role')).toBe('status')
    expect(screen.getByRole('link', { name: 'Add your school' }).getAttribute('href')).toBe('/schools/new')
    await user.click(screen.getByRole('link', { name: 'Add your school' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Add your school' })).toBeTruthy()
  })

  it('labels a school a member added as New', async () => {
    renderApp('/schools/find?q=holy child', { signedIn: true })
    const results = await screen.findByRole('list', { name: 'Schools found' })
    const holyChild = within(results).getByRole('link', { name: 'Holy Child College' }).closest('li')!
    expect(holyChild.textContent).toContain('New: added by a member, not checked yet')
  })

  it('says a state named like its town once', async () => {
    renderApp('/schools/find?q=lagos', { signedIn: true })
    expect(await screen.findByText('Secondary school · Lagos')).toBeTruthy()
  })

  it('names the country for a school outside Nigeria', async () => {
    renderApp('/schools/find?q=croydon', { signedIn: true })
    expect(await screen.findByText('Secondary school · Croydon, Greater London, United Kingdom')).toBeTruthy()
  })
})

describe("A school's page", () => {
  it('opens from a result at once, focused on its name, and Back brings the results back', async () => {
    const { user } = renderApp('/schools/find?q=gcu', { signedIn: true })
    await user.click(await screen.findByRole('link', { name: 'Government College, Umuahia' }))

    const heading = await screen.findByRole('heading', { level: 1, name: 'Government College, Umuahia' })
    expect(where.path).toBe('/schools/gcu')
    expect(document.activeElement).toBe(heading)
    expect(screen.getByText('GCU')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Sets' })).toBeTruthy()
    expect(document.title).toBe('Government College, Umuahia – Msanga')
    expect(await accessibilityProblems()).toEqual([])

    await user.click(screen.getByRole('link', { name: 'Find another school' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Find your school' })).toBeTruthy()
  })

  it('loads straight from its address too', async () => {
    renderApp('/schools/uniuyo', { signedIn: true })
    expect(await screen.findByRole('heading', { level: 1, name: 'University of Uyo' })).toBeTruthy()
    expect(screen.getByText(/University \/ Polytechnic · Uyo, Akwa Ibom/)).toBeTruthy()
  })

  it('says so when there is no such school', async () => {
    renderApp('/schools/no-such-school', { signedIn: true })
    expect(await screen.findByRole('heading', { level: 1, name: 'School not found' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Find your school' })).toBeTruthy()
    expect(await accessibilityProblems()).toEqual([])
  })
})

describe('My Schools', () => {
  it('starts you off with Find your school', async () => {
    const { user } = renderApp('/schools', { signedIn: true })
    await screen.findByRole('heading', { level: 1, name: 'My Schools' })
    await user.click(screen.getByRole('link', { name: 'Find your school' }))
    expect(await screen.findByRole('searchbox', { name: 'School name, nickname or town' })).toBeTruthy()
  })
})
