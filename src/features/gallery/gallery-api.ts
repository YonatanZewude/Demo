import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database'
import type { GalleryImage, GalleryImageInsert, GalleryImageUpdate } from './gallery-types'

export async function fetchActiveGalleryImages(
  supabase: SupabaseClient<Database>
): Promise<GalleryImage[]> {
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as GalleryImage[]
}

export async function fetchAllGalleryImages(
  supabase: SupabaseClient<Database>
): Promise<GalleryImage[]> {
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as GalleryImage[]
}

export async function createGalleryImage(
  supabase: SupabaseClient<Database>,
  image: GalleryImageInsert
): Promise<GalleryImage> {
  const { data, error } = await supabase
    .from('gallery_images')
    .insert(image)
    .select()
    .single()

  if (error) throw error
  return data as GalleryImage
}

export async function updateGalleryImage(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: GalleryImageUpdate
): Promise<GalleryImage> {
  const { data, error } = await supabase
    .from('gallery_images')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as GalleryImage
}

export async function deleteGalleryImage(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('gallery_images')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function uploadGalleryImage(
  supabase: SupabaseClient<Database>,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeName = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  const fileName = `${Date.now()}-${safeName || 'gallery-image'}-${crypto.randomUUID()}.${fileExt}`
  const filePath = `uploads/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('gallery')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function deleteStorageImage(
  supabase: SupabaseClient<Database>,
  imageUrl: string
): Promise<void> {
  const urlParts = imageUrl.split('/gallery/')
  if (urlParts.length < 2) return

  const filePath = decodeURIComponent(urlParts[1].split('?')[0])
  
  const { error } = await supabase.storage
    .from('gallery')
    .remove([filePath])

  if (error) throw error
}
