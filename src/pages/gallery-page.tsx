import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Camera, Images } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/shell/page-shell'
import { env, isConfigured } from '../lib/env'
import { getPublicSupabaseClient } from '../lib/supabase'
import { fetchActiveGalleryImages } from '../features/gallery/gallery-api'
import bil1Image from '../assets/img/bil1.jpg'
import bild2Image from '../assets/img/bild2.png'
import bild3Image from '../assets/img/bild3.png'

const previewImages = [
  { title: 'Balayage med mjuka toner', image_url: bil1Image },
  { title: 'Klassisk herrklippning', image_url: bild2Image },
  { title: 'Glansig styling', image_url: bild3Image },
  { title: 'Formad fade', image_url: bild2Image },
  { title: 'Naturliga slingor', image_url: bil1Image },
  { title: 'Farg och finish', image_url: bild3Image },
  { title: 'Texturerad klippning', image_url: bil1Image },
  { title: 'Kort skarp profil', image_url: bild2Image },
  { title: 'Lang styling', image_url: bild3Image },
]

export function GalleryPage() {
  const galleryQuery = useQuery({
    enabled: isConfigured.supabase,
    queryKey: ['gallery', 'public'],
    queryFn: () => fetchActiveGalleryImages(getPublicSupabaseClient()),
  })

  const images = isConfigured.supabase
    ? (galleryQuery.data ?? [])
    : previewImages

  return (
    <PageShell className="gap-0 py-0 sm:py-0 lg:py-0">
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(170deg,transparent_0,transparent_13px,#111_14px,transparent_15px)]" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.34fr_0.66fr] lg:px-12 lg:py-20">
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-gold-500" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-600">
                Stilgalleri
              </p>
            </div>

            <h1 className="font-serif text-4xl leading-[0.98] text-ink-950 sm:text-5xl lg:text-6xl">
              Vara kunders forvandlingar
            </h1>

            <p className="mt-6 max-w-sm text-sm leading-7 text-ink-900/70 sm:text-base">
              Upptack resultat fran {env.salonName}. Har visas bilder som admin laddar upp,
              fran klippning och styling till farg och finish.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/booking"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-gold-500 bg-gold-400 px-5 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-500"
              >
                Boka nu
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center rounded-sm border border-ink-900/12 bg-white px-5 py-3 text-sm font-semibold text-ink-900 transition hover:bg-sand-50"
              >
                Se priser
              </Link>
            </div>
          </aside>

          <div>
            {galleryQuery.isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square animate-pulse bg-sand-100"
                  />
                ))}
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {images.map((image, index) => (
                  <article
                    key={`${image.image_url}-${index}`}
                    className="group relative aspect-square overflow-hidden bg-sand-100"
                  >
                    <img
                      alt={image.title}
                      src={image.image_url}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading={index < 6 ? 'eager' : 'lazy'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent opacity-0 transition group-hover:opacity-100" />
                    <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between gap-3 p-3 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 sm:p-4">
                      <p className="line-clamp-2 text-xs font-semibold leading-5 text-white sm:text-sm">
                        {image.title}
                      </p>
                      <Camera className="h-4 w-4 shrink-0 text-white/90" />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center border border-dashed border-ink-900/16 bg-sand-50/70 px-6 text-center">
                <Images className="h-12 w-12 text-copper-600" />
                <h2 className="mt-5 font-serif text-3xl text-ink-950">
                  Galleriet ar snart har
                </h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-ink-900/64">
                  Nar admin laddar upp aktiva bilder visas de automatiskt pa den har sidan.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
