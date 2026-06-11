import {
  ArrowRight,
  Star,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageShell } from '../components/shell/page-shell'
import { env, isConfigured } from '../lib/env'
import { getPublicSupabaseClient } from '../lib/supabase'
import { fetchActiveGalleryImages } from '../features/gallery/gallery-api'

const fallbackImages = [
  {
    title: 'Professionell klippning',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Modern styling',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Lyxig salongsinterior',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=80',
  },
]

const demoReviews = [
  { name: 'Sara M.', quote: 'Smidig bokning och valdigt professionellt bemotande.' },
  { name: 'Daniel K.', quote: 'Fin salong, tydliga priser och enkel onlinebokning.' },
  { name: 'Elin T.', quote: 'Jag bokade min tid direkt fran mobilen. Superenkelt.' },
]

export function HomePage() {
  const galleryQuery = useQuery({
    enabled: isConfigured.supabase,
    queryKey: ['gallery', 'public'],
    queryFn: () => fetchActiveGalleryImages(getPublicSupabaseClient()),
  })

  const galleryImages = galleryQuery.data?.length
    ? galleryQuery.data.map((img) => ({
        title: img.title,
        image: img.image_url,
      }))
    : fallbackImages

  return (
    <PageShell className="gap-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
            <div className="space-y-8 lg:space-y-10">
              <div className="space-y-6">
                <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-ink-950 sm:text-6xl lg:text-7xl">
                  {env.salonHeroTitle}
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-ink-900/70 sm:text-xl">
                  {env.salonHeroDescription}
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to="/booking" className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-950 px-8 py-4 text-base font-semibold text-white transition hover:bg-ink-900">
                  Boka tid
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center rounded-full border border-ink-900/10 px-8 py-4 text-base font-semibold text-ink-900 transition hover:bg-sand-50"
                >
                  Se alla tjanster
                </Link>
              </div>
            </div>

            <div className="relative aspect-4/5 overflow-hidden rounded-3xl">
              <img
                alt="Professionell frisörsalong"
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="bg-sand-50/40 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-4xl leading-tight tracking-tight text-ink-950 sm:text-5xl lg:text-6xl">Professionell hårvård</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-900/68">
              Vi skapar moderna frisyrer i en stilren och lugn miljö
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {galleryImages.map((item, index) => (
              <div 
                key={item.title} 
                className={`relative overflow-hidden rounded-3xl ${
                  index === 0 ? 'md:col-span-2 aspect-21/9' : 'aspect-4/3'
                }`}
              >
                <img alt={item.title} className="h-full w-full object-cover" src={item.image} />
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/booking" className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-950 px-8 py-4 text-base font-semibold text-white transition hover:bg-ink-900">
              Boka tid
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/services" className="inline-flex items-center justify-center rounded-full border border-ink-900/10 px-8 py-4 text-base font-semibold text-ink-900 transition hover:bg-sand-50">
              Se priser
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-sand-50/40 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mb-12">
            <h2 className="font-serif text-4xl leading-tight tracking-tight text-ink-950 sm:text-5xl lg:text-6xl">Recensioner</h2>
          </div>

          <div className="grid gap-12 md:grid-cols-3 lg:gap-16">
            {demoReviews.map((review) => (
              <div key={review.name} className="space-y-5">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-ink-950 text-ink-950" />
                  ))}
                </div>
                <p className="text-lg leading-relaxed text-ink-900/78">"{review.quote}"</p>
                <p className="text-base font-semibold text-ink-950">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
