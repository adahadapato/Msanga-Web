import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { communitiesApi, SEARCH_MIN_LENGTH } from '../../api/communities'
import { usePageTitle } from '../../components/layout/page'
import { SchoolResult } from '../../components/schools/SchoolResult'
import { useDebouncedValue } from '../../components/schools/schoolText'

/**
 * Find your school: results as you type (after a short pause), best first. What you typed is kept in the address
 * (?q=fgc), so Back from a school's page brings your results back, and a search can be shared.
 *
 * Accessibility: the box has a visible label; the number of results is announced politely (role="status"), without
 * moving the focus; results are a list of links, each with the school's name as its text.
 */
export function FindSchoolPage() {
  usePageTitle('Find your school')
  const [params, setParams] = useSearchParams()
  const typed = params.get('q') ?? ''
  const text = useDebouncedValue(typed.trim())
  const ready = text.length >= SEARCH_MIN_LENGTH

  const search = useQuery({
    queryKey: ['communities', 'search', text.toLowerCase()],
    queryFn: ({ signal }) => communitiesApi.search(text, signal),
    enabled: ready,
    placeholderData: keepPreviousData,    // the last results stay while the next ones load (no flicker)
    staleTime: 5 * 60_000,                // the same search again within 5 minutes: no new request
  })
  const results = ready ? search.data : undefined

  const onType = (value: string) => setParams(value ? { q: value } : {}, { replace: true })
  const onSubmit = (event: FormEvent) => event.preventDefault()   // results already show as you type

  return (
    <div className="schools-page">
      <section className="panel" aria-labelledby="find-school-title">
        <h1 id="find-school-title">Find your school</h1>
        <p className="muted">Search by its name, a nickname (FGCIE, UNILAG) or its town.</p>

        <form role="search" aria-label="Find your school" className="school-search" onSubmit={onSubmit}>
          <label className="field-label" htmlFor="school-search">School name, nickname or town</label>
          <div className="school-search-box">
            <Search size={20} aria-hidden="true" />
            <input
              id="school-search"
              type="search"
              className="field-input"
              value={typed}
              onChange={(e) => onType(e.target.value)}
              autoComplete="off"
              enterKeyHint="search"
              maxLength={100}
            />
          </div>
        </form>

        <p role="status" className="school-search-status">
          {ready && results ? resultsMessage(results.length, text) : ''}
        </p>

        {ready && search.isError && (
          <div className="form-status form-status-problem">
            <p>{search.error.message}</p>
            <button type="button" className="button button-soft" onClick={() => search.refetch()}>Try again</button>
          </div>
        )}

        {results && results.length > 0 && (
          <ul className="school-results" aria-label="Schools found">
            {results.map((school) => <SchoolResult key={school.id} school={school} />)}
          </ul>
        )}
      </section>

      <section className="panel school-add" aria-labelledby="add-school-title">
        <h2 id="add-school-title">Can't find your school?</h2>
        <p>Try its nickname or town. If it isn't on Msanga yet, you can add it.</p>
        <Link to={typed.trim() ? `/schools/new?name=${encodeURIComponent(typed.trim())}` : '/schools/new'}
              className="button button-soft">
          <Plus size={18} aria-hidden="true" /> Add your school
        </Link>
      </section>
    </div>
  )
}

function resultsMessage(count: number, text: string) {
  if (count === 0) return `No schools match “${text}”.`
  return count === 1 ? '1 school found.' : `${count} schools found.`
}
