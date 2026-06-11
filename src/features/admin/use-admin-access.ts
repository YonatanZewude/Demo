import { useAuth } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { isConfigured } from '../../lib/env'
import { useSupabaseClient } from '../../lib/supabase'

export function useAdminAccess() {
  const { isLoaded, userId } = useAuth()
  const supabase = useSupabaseClient()

  const query = useQuery({
    enabled: isConfigured.supabase && isLoaded && Boolean(userId),
    queryKey: ['admin-access', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('clerk_user_id', userId as string)
        .maybeSingle()

      if (error) {
        throw error
      }

      return Boolean(data)
    },
  })

  return {
    isLoading: (isConfigured.supabase && !isLoaded) || query.isLoading,
    isAdmin: Boolean(query.data),
    error: !isConfigured.supabase
      ? 'Supabase saknar miljovariabler.'
      : query.error instanceof Error
        ? query.error.message
        : null,
  }
}