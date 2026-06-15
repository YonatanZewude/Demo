import { Link } from 'react-router-dom'
import { PageShell } from '../components/shell/page-shell'

export function NotFoundPage() {
  return (
    <PageShell className="items-center justify-center">
      <section className="surface-panel max-w-xl px-6 py-10 text-center sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-copper-600">404</p>
        <h1 className="mt-4 font-serif text-4xl text-ink-950">Sidan hittades inte</h1>
        <p className="mt-4 text-base leading-7 text-ink-900/70">Ga tillbaka till startsidan eller oppna bokningen for att fortsatta.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/" className="rounded-full bg-copper-600 px-6 py-3 text-sm font-semibold text-white">Till startsidan</Link>
          <Link to="/booking" className="rounded-full border border-gold-500 bg-gold-400 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-500">Till bokning</Link>
        </div>
      </section>
    </PageShell>
  )
}