import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, Image, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSupabaseClient } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { SectionHeader } from '../../components/ui/section-header'
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
      alert('Vänligen välj en bildfil')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Bilden får max vara 5MB')
      return
    }

    createMutation.mutate(file)
    event.target.value = ''
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Admin"
        title="Galleri"
        description="Ladda upp bilder och publicera dem när de ska visas på gallerisidan."
      />

      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <label htmlFor="upload-image" className="cursor-pointer">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-ink-900/20 bg-sand-50 px-6 py-4 transition hover:border-ink-900/40 hover:bg-sand-100">
              <Upload className="h-5 w-5 text-ink-900" />
              <span className="text-sm font-semibold text-ink-900">
                {uploading ? 'Laddar upp...' : 'Ladda upp bild'}
              </span>
            </div>
            <input
              id="upload-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>

          <div className="space-y-2 md:text-right">
            <Link
              to="/gallery"
              className="inline-flex items-center justify-center rounded-full border border-ink-900/10 bg-white px-4 py-2 text-sm font-semibold text-ink-900 transition hover:bg-sand-50"
            >
              Visa gallerisidan
            </Link>
            <p className="text-xs text-ink-900/62">
              Nya bilder laddas upp som utkast. Klicka på Publicera för att visa dem publikt.
            </p>
            <p className="text-xs text-ink-900/62">Max 5MB. JPG, PNG eller WebP.</p>
          </div>
        </div>

        {imagesQuery.isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-4/3 animate-pulse rounded-2xl bg-sand-100" />
            ))}
          </div>
        )}

        {imagesQuery.data && imagesQuery.data.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-ink-900/10 py-12 text-center">
            <Image className="mx-auto h-12 w-12 text-ink-900/20" />
            <p className="mt-4 text-sm text-ink-900/62">Inga bilder uppladdade än</p>
          </div>
        )}

        {imagesQuery.data && imagesQuery.data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {imagesQuery.data.map((image) => (
              <article key={image.id} className="overflow-hidden rounded-2xl border border-salon-line bg-white shadow-sm">
                <div className="relative aspect-4/3">
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-ink-950 shadow-sm">
                    {image.is_active ? 'Publicerad' : 'Utkast'}
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div>
                    <h3 className="line-clamp-1 text-sm font-semibold text-ink-950">{image.title}</h3>
                    <p className="mt-1 text-xs text-ink-900/58">
                      {image.is_active
                        ? 'Visas på den publika gallerisidan.'
                        : 'Syns inte publikt förrän du publicerar den.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={image.is_active ? 'secondary' : 'primary'}
                      className="flex-1"
                      disabled={toggleActiveMutation.isPending}
                      onClick={() =>
                        toggleActiveMutation.mutate({
                          id: image.id,
                          isActive: image.is_active,
                        })
                      }
                    >
                      {image.is_active ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Dölj
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Publicera
                        </>
                      )}
                    </Button>

                    <Button
                      variant="danger"
                      className="px-3"
                      disabled={deleteMutation.isPending}
                      aria-label={`Ta bort ${image.title}`}
                      onClick={() => {
                        if (confirm('Är du säker på att du vill ta bort denna bild?')) {
                          deleteMutation.mutate({
                            id: image.id,
                            image_url: image.image_url,
                          })
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
