import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Clock3, Scissors } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { SectionHeader } from '../../components/ui/section-header'
import { useSupabaseClient } from '../../lib/supabase'
import { fetchBookings } from '../bookings/booking-api'
import { fetchOpeningHours } from '../opening-hours/opening-hours-api'
import { fetchAdminServices } from '../services/service-api'

export function AdminOverview() {
  const supabase = useSupabaseClient()
  const servicesQuery = useQuery({ queryKey: ['services', 'admin'], queryFn: () => fetchAdminServices(supabase) })
  const bookingsQuery = useQuery({ queryKey: ['bookings', 'overview'], queryFn: () => fetchBookings(supabase) })
  const openingHoursQuery = useQuery({ queryKey: ['opening-hours'], queryFn: () => fetchOpeningHours(supabase) })

  const activeServices = servicesQuery.data?.filter((service) => service.is_active).length ?? 0
  const openDays = openingHoursQuery.data?.filter((row) => row.is_open).length ?? 0
  const pendingBookings = bookingsQuery.data?.filter((booking) => booking.status === 'pending').length ?? 0

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Översikt"
        title="Nyckeltal för salongens drift"
        description="Få en snabb bild av behandlingsutbud, öppna dagar och bokningar som väntar på handläggning."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'Aktiva tjänster', value: activeServices, icon: Scissors },
          { title: 'Öppna veckodagar', value: openDays, icon: Clock3 },
          { title: 'Väntar bekräftelse', value: pendingBookings, icon: CalendarDays },
        ].map(({ icon: Icon, title, value }) => (
          <Card key={title} className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-ink-900/60">{title}</p>
                <p className="mt-3 text-4xl font-semibold text-ink-950">{value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sand-50 text-copper-600">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
