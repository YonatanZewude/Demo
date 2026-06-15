import { cn } from '../../lib/cn'

type SectionHeaderProps = {
  eyebrow: string
  title: string
  description?: string
  className?: string
}

export function SectionHeader({ eyebrow, title, description, className }: SectionHeaderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-copper-600">{eyebrow}</p>
      <h1 className="font-serif text-4xl text-ink-950 sm:text-5xl">{title}</h1>
      {description ? <p className="max-w-2xl text-base leading-7 text-ink-900/70">{description}</p> : null}
    </div>
  )
}
