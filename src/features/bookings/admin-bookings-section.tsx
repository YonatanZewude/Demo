import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Clock3, Mail, Phone, RotateCcw, Trash2, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Field, Input, Select } from '../../components/ui/field'
import { SectionHeader } from '../../components/ui/section-header'
import { cn } from '../../lib/cn'
import { formatTimeLabel } from '../../lib/time'
import { useSupabaseClient } from '../../lib/supabase'
import { deleteBooking, fetchBookings, updateBookingStatus } from './booking-api'
import type { BookingStatus } from './booking-types'

const statuses: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']

const statusLabels: Record<BookingStatus, string> = {
  pending: 'Vantar',
  confirmed: 'Bekraftad',
  completed: 'Klar',
  cancelled: 'Avbokad',
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  }).format(new Date(`${date}T12:00:00`))
}

export function AdminBookingsSection() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'all'>('all')

  const query = useQuery({
    queryKey: ['bookings', selectedDate, selectedStatus],
    queryFn: () => fetchBookings(supabase, { date: selectedDate || undefined, status: selectedStatus }),
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['bookings'] })
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) => updateBookingStatus(supabase, id, status),
    onSuccess: async () => {
      toast.success('Bokningsstatus uppdaterad.')
      await invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBooking(supabase, id),
    onSuccess: async () => {
      toast.success('Bokningen raderades.')
      await invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const bookings = useMemo(() => query.data ?? [], [query.data])
  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === 'pending').length,
      confirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
      completed: bookings.filter((booking) => booking.status === 'completed').length,
    }),
    [bookings],
  )

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Bokningar"
        title="Dagens och veckans tider"
        description="Filtrera, prioritera och uppdatera kundbokningar fran en ren arbetsvy."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Visas nu', value: stats.total, icon: CalendarDays },
          { label: 'Vantar', value: stats.pending, icon: Clock3 },
          { label: 'Bekraftade', value: stats.confirmed, icon: UserRound },
          { label: 'Klara', value: stats.completed, icon: Mail },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-900/45">{label}</p>
                <p className="mt-2 text-3xl font-bold text-ink-950">{value}</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sand-50 text-copper-700">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
          <Field label="Filtrera pa datum">
            <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </Field>
          <Field label="Filtrera pa status">
            <Select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as BookingStatus | 'all')}>
              <option value="all">Alla statusar</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end">
            <Button
              className="min-h-12"
              onClick={() => {
                setSelectedDate('')
                setSelectedStatus('all')
              }}
              variant="secondary"
            >
              <RotateCcw className="h-4 w-4" />
              Rensa
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden p-0">
            <div className="grid gap-0 lg:grid-cols-[180px_minmax(0,1fr)_240px]">
              <div className="surface-gold flex flex-row items-center gap-4 border-b border-salon-line p-5 lg:flex-col lg:items-start lg:border-b-0 lg:border-r">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-950 text-gold-300">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold capitalize text-ink-950">{formatDateLabel(booking.booking_date)}</p>
                  <p className="mt-1 text-2xl font-bold text-ink-950">
                    {formatTimeLabel(booking.start_time)}
                  </p>
                  <p className="text-xs font-semibold text-ink-900/55">
                    till {formatTimeLabel(booking.end_time)}
                  </p>
                </div>
              </div>

              <div className="p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold text-ink-950">{booking.customer_name}</h3>
                  <Badge status={booking.status}>{statusLabels[booking.status]}</Badge>
                </div>

                <p className="mt-3 text-sm font-semibold text-copper-700">
                  {booking.services?.name ?? 'Okand tjanst'}
                </p>

                <div className="mt-4 grid gap-3 text-sm text-ink-900/68 md:grid-cols-2">
                  <a className="inline-flex items-center gap-2 hover:text-ink-950" href={`tel:${booking.customer_phone}`}>
                    <Phone className="h-4 w-4 text-copper-700" />
                    {booking.customer_phone}
                  </a>
                  <a className="inline-flex items-center gap-2 hover:text-ink-950" href={`mailto:${booking.customer_email}`}>
                    <Mail className="h-4 w-4 text-copper-700" />
                    {booking.customer_email}
                  </a>
                </div>

                {booking.customer_message ? (
                  <div className="mt-4 rounded-2xl bg-sand-50 p-4 text-sm leading-6 text-ink-900/68">
                    <span className="font-bold text-ink-950">Meddelande: </span>
                    {booking.customer_message}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col justify-between gap-4 border-t border-salon-line bg-white p-5 lg:border-l lg:border-t-0">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-ink-900/45">Status</p>
                  <Select
                    value={booking.status}
                    onChange={(event) =>
                      updateMutation.mutate({ id: booking.id, status: event.target.value as BookingStatus })
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button
                  className={cn('w-full', deleteMutation.isPending ? 'opacity-70' : null)}
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (confirm('Vill du radera bokningen?')) {
                      deleteMutation.mutate(booking.id)
                    }
                  }}
                  variant="danger"
                >
                  <Trash2 className="h-4 w-4" />
                  Radera
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {query.isLoading ? (
          <Card className="p-6 text-sm text-ink-900/65">Hamtar bokningar...</Card>
        ) : null}

        {!bookings.length && !query.isLoading ? (
          <Card className="p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sand-50 text-copper-700">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-ink-950">Inga bokningar hittades</h3>
            <p className="mt-2 text-sm text-ink-900/62">Andra filter eller vanta tills nya kunder bokar tid.</p>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
