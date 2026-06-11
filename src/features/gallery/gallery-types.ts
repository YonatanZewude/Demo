export interface GalleryImage {
  id: string
  title: string
  image_url: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GalleryImageInsert {
  title: string
  image_url: string
  display_order?: number
  is_active?: boolean
}

export interface GalleryImageUpdate {
  title?: string
  image_url?: string
  display_order?: number
  is_active?: boolean
}
