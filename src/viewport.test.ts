import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Pinch-to-zoom must never be blocked (WCAG 1.4.4 Resize text, 1.4.10 Reflow): low-vision members zoom in on photos,
 * receipts and text. This fails the tests (and so the GitHub check) if index.html's viewport ever blocks it.
 */
describe('index.html viewport', () => {
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')   // tests run from the project folder
  const viewport = /<meta\s+name="viewport"\s+content="([^"]*)"/i.exec(html)?.[1] ?? ''

  it('is there and fits the screen width', () => {
    expect(viewport).toContain('width=device-width')
  })

  it('never blocks pinch-to-zoom', () => {
    expect(viewport).not.toMatch(/user-scalable\s*=\s*(no|0)/i)
    expect(viewport).not.toMatch(/maximum-scale/i)
    expect(viewport).not.toMatch(/minimum-scale/i)
  })
})
