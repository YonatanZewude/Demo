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
  {
    name: 'Sara M.',
    quote: 'Smidig bokning och valdigt professionellt bemotande.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    date: 'för 2 veckor sedan',
  },
  {
    name: 'Daniel K.',
    quote: 'Fin salong, tydliga priser och enkel onlinebokning.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    date: 'för 1 månad sedan',
  },
  {
    name: 'Elin T.',
    quote: 'Jag bokade min tid direkt fran mobilen. Superenkelt.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    date: 'för 3 veckor sedan',
  },
]

const curatedExperienceCards = [
  {
    title: 'Skagg och precision',
    subtitle: 'Klassisk barbering med modern finish',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Farg och styling',
    subtitle: 'Skonsam teknik med personligt uttryck',
    image: 'https://images.unsplash.com/photo-1523263685509-57c1d050d19b?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Junior klippning',
    subtitle: 'Trygg upplevelse for barn och ungdom',
    image: 'https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?auto=format&fit=crop&w=900&q=80',
  },
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
    <PageShell className="gap-0 pt-0 sm:pt-0 lg:pt-0">
      {/* Hero Section */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden">
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <img
              key={`${slide.title}-${slide.image}`}
              alt={slide.title}
              src={slide.image}
              className={cn(
                'absolute inset-0 h-full w-full object-cover object-[center_38%] sm:object-[center_34%] lg:object-[center_30%] transition-opacity duration-[2200ms] ease-in-out',
                index === activeHeroIndex ? 'opacity-100' : 'opacity-0',
              )}
            />
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,162,39,0.18),transparent_42%),linear-gradient(90deg,rgba(7,7,7,0.74),rgba(7,7,7,0.46)_45%,rgba(7,7,7,0.7))]" />
        </div>

        <div className="relative mx-auto flex min-h-[75vh] max-w-7xl items-end px-6 pb-14 pt-24 sm:px-8 sm:pb-20 sm:pt-28 lg:min-h-[82vh] lg:px-12 lg:pb-24">
          <div className="max-w-3xl space-y-6 text-white sm:space-y-7">
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-gold-300/90 sm:text-sm">
              Signaturstil med precision och personlighet
            </p>

            <h1 className="font-serif text-4xl leading-[1.02] tracking-[0.01em] text-white sm:text-5xl lg:text-7xl">
              {env.salonHeroTitle}
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-white/86 sm:text-xl">
              {env.salonHeroDescription}
            </p>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
              <Link to="/booking" className="inline-flex items-center justify-center gap-2 rounded-full border border-gold-500 bg-gold-400 px-8 py-4 text-base font-semibold text-ink-950 transition hover:bg-gold-500">
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
            <Link to="/booking" className="inline-flex items-center justify-center gap-2 rounded-full border border-gold-500 bg-gold-400 px-8 py-4 text-base font-semibold text-ink-950 transition hover:bg-gold-500">
              Boka tid
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/services" className="inline-flex items-center justify-center rounded-full border border-ink-900/10 px-8 py-4 text-base font-semibold text-ink-900 transition hover:bg-sand-50">
              Se priser
            </Link>
          </div>
        </div>
      </section>

      {/* Signature Services */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-[linear-gradient(140deg,#07090d_0%,#0d1118_48%,#141b24_100%)] py-16 text-white sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,162,39,0.2),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(99,133,168,0.14),transparent_35%)]" />

        <div className="relative mx-auto flex min-h-[68vh] max-w-7xl items-center px-6 sm:min-h-[72vh] sm:px-8 lg:min-h-[76vh] lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-gold-300/90">
                <span className="h-px w-8 bg-gold-300/70" />
                Skraddarsytt for din stil
              </p>
              <h2 className="font-serif text-4xl leading-tight text-white sm:text-5xl">
                Mer an en klippning, en helhetsupplevelse
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-white/74 sm:text-lg">
                Oavsett om du vill ha en skarp fade, en mjuk fargovergang eller barnklippning med lugn hand,
                formar vi behandlingen efter dig. Var metod bygger pa precision, tempo och detaljer som haller.
              </p>
              <Link
                to="/services"
                className="inline-flex items-center justify-center rounded-full border border-gold-500 bg-gold-400 px-7 py-3.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-500"
              >
                Upptack behandlingar
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 lg:auto-rows-max">
              {curatedExperienceCards.map((card, cardIndex) => (
                <article key={card.title} className={cn("overflow-hidden rounded-2xl border border-white/12 bg-white/95 text-ink-950 shadow-[0_20px_44px_rgba(1,3,7,0.35)]")}>
                  <div className={cn("overflow-hidden", "aspect-[4/7]")}>
                    <img
                      alt={card.title}
                      src={card.image}
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2 px-5 py-5">
                    <h3 className="font-serif text-3xl leading-[1.04] text-ink-950">{card.title}</h3>
                    <p className="text-sm leading-6 text-ink-900/66">{card.subtitle}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-sand-50/40 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mb-12">
            <h2 className="font-serif text-4xl leading-tight tracking-tight text-ink-950 sm:text-5xl lg:text-6xl">Recensioner</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {demoReviews.map((review) => (
              <article key={review.name} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="mb-4 flex gap-4">
                  <img
                    alt={review.name}
                    src={review.avatar}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-950">{review.name}</p>
                    <p className="text-xs text-ink-900/60">{review.date}</p>
                  </div>
                </div>

                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>

                <p className="text-sm leading-relaxed text-ink-900/78">"{review.quote}"</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
