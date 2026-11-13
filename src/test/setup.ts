import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { resetSessionForTests } from '../auth/session'

// Like the real index.html, so page-level accessibility rules (language, title) are checked too
document.documentElement.lang = 'en-GB'
document.title = 'Msanga'

// A fresh page, no session and the real fetch back, for every test
afterEach(() => {
  cleanup()
  localStorage.clear()
  resetSessionForTests()
  vi.unstubAllGlobals()
})
