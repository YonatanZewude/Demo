import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { env, isConfigured } from '../lib/env'

function ProvidersCore({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  )
}

export function AppProviders({ children }: PropsWithChildren) {
  if (!isConfigured.clerk) {
    return <ProvidersCore>{children}</ProvidersCore>
  }

  return (
    <ClerkProvider publishableKey={env.clerkPublishableKey}>
      <ProvidersCore>{children}</ProvidersCore>
    </ClerkProvider>
  )
}