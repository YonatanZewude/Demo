import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type PageShellProps = {
  children: ReactNode
  className?: string
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(181,90,50,0.16),_transparent_60%)]" />
      <div className={cn('mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8', className)}>
        {children}
      </div>
    </div>
  )
}