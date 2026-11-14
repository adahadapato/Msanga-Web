import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { accessibilityProblems } from '../../test/axe'
import { renderApp, where } from '../../test/renderApp'

const posts = (calls: string[]) => calls.filter((c) => c === 'POST /api/communities')

/** Fills in the form like a person would. */
async function fillIn(user: UserEvent, school: { name: string; level?: string; state?: string; town: string; otherNames?: string }) {
  const name = screen.getByLabelText("School's name")
  await user.clear(name)
  await user.type(name, school.name)
  await user.click(screen.getByRole('radio', { name: school.level ?? 'Secondary school' }))
  if (school.state) await user.selectOptions(screen.getByLabelText('State'), school.state)
  await user.type(screen.getByLabelText('Town or city'), school.town)
  if (school.otherNames) await user.type(screen.getByLabelText(/Other names/), school.otherNames)
}

describe('Add your school (against the pretend API)', () => {
  it('adds a school, marked New, and opens its page', async () => {
    const { user, api } = renderApp('/schools/new', { signedIn: true })
    await screen.findByRole('heading', { level: 1, name: 'Add your school' })
    expect(await accessibilityProblems()).toEqual([])

    await fillIn(user, { name: 'Mary Hanney School', level: 'Primary school', state: 'Akwa Ibom', town: 'Uyo', otherNames: 'MHS, Mary Hanney' })
    await user.click(screen.getByRole('button', { name: 'Add school' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Mary Hanney School' })).toBeTruthy()
    expect(where.path).toMatch(/^\/schools\/added-/)
    expect(screen.getByText('Your school is added. Classmates can find it now.')).toBeTruthy()
    expect(screen.getByText(/Primary school · Uyo, Akwa Ibom/)).toBeTruthy()
    expect(screen.getByText('MHS, Mary Hanney')).toBeTruthy()
    expect(screen.getByText(/New/)).toBeTruthy()
    expect(posts(api.calls)).toHaveLength(1)
  })

  it('needs the name, kind, state and town, and sends nothing until then', async () => {
    const { user, api } = renderApp('/schools/new', { signedIn: true })
    await user.click(await screen.findByRole('button', { name: 'Add school' }))

    const summary = await screen.findByRole('alert')
    expect(document.activeElement).toBe(summary)
    for (const message of ["Enter the school's name", 'Choose what kind of school it is', 'Choose the state', 'Enter the town or city']) {
      expect(within(summary).getByRole('link', { name: message })).toBeTruthy()
    }
    expect(posts(api.calls)).toEqual([])
    expect(await accessibilityProblems()).toEqual([])
  })

  it('asks "Is it one of these?", and adds it anyway when it is none of them', async () => {
    const { user, api } = renderApp('/schools/new', { signedIn: true })
    await screen.findByRole('heading', { level: 1, name: 'Add your school' })
    await fillIn(user, { name: 'Holy Child College', state: 'Lagos', town: 'Obalende' })
    await user.click(screen.getByRole('button', { name: 'Add school' }))

    const question = await screen.findByRole('heading', { level: 2, name: 'Is it one of these?' })
    expect(document.activeElement).toBe(question)
    const lookalikes = screen.getByRole('list', { name: 'Schools like yours' })
    expect(within(lookalikes).getByRole('link', { name: 'Holy Child College' })).toBeTruthy()
    expect(await accessibilityProblems()).toEqual([])

    await user.click(screen.getByRole('button', { name: "No, it's none of these: add my school" }))
    expect(await screen.findByText('Your school is added. Classmates can find it now.')).toBeTruthy()
    expect(screen.getByText(/Secondary school · Obalende, Lagos/)).toBeTruthy()
    expect(posts(api.calls)).toHaveLength(2)
  })

  it('shows the school when it is already on Msanga, with no way to add a second copy', async () => {
    const { user } = renderApp('/schools/new', { signedIn: true })
    await screen.findByRole('heading', { level: 1, name: 'Add your school' })
    await fillIn(user, { name: 'Government College Umuahia', state: 'Abia', town: 'Umuahia' })
    await user.click(screen.getByRole('button', { name: 'Add school' }))

    expect(await screen.findByRole('heading', { level: 2, name: 'Your school is already on Msanga' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Government College, Umuahia' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /add my school/ })).toBeNull()
  })

  it('lists Nigeria first, with its states; elsewhere the state is optional free text', async () => {
    const { user } = renderApp('/schools/new', { signedIn: true })
    const country = await screen.findByLabelText('Country')
    expect((country as HTMLSelectElement).value).toBe('NG')
    expect(within(country).getAllByRole('option')[0].textContent).toBe('Nigeria')
    expect(within(screen.getByLabelText('State')).getAllByRole('option')).toHaveLength(38)   // "Choose a state" + 37

    await user.selectOptions(country, 'GB')
    const region = screen.getByLabelText(/State, county or region/)
    expect(region.tagName).toBe('INPUT')
    expect(region.hasAttribute('required')).toBe(false)
  })

  it('starts with the name you searched for', async () => {
    const { user } = renderApp('/schools/find?q=Mary Hanney', { signedIn: true })
    await screen.findByText('No schools match “Mary Hanney”.')
    await user.click(screen.getByRole('link', { name: 'Add your school' }))
    expect(((await screen.findByLabelText("School's name")) as HTMLInputElement).value).toBe('Mary Hanney')
  })
})

describe('Find Classmates (coming with sets)', () => {
  it('sends you to Find your school first', async () => {
    const { user } = renderApp('/find', { signedIn: true })
    await user.click(await screen.findByRole('link', { name: 'Find your school first' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Find your school' })).toBeTruthy()
  })
})
