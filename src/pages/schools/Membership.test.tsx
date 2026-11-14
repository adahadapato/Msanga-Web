import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { accessibilityProblems } from '../../test/axe'
import { MY_SCHOOLS } from '../../components/schools/schoolText'
import { renderApp } from '../../test/renderApp'

const membershipCalls = (calls: string[]) => calls.filter((c) => c.includes('/membership') && !c.startsWith('GET'))

describe('"Were you a student here?" on a school\'s page (against the pretend API)', () => {
  it('joins the school with your years, then goes straight on to your set', async () => {
    const { user, api } = renderApp('/schools/fgcie', { signedIn: true })
    await user.click(await screen.findByRole('button', { name: 'Yes, I was a student here' }))

    // The form opens on its first field
    expect(document.activeElement).toBe(screen.getByLabelText('Year you started'))
    expect(await accessibilityProblems()).toEqual([])

    await user.selectOptions(screen.getByLabelText('Year you started'), '1992')
    await user.selectOptions(screen.getByLabelText('Year you left'), '1998')
    await user.click(screen.getByRole('radio', { name: 'Yes, I finished here' }))
    await user.click(screen.getByRole('button', { name: 'Join this school' }))

    // Joined: the set form opens, with the set your years suggest already chosen
    const setList = await screen.findByLabelText('Your set')
    expect(document.activeElement).toBe(setList)
    expect((setList as HTMLSelectElement).value).toBe('1998')
    expect(screen.getByText("You've joined Federal Government College, Ikot Ekpene. Now choose your set.").getAttribute('role')).toBe('status')
    expect(api.memberships.get('fgcie')).toEqual({ fromYear: 1992, toYear: 1998, finished: true, status: 'Joined' })

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2, name: 'You were a student here' }))
    expect(screen.getByText('1992–1998 · Finished here')).toBeTruthy()
    expect(screen.getByText("You haven't chosen your set yet.")).toBeTruthy()
    expect(screen.getByText(/Not confirmed yet/)).toBeTruthy()
    expect(await accessibilityProblems()).toEqual([])
  })

  it('checks the years before sending them', async () => {
    const { user, api } = renderApp('/schools/fgcie', { signedIn: true })
    await user.click(await screen.findByRole('button', { name: 'Yes, I was a student here' }))
    await user.selectOptions(screen.getByLabelText('Year you started'), '1998')
    await user.selectOptions(screen.getByLabelText('Year you left'), '1992')
    await user.click(screen.getByRole('button', { name: 'Join this school' }))

    const summary = await screen.findByRole('alert')
    expect(within(summary).getByRole('link', { name: "The year you left can't be before the year you started" })).toBeTruthy()
    expect(within(summary).getByRole('link', { name: 'Say whether you finished here' })).toBeTruthy()
    expect(membershipCalls(api.calls)).toEqual([])
    expect(await accessibilityProblems()).toEqual([])
  })

  it('changes your years, starting from the ones you gave', async () => {
    const { user, api } = renderApp('/schools/gcu', { signedIn: true })
    api.memberships.set('gcu', { fromYear: 1990, toYear: 1996, finished: true, status: 'Joined' })
    await user.click(await screen.findByRole('button', { name: 'Change years' }))

    expect((screen.getByLabelText('Year you started') as HTMLSelectElement).value).toBe('1990')
    expect((screen.getByRole('radio', { name: 'Yes, I finished here' }) as HTMLInputElement).checked).toBe(true)

    await user.selectOptions(screen.getByLabelText('Year you left'), '1994')
    await user.click(screen.getByRole('radio', { name: 'No, I left before the end' }))
    await user.click(screen.getByRole('button', { name: 'Save years' }))

    expect(await screen.findByText('Your years are saved.')).toBeTruthy()
    expect(screen.getByText('1990–1994 · Left before the end')).toBeTruthy()
    expect(membershipCalls(api.calls)).toEqual(['PUT /api/communities/gcu/membership'])
  })

  it('leaves the school after asking on the page (no pop-up)', async () => {
    const { user, api } = renderApp('/schools/gcu', { signedIn: true })
    api.memberships.set('gcu', { fromYear: 1990, toYear: 1996, finished: true, status: 'Joined' })
    await user.click(await screen.findByRole('button', { name: 'Leave this school' }))

    const question = screen.getByText('Leave Government College, Umuahia?').closest('p')!
    expect(document.activeElement).toBe(question)
    await user.click(screen.getByRole('button', { name: 'Keep it' }))
    expect(api.memberships.has('gcu')).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Leave this school' }))
    await user.click(screen.getByRole('button', { name: 'Yes, leave' }))
    expect(await screen.findByText("You've left Government College, Umuahia.")).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Yes, I was a student here' })).toBeTruthy()
    expect(api.memberships.has('gcu')).toBe(false)
  })
})

describe('My Schools', () => {
  it('lists your schools with your years, most recent first', async () => {
    const { user, api } = renderApp('/', { signedIn: true })
    api.memberships.set('fgcie', { fromYear: 1992, toYear: 1998, finished: true, status: 'Joined' })
    api.memberships.set('uniuyo', { fromYear: 1999, toYear: 2004, finished: true, status: 'Joined' })
    await user.click(await screen.findByRole('link', { name: 'My Schools' }))

    const list = await screen.findByRole('list', { name: 'Your schools' })
    const names = within(list).getAllByRole('link').map((a) => a.textContent)
    expect(names).toEqual(['University of Uyo', 'Federal Government College, Ikot Ekpene'])
    expect(within(list).getAllByText(/set not chosen yet/)).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Find another school' })).toBeTruthy()
    expect(await accessibilityProblems()).toEqual([])
  })

  it('shows a school you just joined', async () => {
    const { user } = renderApp('/schools/uniuyo', { signedIn: true })
    await user.click(await screen.findByRole('button', { name: 'Yes, I was a student here' }))
    await user.selectOptions(screen.getByLabelText('Year you started'), '1999')
    await user.selectOptions(screen.getByLabelText('Year you left'), '2004')
    await user.click(screen.getByRole('radio', { name: 'Yes, I finished here' }))
    await user.click(screen.getByRole('button', { name: 'Join this school' }))
    await user.type(await screen.findByLabelText(/Department/), 'Microbiology')
    await user.click(screen.getByRole('button', { name: 'Save my set' }))
    await screen.findByText('Your set is saved.')

    await user.click(screen.getAllByRole('link', { name: 'My Schools' })[0])
    const list = await screen.findByRole('list', { name: 'Your schools' })
    expect(within(list).getByRole('link', { name: '2004 Set' }).getAttribute('href')).toBe('/schools/uniuyo/sets/2004')
    expect(within(list).getByText('· Microbiology')).toBeTruthy()
  })

  it('is forgotten when you sign out, so the next person on this browser never sees it', async () => {
    const { user, api, client } = renderApp('/schools', { signedIn: true })
    api.memberships.set('fgcie', { fromYear: 1992, toYear: 1998, finished: true, status: 'Joined' })
    await screen.findByRole('list', { name: 'Your schools' })
    expect(client.getQueryData(MY_SCHOOLS)).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Ada O., your account' }))
    const menu = screen.getByRole('link', { name: 'Your profile' }).closest('ul')!
    await user.click(within(menu).getByRole('button', { name: 'Sign out' }))
    await screen.findByRole('heading', { level: 1, name: 'Sign in' })

    expect(client.getQueryData(MY_SCHOOLS)).toBeUndefined()
    expect(client.getQueryCache().getAll().map((q) => q.queryKey)).toEqual([['me']])
  })
})
