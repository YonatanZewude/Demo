export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          clerk_user_id: string
          created_at: string
          id: string
        }
        Insert: {
          clerk_user_id: string
          created_at?: string
          id?: string
        }
        Update: {
          clerk_user_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          id: string
          title: string
          image_url: string
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          image_url: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          image_url?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          description?: string
          duration_minutes: number
          id?: string
          is_active?: boolean
          name: string
          price: number
        }
        Update: {
          created_at?: string
          description?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
        }
        Relationships: []
      }
      opening_hours: {
        Row: {
          break_end: string | null
          break_start: string | null
          created_at: string
          end_time: string | null
          id: string
          is_open: boolean
          start_time: string | null
          weekday: number
        }
        Insert: {
          break_end?: string | null
          break_start?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          is_open?: boolean
          start_time?: string | null
          weekday: number
        }
        Update: {
          break_end?: string | null
          break_start?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          is_open?: boolean
          start_time?: string | null
          weekday?: number
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          created_at: string
          customer_email: string
          customer_message: string | null
          customer_name: string
          customer_phone: string
          end_time: string
          id: string
          service_id: string
          start_time: string
          status: BookingStatus
        }
        Insert: {
          booking_date: string
          created_at?: string
          customer_email: string
          customer_message?: string | null
          customer_name: string
          customer_phone: string
          end_time: string
          id?: string
          service_id: string
          start_time: string
          status?: BookingStatus
        }
        Update: {
          booking_date?: string
          created_at?: string
          customer_email?: string
          customer_message?: string | null
          customer_name?: string
          customer_phone?: string
          end_time?: string
          id?: string
          service_id?: string
          start_time?: string
          status?: BookingStatus
        }
        Relationships: [
          {
            foreignKeyName: 'bookings_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      get_booking_occupancy: {
        Args: {
          target_date: string
        }
        Returns: {
          end_time: string
          start_time: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      requesting_clerk_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
