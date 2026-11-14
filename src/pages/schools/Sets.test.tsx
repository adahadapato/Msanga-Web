import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { accessibilityProblems } from '../../test/axe'
import { renderApp, where } from '../../test/renderApp'

const joined = { fromYear: 1992, toYear: 1998, finished: true, status: 'Joined' as const }

describe('"Your set" on a school\'s page (against the pretend API)', () => {
  it('chooses your set, with the details a secondary school has, and links to the set', async () => {
    const { user, api } = renderApp('/schools/fgcie', { signedIn: true })
    api.memberships.set('fgcie', joined)
    await user.click(await screen.findByRole('button', { name: 'Choose your set' }))

    const setList = screen.getByLabelText('Your set') as HTMLSelectElement
    expect(document.activeElement).toBe(setList)
    expect(setList.value).toBe('1998')                                     // suggested: the year you left
    const options = within(setList).getAllByRole('option').map((o) => o.textContent)
    expect(options[0]).toBe('1992 Set')
    expect(options[options.length - 1]).toBe('2004 Set')
    expect(screen.getByText(/names its sets by the year students left/)).toBeTruthy()
    expect(screen.queryByLabelText(/Department/)).toBeNull()               // not for a secondary school
    expect(await accessibilityProblems()).toEqual([])

    await user.type(screen.getByLabelText(/House/), 'Blue House')
    await user.type(screen.getByLabelText(/Class arm/), 'SS3B')
    await user.click(screen.getByRole('button', { name: 'Save my set' }))

    expect(await screen.findByText('Your set is saved.')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2, name: 'You were a student here' }))
    expect(screen.getByText('· Blue House · SS3B')).toBeTruthy()
    expect(api.memberships.get('fgcie')).toMatchObject({ setYear: 1998, house: 'Blue House', classArm: 'SS3B', hostel: '' })

    await user.click(screen.getByRole('link', { name: '1998 Set' }))
    expect(await screen.findByRole('heading', { level: 1, name: '1998 Set' })).toBeTruthy()
    expect(where.path).toBe('/schools/fgcie/sets/1998')
    expect(screen.getByText('This is your set.')).toBeTruthy()
    expect(document.title).toBe('1998 Set, Federal Government College, Ikot Ekpene – Msanga')
    expect(await accessibilityProblems()).toEqual([])
  })

  it('asks you to choose when you left early (no guess)', async () => {
    const { user, api } = renderApp('/schools/fgcie', { signedIn: true })
    api.memberships.set('fgcie', { ...joined, toYear: 1995, finished: false })
    await user.click(await screen.findByRole('button', { name: 'Choose your set' }))

    expect((screen.getByLabelText('Your set') as HTMLSelectElement).value).toBe('')
    await user.click(screen.getByRole('button', { name: 'Save my set' }))
    expect(within(await screen.findByRole('alert')).getByRole('link', { name: 'Choose your set' })).toBeTruthy()

    await user.selectOptions(screen.getByLabelText('Your set'), '1998')
    await user.click(screen.getByRole('button', { name: 'Save my set' }))
    expect(await screen.findByRole('link', { name: '1998 Set' })).toBeTruthy()
  })

  it('follows a school that names its sets by entry year', async () => {
    const { user, api } = renderApp('/schools/gcu', { signedIn: true })
    api.schools.find((s) => s.id === 'gcu')!.setNaming = 'ByEntryYear'
    api.memberships.set('gcu', joined)
    await user.click(await screen.findByRole('button', { name: 'Choose your set' }))

    expect((screen.getByLabelText('Your set') as HTMLSelectElement).value).toBe('1992')
    expect(screen.getByText(/names its sets by the year students came in/)).toBeTruthy()
  })

  it('asks for the department at a university', async () => {
    const { user, api } = renderApp('/schools/uniuyo', { signedIn: true })
    api.memberships.set('uniuyo', { fromYear: 1999, toYear: 2004, finished: true, status: 'Joined' })
    await user.click(await screen.findByRole('button', { name: 'Choose your set' }))
    expect(screen.getByLabelText(/Department/)).toBeTruthy()
    expect(screen.queryByLabelText(/House/)).toBeNull()
  })

  it('tells you when new years no longer fit your set', async () => {
    const { user, api } = renderApp('/schools/fgcie', { signedIn: true })
    api.memberships.set('fgcie', { ...joined, setYear: 1998 })
    await user.click(await screen.findByRole('button', { name: 'Change years' }))
    await user.selectOptions(screen.getByLabelText('Year you started'), '2010')
    await user.selectOptions(screen.getByLabelText('Year you left'), '2015')
    await user.click(screen.getByRole('button', { name: 'Save years' }))
    expect(await screen.findByText('Your years are saved. Your set no longer fits them: choose it again.')).toBeTruthy()
  })
})

describe("A set's page", () => {
  it('is only for people who were at the school', async () => {
    renderApp('/schools/gcu/sets/1998', { signedIn: true })
    expect(await screen.findByText('Only people who were students at this school can see its sets.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Go to the school' }).getAttribute('href')).toBe('/schools/gcu')
  })
})
