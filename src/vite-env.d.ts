/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_SALON_NAME?: string
  readonly VITE_SALON_TAGLINE?: string
  readonly VITE_SALON_HERO_LABEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}