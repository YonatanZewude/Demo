import { PublicBookingSection } from '../features/bookings/public-booking-section'
import { PageShell } from '../components/shell/page-shell'

export function BookingPage() {
  return (
    <PageShell>
      <PublicBookingSection />
    </PageShell>
  )
}