import { useQuery } from '@tanstack/react-query'
import { Clock3, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/card'
import { SectionHeader } from '../../components/ui/section-header'
import { env, isConfigured } from '../../lib/env'
import { getPublicSupabaseClient } from '../../lib/supabase'
import { fetchActiveServices } from './service-api'
import { mapServicesToDisplay, showcaseServices, type DisplayService } from './showcase-services'

function PublicServicesSectionContent({ services, isLoading }: { services: DisplayService[]; isLoading?: boolean }) {
  const hasServices = services.length > 0

  return (
    <div className="space-y-8">
      <section className="surface-panel surface-hero gold-ring px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <SectionHeader
            eyebrow="Tjanster"
            title={env.servicesPageTitle}
            description={env.servicesPageDescription}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="hairline-gold p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-copper-600">Valj behandling</p>
              <p className="mt-3 text-sm leading-7 text-ink-900/72">Se behandlingar, behandlingstid och pris innan du bokar.</p>
            </Card>
            <Card className="hairline-gold p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-copper-600">Direkt online</p>
              <p className="mt-3 text-sm leading-7 text-ink-900/72">Boka direkt online med ett enkelt och tydligt flode.</p>
            </Card>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-sand-100" />
                <div className="min-w-0 flex-1">
                  <div className="h-6 w-2/3 rounded-full bg-sand-100" />
                  <div className="mt-3 h-4 w-24 rounded-full bg-sand-100" />
                  <div className="mt-4 h-10 rounded-3xl bg-sand-50" />
                </div>
                <div className="h-10 w-20 rounded-xl bg-sand-100" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id} className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sand-50 text-copper-600">
                  <Tag className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-semibold text-ink-950 sm:text-2xl">{service.name}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-900/62">
                        <span className="inline-flex items-center gap-2 rounded-full bg-sand-50 px-3 py-1.5 font-medium text-ink-900/75">
                          <Clock3 className="h-4 w-4 text-copper-600" />
                          {service.durationLabel}
                        </span>
                        <span className="text-base font-semibold text-ink-950">{service.priceLabel}</span>
                      </div>
                    </div>
                    <Link to="/booking" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-ink-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-900">
                      Boka
                    </Link>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-ink-900/70">{service.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !hasServices ? (
        <Card className="p-6 text-sm text-ink-900/65">Inga aktiva tjanster finns just nu. Lagg till dem i admin innan sidan publiceras.</Card>
      ) : null}

      <Card className="surface-dark overflow-hidden border-none flex flex-col items-start gap-5 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-2xl font-semibold text-white">Redo att boka?</h2>
          <p className="mt-2 text-sm leading-7 text-white/72">Kunden kan ga vidare direkt till bokningssidan utan att skapa konto.</p>
        </div>
        <Link to="/booking" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-sand-50">
          Boka tid
        </Link>
      </Card>
    </div>
  )
}

function PublicServicesSectionInner() {
  const supabase = getPublicSupabaseClient()
  const servicesQuery = useQuery({
    queryKey: ['services', 'active'],
    queryFn: () => fetchActiveServices(supabase),
  })

  const services = servicesQuery.data?.length ? mapServicesToDisplay(servicesQuery.data) : showcaseServices

  return <PublicServicesSectionContent isLoading={servicesQuery.isLoading} services={services} />
}

export function PublicServicesSection() {
  if (!isConfigured.supabase) {
    return <PublicServicesSectionContent services={showcaseServices} />
  }

  return <PublicServicesSectionInner />
}