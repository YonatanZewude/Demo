import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react'
import type { ReactNode } from 'react'
import { SetupNotice } from '../shared/setup-notice'
import { useAdminAccess } from '../../features/admin/use-admin-access'
import { isConfigured } from '../../lib/env'

type ProtectedRouteProps = {
  children: ReactNode
}

function ProtectedRouteInner({ children }: ProtectedRouteProps) {
  const { isLoading, isAdmin, error } = useAdminAccess()

  return (
    <>
      <SignedIn>
        {isLoading ? (
          <SetupNotice
            title="Kontrollerar adminbehörighet"
            description="Verifierar åtkomst till dashboarden i Supabase."
          />
        ) : isAdmin ? (
          children
        ) : (
          <SetupNotice
            title="Du saknar adminbehörighet"
            description={
              error ??
              'Lägg till ditt Clerk user ID i tabellen admin_users i Supabase för att ge åtkomst till dashboarden.'
            }
          />
        )}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl="/admin" />
      </SignedOut>
    </>
  )
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isConfigured.clerk) {
    return (
      <SetupNotice
        title="Clerk behöver konfigureras"
        description="Sätt VITE_CLERK_PUBLISHABLE_KEY för att aktivera admininloggning och skyddade routes."
      />
    )
  }

  if (!isConfigured.supabase) {
    return (
      <SetupNotice
        title="Supabase behöver konfigureras"
        description="Sätt VITE_SUPABASE_URL och VITE_SUPABASE_ANON_KEY för att aktivera adminpanelen och Supabase-kopplingen."
      />
    )
  }

  return <ProtectedRouteInner>{children}</ProtectedRouteInner>
}