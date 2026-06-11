import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Field, Input } from '../../components/ui/field'
import { SectionHeader } from '../../components/ui/section-header'
import { useSupabaseClient } from '../../lib/supabase'
import { fetchOpeningHours, saveOpeningHours } from './opening-hours-api'
import { openingHoursSchema, type OpeningHoursFormValues } from './opening-hours-schema'

const weekdayLabels = ['Sondag', 'Mandag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lordag']

export function OpeningHoursAdminSection() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['opening-hours'],
    queryFn: () => fetchOpeningHours(supabase),
  })

  const form = useForm<OpeningHoursFormValues>({
    resolver: zodResolver(openingHoursSchema),
    defaultValues: [],
  })

  useEffect(() => {
    if (query.data) {
      form.reset(query.data)
    }
  }, [form, query.data])

  const mutation = useMutation({
    mutationFn: (values: OpeningHoursFormValues) => saveOpeningHours(supabase, values),
    onSuccess: async () => {
      toast.success('Oppettiderna sparades.')
      await queryClient.invalidateQueries({ queryKey: ['opening-hours'] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Oppettider"
        title="Styr veckoschema och lunchpauser"
        description="Varje veckodag kan markeras som oppen eller stangd med start, slut och valfri rast."
      />

      <Card className="p-6">
        <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          {(query.data ?? []).map((row, index) => (
            <div key={row.id} className="rounded-3xl border border-salon-line bg-sand-50 p-5">
              <input type="hidden" {...form.register(`${index}.id`)} />
              <input type="hidden" {...form.register(`${index}.weekday`, { valueAsNumber: true })} />
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-ink-950">{weekdayLabels[row.weekday]}</h3>
                  <p className="mt-1 text-sm text-ink-900/60">Justera tiderna som styr tillgangliga bokningsluckor.</p>
                </div>
                <label className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-950">
                  <input type="checkbox" {...form.register(`${index}.is_open`)} />
                  Oppet
                </label>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field error={form.formState.errors[index]?.start_time?.message} label="Oppnar">
                  <Input type="time" {...form.register(`${index}.start_time`)} />
                </Field>
                <Field error={form.formState.errors[index]?.end_time?.message} label="Stanger">
                  <Input type="time" {...form.register(`${index}.end_time`)} />
                </Field>
                <Field error={form.formState.errors[index]?.break_start?.message} label="Lunch start">
                  <Input type="time" {...form.register(`${index}.break_start`)} />
                </Field>
                <Field error={form.formState.errors[index]?.break_end?.message} label="Lunch slut">
                  <Input type="time" {...form.register(`${index}.break_end`)} />
                </Field>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <Button disabled={mutation.isPending || query.isLoading} type="submit">
              Spara oppettider
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}