import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Card } from '../../components/ui/card'
import { SectionHeader } from '../../components/ui/section-header'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { useSupabaseClient } from '../../lib/supabase'
import { createService, deleteService, fetchAdminServices, updateService } from './service-api'
import { ServiceForm } from './service-form'
import type { ServiceFormValues } from './service-schema'
import type { Service } from './service-types'

export function ServicesAdminSection() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const [editingService, setEditingService] = useState<Service | null>(null)

  const servicesQuery = useQuery({
    queryKey: ['services', 'admin'],
    queryFn: () => fetchAdminServices(supabase),
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['services'] })
  }

  const createMutation = useMutation({
    mutationFn: (values: ServiceFormValues) => createService(supabase, values),
    onSuccess: async () => {
      toast.success('Tjansten skapades.')
      await invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ServiceFormValues }) =>
      updateService(supabase, id, values),
    onSuccess: async () => {
      setEditingService(null)
      toast.success('Tjansten uppdaterades.')
      await invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteService(supabase, id),
    onSuccess: async () => {
      toast.success('Tjansten togs bort.')
      await invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const services = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data])

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Tjanster"
        title="Bygg salongens behandlingsmeny"
        description="Skapa och uppdatera behandlingar med pris, behandlingstid, beskrivning och aktiv status."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-950">{editingService ? 'Redigera tjanst' : 'Ny tjanst'}</h2>
          <p className="mt-2 text-sm leading-6 text-ink-900/65">Behandlingarna blir direkt tillgangliga pa bokningssidan nar de ar aktiva.</p>
          <div className="mt-6">
            <ServiceForm
              initialValues={editingService}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
              onCancel={editingService ? () => setEditingService(null) : undefined}
              onSubmit={async (values) => {
                if (editingService) {
                  await updateMutation.mutateAsync({ id: editingService.id, values })
                  return
                }

                await createMutation.mutateAsync(values)
              }}
            />
          </div>
        </Card>

        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold text-ink-950">{service.name}</h3>
                    <Badge status={service.is_active ? 'confirmed' : 'cancelled'}>
                      {service.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                  <p className="max-w-2xl text-sm leading-6 text-ink-900/70">{service.description}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-ink-900/65">
                    <span>{service.duration_minutes} min</span>
                    <span>{service.price} SEK</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setEditingService(service)} variant="secondary">
                    <Pencil className="h-4 w-4" />
                    Redigera
                  </Button>
                  <Button onClick={() => deleteMutation.mutate(service.id)} variant="danger">
                    <Trash2 className="h-4 w-4" />
                    Radera
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {!services.length && !servicesQuery.isLoading ? (
            <Card className="p-6 text-sm text-ink-900/65">Inga tjanster finns annu. Lagg till den forsta behandlingen till vanster.</Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}