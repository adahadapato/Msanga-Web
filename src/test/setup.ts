import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Like the real index.html, so page-level accessibility rules (language, title) are checked too
document.documentElement.lang = 'en-GB'
document.title = 'Msanga'

// A fresh page for every test
afterEach(() => cleanup())
