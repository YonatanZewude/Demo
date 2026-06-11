import { CalendarDays, Clock3, Home, Image, LogOut, Scissors } from 'lucide-react'
import { SignOutButton, UserButton } from '@clerk/clerk-react'
import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '../ui/button'
import { cn } from '../../lib/cn'

const links = [
  { to: '/admin', label: 'Oversikt', icon: Home, end: true },
  { to: '/admin/services', label: 'Tjanster', icon: Scissors },
  { to: '/admin/opening-hours', label: 'Oppettider', icon: Clock3 },
  { to: '/admin/bookings', label: 'Bokningar', icon: CalendarDays },
  { to: '/admin/gallery', label: 'Galleri', icon: Image },
]

export function AdminLayout() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="surface-panel bg-ink-950 px-6 py-6 text-white">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-white/60">Admin Dashboard</p>
            <h1 className="mt-2 font-serif text-4xl">Hantera salongens bokningar och schema</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-white/15 bg-white/10 px-2 py-2">
              <UserButton afterSignOutUrl="/" />
            </div>
            <SignOutButton>
              <Button className="bg-white/10 text-white hover:bg-white/20" variant="ghost">
                <LogOut className="h-4 w-4" />
                Logga ut
              </Button>
            </SignOutButton>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-2">
          {links.map(({ icon: Icon, ...link }) => (
            <NavLink
              key={link.to}
              end={link.end}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition',
                  isActive
                    ? 'border-copper-600 bg-copper-600 text-white'
                    : 'border-salon-line bg-white/85 text-ink-900/70 hover:bg-white',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </aside>

        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  )
}