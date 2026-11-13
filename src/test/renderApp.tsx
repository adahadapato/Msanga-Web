import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { TrackLocation } from './TrackLocation'

export { where } from './where'

/** Renders the whole app at `path` (a pretend address bar). Returns a user-event "user" that clicks like a person. */
export function renderApp(path = '/') {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <TrackLocation />
    </MemoryRouter>,
  )
  return { user }
}
