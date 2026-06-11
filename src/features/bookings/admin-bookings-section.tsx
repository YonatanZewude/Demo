import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Field, Input, Select } from '../../components/ui/field'
import { SectionHeader } from '../../components/ui/section-header'
import { formatTimeLabel } from '../../lib/time'
import { useSupabaseClient } from '../../lib/supabase'
import { deleteBooking, fetchBookings, updateBookingStatus } from './booking-api'
import type { BookingStatus } from './booking-types'

const statuses: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']

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

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Bokningar"
        title="Folj upp dagens och veckans tider"
        description="Filtrera bokningar pa datum eller status, uppdatera status och radera vid behov."
      />

      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Filtrera pa datum">
            <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </Field>
          <Field label="Filtrera pa status">
            <Select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as BookingStatus | 'all')}>
              <option value="all">Alla statusar</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end">
            <Button onClick={() => {
              setSelectedDate('')
              setSelectedStatus('all')
            }} variant="secondary">
              Rensa filter
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-ink-950">{booking.customer_name}</h3>
                  <Badge status={booking.status}>{booking.status}</Badge>
                </div>
                <div className="grid gap-2 text-sm leading-6 text-ink-900/70">
                  <p><strong>Behandling:</strong> {booking.services?.name ?? 'Okand tjanst'}</p>
                  <p><strong>Datum:</strong> {booking.booking_date}</p>
                  <p><strong>Tid:</strong> {formatTimeLabel(booking.start_time)} - {formatTimeLabel(booking.end_time)}</p>
                  <p><strong>Telefon:</strong> {booking.customer_phone}</p>
                  <p><strong>E-post:</strong> {booking.customer_email}</p>
                  {booking.customer_message ? <p><strong>Meddelande:</strong> {booking.customer_message}</p> : null}
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select value={booking.status} onChange={(event) => updateMutation.mutate({ id: booking.id, status: event.target.value as BookingStatus })}>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
                <Button onClick={() => deleteMutation.mutate(booking.id)} variant="danger">
                  <Trash2 className="h-4 w-4" />
                  Radera
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {!bookings.length && !query.isLoading ? (
          <Card className="p-6 text-sm text-ink-900/65">Inga bokningar matchar filtret just nu.</Card>
        ) : null}
      </div>
    </div>
  )
}