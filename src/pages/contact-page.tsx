import { MapPin, Mail, Phone } from 'lucide-react'
import { Card } from '../components/ui/card'
import { PageShell } from '../components/shell/page-shell'
import { env } from '../lib/env'

export function ContactPage() {
  return (
    <PageShell className="gap-8 lg:gap-10">
      <section className="surface-panel surface-hero gold-ring px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-copper-600">Kontakt</p>
            <h1 className="mt-3 max-w-4xl font-serif text-5xl leading-none text-ink-950 sm:text-6xl">
              {env.contactPageTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-ink-900/72 sm:text-lg">
              {env.contactPageDescription}
            </p>
          </div>

          <Card className="surface-dark overflow-hidden border-none p-6 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">Direktkontakt</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-white/72">
              <p>Telefon: {env.salonPhone}</p>
              <p>E-post: {env.salonEmail}</p>
              <p>Adress: {env.salonAddress}</p>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
        <Card className="hairline-gold p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-ink-950">Kontaktuppgifter</h2>
          <div className="mt-6 space-y-5 text-sm leading-6 text-ink-900/72">
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-4 w-4 text-copper-600" />
              <div>
                <p className="font-semibold text-ink-950">Telefon</p>
                <a className="transition hover:text-copper-700" href={`tel:${env.salonPhone}`}>
                  {env.salonPhone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-4 w-4 text-copper-600" />
              <div>
                <p className="font-semibold text-ink-950">E-post</p>
                <a className="transition hover:text-copper-700" href={`mailto:${env.salonEmail}`}>
                  {env.salonEmail}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-4 w-4 text-copper-600" />
              <div>
                <p className="font-semibold text-ink-950">Adress</p>
                <p>{env.salonAddress}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[24px] bg-sand-50 px-4 py-5 text-sm leading-7 text-ink-900/70">
            Enkel kontaktsektion med tydlig information for nya kunder som vill ringa, mejla eller hitta till salongen direkt.
          </div>
        </Card>

        <Card className="overflow-hidden p-2 sm:p-3">
          <div className="overflow-hidden rounded-[1.75rem] border border-salon-line bg-sand-50">
            <iframe
              className="h-[480px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={env.salonMapEmbedUrl}
              title={`Karta till ${env.salonName}`}
            />
          </div>
        </Card>
      </section>
    </PageShell>
  )
}