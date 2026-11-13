import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { where } from './where'

/** Test helper: keeps `where.path` up to date. */
export function TrackLocation() {
  const { pathname } = useLocation()
  useEffect(() => {
    where.path = pathname
  }, [pathname])
  return null
}
