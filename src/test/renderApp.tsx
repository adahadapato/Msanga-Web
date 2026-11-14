import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { installFakeApi } from './fakeApi'
import { TrackLocation } from './TrackLocation'

export { where } from './where'

/**
 * Renders the whole app at `path` (a pretend address bar), talking to the pretend API (test/fakeApi.ts).
 * `signedIn: true` starts as a returning visitor (Ada's refresh token already in this browser's storage).
 * Returns a user-event "user" that clicks like a person, the pretend API, and the app's query client (what the
 * page remembers).
 */
export function renderApp(path = '/', { signedIn = false } = {}) {
  const api = installFakeApi()
  if (signedIn) localStorage.setItem('msanga.refreshToken', api.issue().refreshToken)

  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const user = userEvent.setup()
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <App />
        <TrackLocation />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return { user, api, client }
}
