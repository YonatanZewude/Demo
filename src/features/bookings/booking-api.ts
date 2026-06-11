import type { SupabaseClient } from '@supabase/supabase-js'
import { env } from '../../lib/env'
import type { Database } from '../../types/database'
import type { BookingFormValues } from './booking-schema'
import type { BookingStatus } from './booking-types'

export async function fetchBookings(client: SupabaseClient<Database>, filters?: { date?: string; status?: BookingStatus | 'all' }) {
  let query = client
    .from('bookings')
    .select('*, services(*)')
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (filters?.date) {
    query = query.eq('booking_date', filters.date)
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) {
    throw error
  }

  return data
}

export async function fetchBookingOccupancy(client: SupabaseClient<Database>, targetDate: string) {
  const { data, error } = await client.rpc('get_booking_occupancy', { target_date: targetDate })
  if (error) {
    throw error
  }

  return data
}

export async function createBooking(client: SupabaseClient<Database>, payload: BookingFormValues & { end_time: string }) {
  const { data, error } = await client
    .from('bookings')
    .insert({
      ...payload,
      status: 'pending',
      customer_message: payload.customer_message || null,
    })
    .select('id')
    .single()

  if (error) {
    throw error
  }

  await notifyBooking(data.id)

  return data
}

async function notifyBooking(bookingId: string) {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return
  }

  const origin = new URL(env.supabaseUrl)
  const projectHost = origin.hostname.split('.')[0]
  const endpoint = `https://${projectHost}.functions.supabase.co/send-booking-emails`

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.supabaseAnonKey}`,
      },
      body: JSON.stringify({ bookingId }),
    })
  } catch {
    // Email delivery should not block booking confirmation.
  }
}

export async function updateBookingStatus(client: SupabaseClient<Database>, id: string, status: BookingStatus) {
  const { error } = await client.from('bookings').update({ status }).eq('id', id)
  if (error) {
    throw error
  }
}

export async function deleteBooking(client: SupabaseClient<Database>, id: string) {
  const { error } = await client.from('bookings').delete().eq('id', id)
  if (error) {
    throw error
  }
}