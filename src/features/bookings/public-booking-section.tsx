import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { addDays, format, startOfToday } from 'date-fns'
import {
  CalendarDays,
  Check,
  Clock3,
  Mail,
  MessageSquareMore,
  Phone,
  Scissors,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { SetupNotice } from '../../components/shared/setup-notice'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Field, Input, Textarea } from '../../components/ui/field'
import { SectionHeader } from '../../components/ui/section-header'
import { cn } from '../../lib/cn'
import { isConfigured } from '../../lib/env'
import { getPublicSupabaseClient } from '../../lib/supabase'
import { fetchOpeningHours } from '../opening-hours/opening-hours-api'
import { fetchActiveServices } from '../services/service-api'
import { fetchBookingOccupancy, createBooking } from './booking-api'
import { getAvailableTimeSlots } from './booking-availability'
import { bookingFormSchema, type BookingFormValues } from './booking-schema'

const minDate = format(startOfToday(), 'yyyy-MM-dd')
const quickDates = Array.from({ length: 14 }, (_, index) => addDays(startOfToday(), index))

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat('sv-SE', { weekday: 'short' }).format(date)
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short' }).format(date)
}

function formatLongDate(value: string) {
  if (!value) return 'Valj datum'

  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(new Date(`${value}T12:00:00`))
}

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
  const startTime = useWatch({ control: form.control, name: 'start_time' })
  const selectedService = useMemo(
    () => servicesQuery.data?.find((service) => service.id === serviceId),
    [serviceId, servicesQuery.data],
  )
  const selectedDateLabel = useMemo(() => formatLongDate(bookingDate), [bookingDate])

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

  const selectedTimeLabel = useMemo(
    () => slots.find((slot) => slot.startTime === startTime)?.label ?? 'Inte vald',
    [slots, startTime],
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
    <form
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
      onSubmit={form.handleSubmit((values) => bookingMutation.mutate(values))}
    >
      <input type="hidden" {...form.register('service_id')} />
      <input type="hidden" {...form.register('start_time')} />

      <div className="space-y-6">
        <Card className="overflow-hidden p-0">
          <div className="surface-dark px-6 py-8 text-white sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <SectionHeader
                className="max-w-2xl [&_h1]:text-white [&_p]:text-white/68 [&_span]:text-gold-300"
                description="En smidigare bokning utan konto. Valj behandling, dag och tid direkt i flodet."
                eyebrow="Boka tid"
                title="Valj din behandling"
              />
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-gold-300">
                Studio Lumi
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {servicesQuery.isLoading ? (
              <div className="col-span-full rounded-3xl border border-dashed border-salon-line p-6 text-sm text-ink-900/60">
                Hamtar behandlingar...
              </div>
            ) : null}

            {(servicesQuery.data ?? []).map((service) => {
              const isSelected = service.id === serviceId

              return (
                <button
                  className={cn(
                    'group min-h-48 rounded-3xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-copper-600/55 hover:shadow-card focus:outline-none focus:ring-4 focus:ring-copper-600/10',
                    isSelected
                      ? 'border-copper-600 bg-[#fffaf0] shadow-card ring-1 ring-copper-600/25'
                      : 'border-salon-line',
                  )}
                  key={service.id}
                  onClick={() => form.setValue('service_id', service.id, { shouldDirty: true, shouldValidate: true })}
                  type="button"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        'grid h-11 w-11 place-items-center rounded-2xl transition',
                        isSelected ? 'bg-copper-600 text-white' : 'bg-sand-100 text-copper-700',
                      )}
                    >
                      {isSelected ? <Check className="h-5 w-5" /> : <Scissors className="h-5 w-5" />}
                    </span>
                    <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-bold text-ink-950">
                      {service.price} SEK
                    </span>
                  </span>
                  <span className="mt-5 block text-lg font-bold text-ink-950">{service.name}</span>
                  <span className="mt-2 line-clamp-2 block text-sm leading-6 text-ink-900/62">
                    {service.description || 'Professionell behandling hos Studio Lumi.'}
                  </span>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-copper-700">
                    <Clock3 className="h-4 w-4" />
                    {service.duration_minutes} min
                  </span>
                </button>
              )
            })}
          </div>
          {form.formState.errors.service_id ? (
            <p className="px-6 pb-6 text-sm font-medium text-red-600">{form.formState.errors.service_id.message}</p>
          ) : null}
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-copper-700">Datum</p>
              <h2 className="mt-2 text-2xl font-bold text-ink-950">Valj en dag</h2>
            </div>
            <label className="inline-flex items-center gap-3 rounded-full border border-salon-line bg-white px-4 py-2 text-sm font-semibold text-ink-950">
              <CalendarDays className="h-4 w-4 text-copper-700" />
              <Input
                className="min-h-0 w-36 border-0 bg-transparent p-0 focus:ring-0"
                min={minDate}
                type="date"
                {...form.register('booking_date')}
              />
            </label>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {quickDates.map((date) => {
              const value = format(date, 'yyyy-MM-dd')
              const isSelected = bookingDate === value

              return (
                <button
                  className={cn(
                    'rounded-2xl border px-3 py-4 text-center transition focus:outline-none focus:ring-4 focus:ring-copper-600/10',
                    isSelected
                      ? 'border-copper-600 bg-ink-950 text-white shadow-card'
                      : 'border-salon-line bg-white text-ink-950 hover:border-copper-600/55 hover:bg-sand-50',
                  )}
                  key={value}
                  onClick={() => form.setValue('booking_date', value, { shouldDirty: true, shouldValidate: true })}
                  type="button"
                >
                  <span className={cn('block text-xs font-bold uppercase', isSelected ? 'text-gold-300' : 'text-copper-700')}>
                    {formatDayLabel(date)}
                  </span>
                  <span className="mt-1 block text-sm font-semibold">{formatDateLabel(date)}</span>
                </button>
              )
            })}
          </div>
          {form.formState.errors.booking_date ? (
            <p className="mt-3 text-sm font-medium text-red-600">{form.formState.errors.booking_date.message}</p>
          ) : null}
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-copper-700">Tid</p>
              <h2 className="mt-2 text-2xl font-bold text-ink-950">Lediga tider</h2>
              <p className="mt-2 text-sm text-ink-900/60">{selectedDateLabel}</p>
            </div>
            <div className="rounded-full bg-sand-100 px-4 py-2 text-sm font-semibold text-ink-950">
              {slots.length} tider
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {slots.map((slot) => {
              const isSelected = slot.startTime === startTime

              return (
                <button
                  className={cn(
                    'min-h-12 rounded-2xl border px-3 py-3 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-copper-600/10',
                    isSelected
                      ? 'border-copper-600 bg-copper-600 text-white shadow-card'
                      : 'border-salon-line bg-white text-ink-950 hover:border-copper-600/55 hover:bg-sand-50',
                  )}
                  key={slot.startTime}
                  onClick={() => form.setValue('start_time', slot.startTime, { shouldDirty: true, shouldValidate: true })}
                  type="button"
                >
                  {slot.label}
                </button>
              )
            })}
          </div>

          {!slots.length ? (
            <div className="mt-5 rounded-3xl border border-dashed border-salon-line bg-sand-50 p-5 text-sm leading-6 text-ink-900/62">
              Valj en behandling for att se lediga tider. Om dagen ar fullbokad visas inga tider har.
            </div>
          ) : null}
          {form.formState.errors.start_time ? (
            <p className="mt-3 text-sm font-medium text-red-600">{form.formState.errors.start_time.message}</p>
          ) : null}
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-copper-700">Kontakt</p>
            <h2 className="mt-2 text-2xl font-bold text-ink-950">Dina uppgifter</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field error={form.formState.errors.customer_name?.message} label="Namn">
              <Input placeholder="Anna Andersson" {...form.register('customer_name')} />
            </Field>
            <Field error={form.formState.errors.customer_phone?.message} label="Telefon">
              <Input placeholder="0701234567" {...form.register('customer_phone')} />
            </Field>
          </div>
          <div className="mt-4 grid gap-4">
            <Field error={form.formState.errors.customer_email?.message} label="E-post">
              <Input placeholder="anna@example.com" type="email" {...form.register('customer_email')} />
            </Field>
            <Field error={form.formState.errors.customer_message?.message} label="Meddelande" hint="Valfritt">
              <Textarea placeholder="Skriv om du har onskemal eller fragor" {...form.register('customer_message')} />
            </Field>
          </div>
        </Card>
      </div>

      <aside className="xl:sticky xl:top-28 xl:self-start">
        <Card className="overflow-hidden p-0">
          <div className="surface-gold p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-950 text-gold-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-ink-950">Din bokning</h2>
            <p className="mt-2 text-sm leading-6 text-ink-900/62">Kontrollera detaljerna och skicka din forfragan.</p>
          </div>

          <div className="space-y-4 p-6">
            <div className="rounded-3xl bg-sand-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper-700">Behandling</p>
              <p className="mt-2 font-bold text-ink-950">{selectedService?.name ?? 'Inte vald'}</p>
              {selectedService ? (
                <p className="mt-1 text-sm text-ink-900/62">
                  {selectedService.duration_minutes} min / {selectedService.price} SEK
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-sand-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper-700">Dag</p>
                <p className="mt-2 text-sm font-bold capitalize text-ink-950">{selectedDateLabel}</p>
              </div>
              <div className="rounded-3xl bg-sand-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-copper-700">Tid</p>
                <p className="mt-2 text-sm font-bold text-ink-950">{selectedTimeLabel}</p>
              </div>
            </div>

            <div className="grid gap-3 text-sm text-ink-900/70">
              <div className="inline-flex items-center gap-3">
                <UserRound className="h-4 w-4 text-copper-600" /> Inget konto behovs
              </div>
              <div className="inline-flex items-center gap-3">
                <Phone className="h-4 w-4 text-copper-600" /> Vi sparar telefon med bokningen
              </div>
              <div className="inline-flex items-center gap-3">
                <Mail className="h-4 w-4 text-copper-600" /> Bekraftelse skickas via e-post
              </div>
              <div className="inline-flex items-center gap-3">
                <MessageSquareMore className="h-4 w-4 text-copper-600" /> Meddelande ar valfritt
              </div>
            </div>

            <Button className="min-h-13 w-full text-base" disabled={bookingMutation.isPending || !slots.length} type="submit">
              {bookingMutation.isPending ? 'Skickar...' : 'Skicka bokning'}
            </Button>
          </div>
        </Card>
      </aside>
    </form>
  )
}

export function PublicBookingSection() {
  if (!isConfigured.supabase) {
    return (
      <SetupNotice
        description="Satt VITE_SUPABASE_URL och VITE_SUPABASE_ANON_KEY innan den publika bokningssidan tas i bruk."
        title="Supabase saknas"
      />
    )
  }

  return <PublicBookingSectionInner />
}
