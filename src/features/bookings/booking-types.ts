import type { Database } from '../../types/database'

export type Booking = Database['public']['Tables']['bookings']['Row']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type BookingStatus = Database['public']['Tables']['bookings']['Row']['status']

export type BookingOccupancy = Database['public']['Functions']['get_booking_occupancy']['Returns'][number]

export type BookingWithService = Booking & {
  services: Database['public']['Tables']['services']['Row'] | null
}