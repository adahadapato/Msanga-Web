import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router'
import { where } from './where'

/** Test helper: keeps `where.path` up to date, in the same moment the page changes (a layout effect), so a test that
 *  has just seen the new page also sees its address. */
export function TrackLocation() {
  const { pathname, search } = useLocation()
  useLayoutEffect(() => {
    where.path = pathname
    where.search = search
  }, [pathname, search])
  return null
}
