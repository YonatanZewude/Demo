import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, Image, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { SectionHeader } from '../../components/ui/section-header'
import { useSupabaseClient } from '../../lib/supabase'
import {
  createGalleryImage,
  deleteGalleryImage,
  deleteStorageImage,
  fetchAllGalleryImages,
  updateGalleryImage,
  uploadGalleryImage,
} from './gallery-api'

export function GalleryAdminSection() {
  const queryClient = useQueryClient()
  const supabase = useSupabaseClient()
  const [uploading, setUploading] = useState(false)

  const imagesQuery = useQuery({
    queryKey: ['gallery', 'admin'],
    queryFn: () => fetchAllGalleryImages(supabase),
  })

  const createMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true)
      try {
        const imageUrl = await uploadGalleryImage(supabase, file)
        const maxOrder = Math.max(0, ...(imagesQuery.data?.map((img) => img.display_order) ?? []))

        await createGalleryImage(supabase, {
          title: file.name.split('.')[0],
          image_url: imageUrl,
          display_order: maxOrder + 1,
          is_active: false,
        })
      } finally {
        setUploading(false)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateGalleryImage(supabase, id, { is_active: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (image: { id: string; image_url: string }) => {
      await deleteGalleryImage(supabase, image.id)

      try {
        await deleteStorageImage(supabase, image.image_url)
      } catch (error) {
        console.error('Failed to delete storage image:', error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Valj en bildfil.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Bilden far max vara 5MB.')
      return
    }

    createMutation.mutate(file)
    event.target.value = ''
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Galleri"
        title="Bildbibliotek"
        description="Ladda upp, forhandsgranska och publicera bilder som bygger salongens visuella uttryck."
      />

      <Card className="overflow-hidden p-0">
        <div className="surface-gold flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-copper-700">
              <Image className="h-4 w-4" />
              Studio media
            </div>
            <h2 className="mt-4 text-2xl font-bold text-ink-950">Publicera ett elegant galleri</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-900/62">
              Nya bilder laddas upp som utkast. Publicera bara de bilder som ska synas for kunder.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <label htmlFor="upload-image" className="cursor-pointer">
              <div className="inline-flex min-h-12 items-center gap-2 rounded-full bg-copper-600 px-5 text-sm font-bold text-white transition hover:bg-copper-700">
                <Upload className="h-5 w-5" />
                {uploading ? 'Laddar upp...' : 'Ladda upp bild'}
              </div>
              <input
                accept="image/*"
                className="hidden"
                disabled={uploading}
                id="upload-image"
                onChange={handleFileUpload}
                type="file"
              />
            </label>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-salon-line bg-white px-5 text-sm font-bold text-ink-950 transition hover:bg-sand-50"
              to="/gallery"
            >
              Visa publikt
            </Link>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {imagesQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-4/3 animate-pulse rounded-3xl bg-sand-100" />
              ))}
            </div>
          ) : null}

          {imagesQuery.data && imagesQuery.data.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-ink-900/10 py-14 text-center">
              <Image className="mx-auto h-12 w-12 text-ink-900/20" />
              <h3 className="mt-4 text-lg font-bold text-ink-950">Inga bilder uppladdade</h3>
              <p className="mt-2 text-sm text-ink-900/62">Ladda upp forsta bilden for att bygga galleriet.</p>
            </div>
          ) : null}

          {imagesQuery.data && imagesQuery.data.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {imagesQuery.data.map((image) => (
                <article key={image.id} className="overflow-hidden rounded-3xl border border-salon-line bg-white shadow-sm">
                  <div className="relative aspect-4/3">
                    <img
                      alt={image.title}
                      className="h-full w-full object-cover"
                      src={image.image_url}
                    />
                    <div className="absolute left-3 top-3">
                      <Badge status={image.is_active ? 'confirmed' : 'pending'}>
                        {image.is_active ? 'Publicerad' : 'Utkast'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <div>
                      <h3 className="line-clamp-1 text-base font-bold text-ink-950">{image.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-ink-900/58">
                        {image.is_active
                          ? 'Syns pa den publika gallerisidan.'
                          : 'Syns inte publikt forran du publicerar den.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        className="flex-1"
                        disabled={toggleActiveMutation.isPending}
                        onClick={() =>
                          toggleActiveMutation.mutate({
                            id: image.id,
                            isActive: image.is_active,
                          })
                        }
                        variant={image.is_active ? 'secondary' : 'primary'}
                      >
                        {image.is_active ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Dolj
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Publicera
                          </>
                        )}
                      </Button>

                      <Button
                        aria-label={`Ta bort ${image.title}`}
                        className="px-3"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm('Vill du ta bort denna bild?')) {
                            deleteMutation.mutate({
                              id: image.id,
                              image_url: image.image_url,
                            })
                          }
                        }}
                        variant="danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
