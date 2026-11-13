/** "2027-02-20" → "Sat 20 Feb 2027" (read as a calendar date, so no time zone can move it a day). */
export function formatEventDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  })
}

/** 1542 → "1,542". */
export const formatCount = (n: number) => n.toLocaleString('en-GB')
