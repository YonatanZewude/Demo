import { PageShell } from '../components/shell/page-shell'
import { PublicServicesSection } from '../features/services/public-services-section'

export function ServicesPage() {
  return (
    <PageShell>
      <PublicServicesSection />
    </PageShell>
  )
}