import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { accessibilityProblems } from '../../test/axe'
import { renderApp } from '../../test/renderApp'

const joined = { fromYear: 1992, toYear: 1998, finished: true, status: 'Joined' as const, setYear: 1998 }
const confirmed = { ...joined, status: 'Confirmed' as const }

describe('"People waiting to be confirmed" (against the pretend API)', () => {
  it("lets you vouch in a school's early days, and marks who you know", async () => {
    const { user, api } = renderApp('/schools/fgcie', { signedIn: true })
    api.memberships.set('fgcie', joined)

    const list = await screen.findByRole('list', { name: 'People waiting' })
    expect(within(list).getByText('Nse Udo')).toBeTruthy()
    expect(within(list).getByText('1999 Set · 1993–1999 · Red House')).toBeTruthy()
    expect(within(list).getByText('(at school: Bassey)')).toBeTruthy()
    expect(screen.getByText(/This school is just starting on Msanga/)).toBeTruthy()
    expect(await accessibilityProblems()).toEqual([])

    // The button is read as "I know them: Nse Udo" (its words first)
    await user.click(within(list).getByRole('button', { name: 'I know them: Nse Udo' }))

    expect(await screen.findByText('Thank you. Nse Udo needs one more classmate to say they know them.')).toBeTruthy()
    expect(within(list).getByText('You know them')).toBeTruthy()
    expect(within(list).queryByRole('button', { name: 'I know them: Nse Udo' })).toBeNull()
    expect(api.others[0].vouchedBy).toEqual(['Ada O.'])
  })

  it('confirms someone with the second vouch, and takes them off the list', async () => {
    const { user, api } = renderApp('/schools/fgcie', { signedIn: true })
    api.memberships.set('fgcie', joined)
    api.others[0].vouchedBy.push('Utibe E.')

    const list = await screen.findByRole('list', { name: 'People waiting' })
    await user.click(within(list).getByRole('button', { name: 'I know them: Nse Udo' }))

    expect(await screen.findByText('Thank you. Nse Udo is confirmed now.')).toBeTruthy()
    expect(within(list).queryByText('Nse Udo')).toBeNull()
    expect(api.others[0].status).toBe('Confirmed')
  })

  it('is not shown to someone still waiting once the school has 3 confirmed members', async () => {
    const { api } = renderApp('/schools/fgcie', { signedIn: true })
    api.memberships.set('fgcie', joined)
    for (const o of api.others) o.status = 'Confirmed'
    api.others.push({ ...api.others[0], memberId: 'ime', name: 'Ime Akpan' })

    expect(await screen.findByText(/Not confirmed yet. Ask classmates who are already on Msanga/)).toBeTruthy()
    expect(screen.queryByRole('heading', { name: /People waiting/ })).toBeNull()
  })
})

describe('Where you stand at a school', () => {
  it('says who knows you while you wait', async () => {
    const { api } = renderApp('/schools/fgcie', { signedIn: true })
    api.memberships.set('fgcie', joined)
    api.adaVouchedBy.set('fgcie', ['Nse U.'])
    expect(await screen.findByText('Nse U. knows you. One more classmate to go.')).toBeTruthy()
  })

  it('says who confirmed you', async () => {
    const { api } = renderApp('/schools/fgcie', { signedIn: true })
    api.memberships.set('fgcie', confirmed)
    api.adaVouchedBy.set('fgcie', ['Nse U.', 'Utibe E.'])
    expect(await screen.findByText('Confirmed by Nse U. and Utibe E.')).toBeTruthy()
  })

  it('says Msanga when an admin confirmed you', async () => {
    const { api } = renderApp('/schools/fgcie', { signedIn: true })
    api.memberships.set('fgcie', confirmed)
    expect(await screen.findByText('Confirmed by Msanga.')).toBeTruthy()
  })
})

describe("Who's here on a set's page", () => {
  it('lists the confirmed members of the set for a confirmed member', async () => {
    const { api } = renderApp('/schools/fgcie/sets/1998', { signedIn: true })
    api.memberships.set('fgcie', confirmed)
    api.others[1].status = 'Confirmed'          // Utibe, 1998 Set
    api.others[0].status = 'Confirmed'          // Nse, 1999 Set: not listed here

    const list = await screen.findByRole('list', { name: 'Confirmed members of the 1998 Set' })
    expect(within(list).getAllByRole('listitem').map((li) => li.querySelector('.person-name')?.textContent))
      .toEqual(['Ada Okon', 'Utibe Essien (at school: Bassey)'])
    expect(await accessibilityProblems()).toEqual([])
  })

  it('shows nobody to someone not confirmed yet', async () => {
    const { api } = renderApp('/schools/fgcie/sets/1998', { signedIn: true })
    api.memberships.set('fgcie', joined)
    api.others[1].status = 'Confirmed'
    expect(await screen.findByText(/You'll see who's here once classmates have confirmed you/)).toBeTruthy()
    expect(screen.queryByText('Utibe Essien')).toBeNull()
  })
})
