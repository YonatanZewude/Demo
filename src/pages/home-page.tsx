import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Star,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageShell } from '../components/shell/page-shell'
import { cn } from '../lib/cn'
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
  const [activeHeroIndex, setActiveHeroIndex] = useState(0)

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

  const heroSlides = useMemo(() => {
    if (galleryImages.length >= 3) {
      return galleryImages.slice(0, 3)
    }

    return fallbackImages
  }, [galleryImages])

  useEffect(() => {
    setActiveHeroIndex(0)
  }, [heroSlides])

  useEffect(() => {
    if (heroSlides.length <= 1) {
      return
    }

    const interval = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % heroSlides.length)
    }, 8500)

    return () => window.clearInterval(interval)
  }, [heroSlides.length])

  return (
    <PageShell className="gap-0">
      {/* Hero Section */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden">
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <img
              key={`${slide.title}-${slide.image}`}
              alt={slide.title}
              src={slide.image}
              className={cn(
                'absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[2200ms] ease-in-out',
                index === activeHeroIndex ? 'opacity-100' : 'opacity-0',
              )}
            />
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,162,39,0.18),transparent_42%),linear-gradient(90deg,rgba(7,7,7,0.74),rgba(7,7,7,0.46)_45%,rgba(7,7,7,0.7))]" />
        </div>

        <div className="relative mx-auto flex min-h-[75vh] max-w-7xl items-end px-6 pb-14 pt-24 sm:px-8 sm:pb-20 sm:pt-28 lg:min-h-[82vh] lg:px-12 lg:pb-24">
          <div className="max-w-3xl space-y-6 text-white sm:space-y-7">
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-gold-300/90 sm:text-sm">
              Varje klippning, ett hantverk
            </p>

            <h1 className="font-serif text-5xl leading-[0.98] tracking-[0.01em] text-white sm:text-6xl lg:text-8xl">
              {env.salonHeroTitle}
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-white/86 sm:text-xl">
              {env.salonHeroDescription}
            </p>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
              <Link to="/booking" className="inline-flex items-center justify-center gap-2 rounded-full border border-gold-300/55 bg-gold-400/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-gold-400/35">
                Boka tid
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Se alla tjanster
              </Link>
            </div>

            <div className="flex items-center gap-3 pt-4">
              {heroSlides.map((slide, index) => (
                <button
                  key={`${slide.title}-dot`}
                  type="button"
                  onClick={() => setActiveHeroIndex(index)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500',
                    index === activeHeroIndex ? 'w-11 bg-gold-300' : 'w-6 bg-white/40 hover:bg-white/70',
                  )}
                  aria-label={`Visa hero-bild ${index + 1}`}
                />
              ))}
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
