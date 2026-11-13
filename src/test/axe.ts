import axe from 'axe-core'

/**
 * Runs the axe accessibility checker over the whole page and returns its problems as readable lines (empty = none).
 * The pretend browser (jsdom) can't measure colours, so colour contrast is checked by hand instead (see styles.css).
 */
export async function accessibilityProblems(): Promise<string[]> {
  const results = await axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
    rules: { 'color-contrast': { enabled: false } },
  })
  return results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`)
}
