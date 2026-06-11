import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format, startOfToday } from 'date-fns'
import { Mail, MessageSquareMore, Phone, UserRound } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Card } from '../../components/ui/card'
import { Field, Input, Select, Textarea } from '../../components/ui/field'
import { Button } from '../../components/ui/button'
import { SectionHeader } from '../../components/ui/section-header'
import { SetupNotice } from '../../components/shared/setup-notice'
import { isConfigured } from '../../lib/env'
import { getPublicSupabaseClient } from '../../lib/supabase'
import { fetchBookingOccupancy, createBooking } from './booking-api'
import { getAvailableTimeSlots } from './booking-availability'
import { bookingFormSchema, type BookingFormValues } from './booking-schema'
import { fetchOpeningHours } from '../opening-hours/opening-hours-api'
import { fetchActiveServices } from '../services/service-api'

const minDate = format(startOfToday(), 'yyyy-MM-dd')

function PublicBookingSectionInner() {
  const supabase = getPublicSupabaseClient()

  const servicesQuery = useQuery({
    queryKey: ['services', 'active'],
    queryFn: () => fetchActiveServices(supabase),
  })

  const openingHoursQuery = useQuery({
    queryKey: ['opening-hours', 'public'],
    queryFn: () => fetchOpeningHours(supabase),
  })

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      service_id: '',
      booking_date: minDate,
      start_time: '',
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      customer_message: '',
    },
  })

  const serviceId = useWatch({ control: form.control, name: 'service_id' })
  const bookingDate = useWatch({ control: form.control, name: 'booking_date' })
  const selectedService = useMemo(
    () => servicesQuery.data?.find((service) => service.id === serviceId),
    [serviceId, servicesQuery.data],
  )

  const occupancyQuery = useQuery({
    enabled: Boolean(bookingDate),
    queryKey: ['booking-occupancy', bookingDate],
    queryFn: () => fetchBookingOccupancy(supabase, bookingDate),
  })

  const slots = useMemo(
    () =>
      getAvailableTimeSlots({
        date: bookingDate,
        occupancies: occupancyQuery.data ?? [],
        openingHours: openingHoursQuery.data ?? [],
        service: selectedService,
      }),
    [bookingDate, occupancyQuery.data, openingHoursQuery.data, selectedService],
  )

  useEffect(() => {
    if (!slots.some((slot) => slot.startTime === form.getValues('start_time'))) {
      form.setValue('start_time', '')
    }
  }, [form, slots])

  const bookingMutation = useMutation({
    mutationFn: (values: BookingFormValues) => {
      const slot = slots.find((item) => item.startTime === values.start_time)
      if (!slot) {
        throw new Error('Vald tid ar inte langre tillganglig.')
      }

      return createBooking(supabase, { ...values, end_time: slot.endTime })
    },
    onSuccess: () => {
      toast.success('Bokningen skapades. Bekraftelse skickas via e-post.')
      form.reset({
        service_id: '',
        booking_date: minDate,
        start_time: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        customer_message: '',
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <Card className="p-6 sm:p-8">
        <SectionHeader
          eyebrow="Bokning"
          title="Valj behandling, datum och kontaktuppgifter"
          description="Kunden behover inget konto. Bara aktiva tjanster och verkligt lediga tider visas."
        />

        <form className="mt-8 grid gap-4" onSubmit={form.handleSubmit((values) => bookingMutation.mutate(values))}>
          <Field error={form.formState.errors.service_id?.message} label="Behandling">
            <Select {...form.register('service_id')}>
              <option value="">Valj behandling</option>
              {(servicesQuery.data ?? []).map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} · {service.duration_minutes} min · {service.price} SEK
                </option>
              ))}
            </Select>
          </Field>
          <Field error={form.formState.errors.booking_date?.message} label="Datum">
            <Input min={minDate} type="date" {...form.register('booking_date')} />
          </Field>
          <Field error={form.formState.errors.start_time?.message} label="Ledig tid">
            <Select {...form.register('start_time')}>
              <option value="">Valj en tid</option>
              {slots.map((slot) => (
                <option key={slot.startTime} value={slot.startTime}>
                  {slot.label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field error={form.formState.errors.customer_name?.message} label="Namn">
              <Input placeholder="Anna Andersson" {...form.register('customer_name')} />
            </Field>
            <Field error={form.formState.errors.customer_phone?.message} label="Telefon">
              <Input placeholder="0701234567" {...form.register('customer_phone')} />
            </Field>
          </div>
          <Field error={form.formState.errors.customer_email?.message} label="E-post">
            <Input placeholder="anna@example.com" type="email" {...form.register('customer_email')} />
          </Field>
          <Field error={form.formState.errors.customer_message?.message} label="Meddelande" hint="Valfritt">
            <Textarea placeholder="Skriv om du har onskemal eller fragor" {...form.register('customer_message')} />
          </Field>

          <Button disabled={bookingMutation.isPending || !slots.length} type="submit">
            Skicka bokning
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-950">Vald behandling</h2>
          {selectedService ? (
            <div className="mt-4 space-y-3 text-sm leading-6 text-ink-900/70">
              <p className="text-lg font-semibold text-ink-950">{selectedService.name}</p>
              <p>{selectedService.description}</p>
              <div className="flex flex-wrap gap-3 text-sm font-medium text-ink-950">
                <span>{selectedService.duration_minutes} minuter</span>
                <span>{selectedService.price} SEK</span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-900/60">Valj en behandling for att se pris och varaktighet.</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-950">Hur lediga tider raknas fram</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-ink-900/70">
            <li>Oppettider och lunchpauser for vald veckodag.</li>
            <li>Befintliga bokningar som overlappar behandlingen.</li>
            <li>Behandlingens varaktighet i minuter.</li>
            <li>Stangda dagar och fullbokade luckor visas inte.</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-950">Kontaktuppgifter</h2>
          <div className="mt-4 grid gap-3 text-sm text-ink-900/70">
            <div className="inline-flex items-center gap-3"><UserRound className="h-4 w-4 text-copper-600" /> Inget konto behovs</div>
            <div className="inline-flex items-center gap-3"><Phone className="h-4 w-4 text-copper-600" /> Telefon och e-post sparas med bokningen</div>
            <div className="inline-flex items-center gap-3"><Mail className="h-4 w-4 text-copper-600" /> Bekraftelse skickas via Resend</div>
            <div className="inline-flex items-center gap-3"><MessageSquareMore className="h-4 w-4 text-copper-600" /> Meddelande ar valfritt</div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export function PublicBookingSection() {
  if (!isConfigured.supabase) {
    return (
      <SetupNotice
        title="Supabase saknas"
        description="Satt VITE_SUPABASE_URL och VITE_SUPABASE_ANON_KEY innan den publika bokningssidan tas i bruk."
      />
    )
  }

  return <PublicBookingSectionInner />
}