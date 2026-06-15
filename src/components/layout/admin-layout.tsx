import { CalendarDays, Clock3, Home, Image, LogOut, Scissors } from 'lucide-react'
import { SignOutButton, UserButton } from '@clerk/clerk-react'
import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '../ui/button'
import { cn } from '../../lib/cn'
import { env } from '../../lib/env'

const links = [
  { to: '/admin', label: 'Översikt', icon: Home, end: true },
  { to: '/admin/services', label: 'Tjänster', icon: Scissors },
  { to: '/admin/opening-hours', label: 'Öppettider', icon: Clock3 },
  { to: '/admin/bookings', label: 'Bokningar', icon: CalendarDays },
  { to: '/admin/gallery', label: 'Galleri', icon: Image },
]

const publicLinks = [
  { to: '/', label: 'Hem', end: true },
  { to: '/services', label: 'Tjänster' },
  { to: '/gallery', label: 'Galleri' },
  { to: '/contact', label: 'Kontakt' },
]

export function AdminLayout() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[28px] border border-ink-950/10 bg-ink-950 px-5 py-5 text-white shadow-[0_24px_70px_rgba(17,17,17,0.18)] sm:px-7 sm:py-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-300">
              Adminpanel
            </p>
            <h1 className="mt-2 font-serif text-3xl leading-tight text-white sm:text-4xl">
              Hantera {env.salonName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72">
              Se bokningar, tjänster, öppettider och galleribilder från samma meny.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-3 py-2">
            <div className="rounded-full border border-white/15 bg-white px-1.5 py-1.5">
              <UserButton afterSignOutUrl="/" />
            </div>
            <SignOutButton>
              <Button className="rounded-xl bg-white/10 text-white hover:bg-white/20" variant="ghost">
                <LogOut className="h-4 w-4" />
                Logga ut
              </Button>
            </SignOutButton>
          </div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          <nav className="flex flex-wrap items-center gap-2">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                end={link.end}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'bg-white text-ink-950'
                      : 'bg-white/8 text-white/76 hover:bg-white/14 hover:text-white',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/admin"
              className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold-300"
            >
              Admin
            </NavLink>
            <NavLink
              to="/booking"
              className="inline-flex items-center justify-center rounded-full border border-gold-500 bg-gold-400 px-5 py-2 text-sm font-semibold text-ink-950 transition hover:bg-gold-500"
            >
              Boka tid
            </NavLink>
          </nav>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-[24px] border border-salon-line bg-white/78 p-2 shadow-[0_18px_46px_rgba(17,17,17,0.07)] backdrop-blur">
            <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-900/45">
              Meny
            </p>
            <nav className="grid gap-2">
          {links.map(({ icon: Icon, ...link }) => (
            <NavLink
              key={link.to}
              end={link.end}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition',
                  isActive
                    ? 'border-copper-600 bg-copper-600 text-white shadow-[0_14px_28px_rgba(185,145,29,0.22)]'
                    : 'border-transparent bg-white text-ink-900/72 hover:border-salon-line hover:text-ink-950',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
            </nav>
          </div>
        </aside>

        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  )
}
