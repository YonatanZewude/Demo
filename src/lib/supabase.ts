import { useAuth } from '@clerk/clerk-react'
import { createClient } from '@supabase/supabase-js'
import { useMemo } from 'react'
import { env } from './env'
import type { Database } from '../types/database'

let publicClient: ReturnType<typeof createClient<Database>> | null = null
const fallbackSupabaseUrl = 'https://placeholder.supabase.co'
const fallbackSupabaseAnonKey = 'placeholder-anon-key'

export function getPublicSupabaseClient() {
	if (!env.supabaseUrl || !env.supabaseAnonKey) {
		throw new Error('Supabase environment variables are missing.')
	}

	if (!publicClient) {
		publicClient = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey)
	}

	return publicClient
}

export function useSupabaseClient() {
	const { getToken } = useAuth()

	return useMemo(
		() =>
			createClient<Database>(env.supabaseUrl || fallbackSupabaseUrl, env.supabaseAnonKey || fallbackSupabaseAnonKey, {
				accessToken: async () => {
					const token = await getToken({ template: 'supabase' })
					return token ?? null
				},
			}),
		[getToken],
	)
}