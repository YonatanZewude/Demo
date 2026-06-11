import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database'
import type { OpeningHoursFormValues } from './opening-hours-schema'

export async function fetchOpeningHours(client: SupabaseClient<Database>) {
  const { data, error } = await client.from('opening_hours').select('*').order('weekday', { ascending: true })
  if (error) {
    throw error
  }

  return data
}

export async function saveOpeningHours(client: SupabaseClient<Database>, rows: OpeningHoursFormValues) {
  const payload = rows.map((row) => ({
    id: row.id,
    weekday: row.weekday,
    is_open: row.is_open,
    start_time: row.is_open && row.start_time ? row.start_time : null,
    end_time: row.is_open && row.end_time ? row.end_time : null,
    break_start: row.is_open && row.break_start ? row.break_start : null,
    break_end: row.is_open && row.break_end ? row.break_end : null,
  }))

  const { error } = await client.from('opening_hours').upsert(payload)
  if (error) {
    throw error
  }
}