import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database'
import type { ServiceFormValues } from './service-schema'

export async function fetchAdminServices(client: SupabaseClient<Database>) {
  const { data, error } = await client.from('services').select('*').order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function fetchActiveServices(client: SupabaseClient<Database>) {
  const { data, error } = await client
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true })

  if (error) {
    throw error
  }

  return data
}

export async function createService(client: SupabaseClient<Database>, values: ServiceFormValues) {
  const { error } = await client.from('services').insert(values)
  if (error) {
    throw error
  }
}

export async function updateService(client: SupabaseClient<Database>, id: string, values: ServiceFormValues) {
  const { error } = await client.from('services').update(values).eq('id', id)
  if (error) {
    throw error
  }
}

export async function deleteService(client: SupabaseClient<Database>, id: string) {
  const { error } = await client.from('services').delete().eq('id', id)
  if (error) {
    throw error
  }
}