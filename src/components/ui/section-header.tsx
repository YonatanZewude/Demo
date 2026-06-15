import { cn } from '../../lib/cn'

type SectionHeaderProps = {
  eyebrow: string
  title: string
  description?: string
  className?: string
}

export function SectionHeader({ eyebrow, title, description, className }: SectionHeaderProps) {
  return (
    <div className={cn('space-y-2.5 sm:space-y-3', className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-copper-600 sm:text-sm sm:tracking-[0.3em]">{eyebrow}</p>
      <h1 className="font-serif text-3xl leading-tight text-ink-950 sm:text-5xl">{title}</h1>
      {description ? <p className="max-w-2xl text-sm leading-6 text-ink-900/70 sm:text-base sm:leading-7">{description}</p> : null}
    </div>
  )
}
