import type { Database } from '../../types/database'

export type OpeningHours = Database['public']['Tables']['opening_hours']['Row']
export type OpeningHoursUpdate = Database['public']['Tables']['opening_hours']['Update']