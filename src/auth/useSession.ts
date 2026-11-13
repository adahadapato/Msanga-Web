import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useContext, useEffect } from 'react'
import type { Member } from '../api/auth'
import { MemberContext } from './memberContext'
import { onSignedOut, refreshSession, signIn, signOut } from './session'

/** The query that holds "who is signed in" for the whole app (TanStack Query). */
export const ME = ['me'] as const

/**
 * The signed-in member: `data` is the Member, or null when signed out. On page load this tries the stored refresh
 * token (a returning visitor stays signed in). `isError`: the API couldn't be reached.
 */
export function useMe() {
  return useQuery({ queryKey: ME, queryFn: refreshSession, staleTime: Infinity, retry: false })
}

/** The signed-in member, for pages that are only shown when signed in (handed down by RequireMember). */
export function useMember(): Member {
  const member = useContext(MemberContext)
  if (!member) throw new Error('useMember is only for pages behind RequireMember.')
  return member
}

export function useSignIn() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => signIn(email, password),
    onSuccess: (member) => client.setQueryData(ME, member),
  })
}

export function useSignOut() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => client.setQueryData(ME, null),
  })
}

/** When the session ends by itself (refresh token no longer works), the app shows Sign in. Used once, in App. */
export function useSessionEndedHandler() {
  const client = useQueryClient()
  useEffect(() => onSignedOut(() => client.setQueryData(ME, null)), [client])
}
