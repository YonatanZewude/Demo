import { cn } from '../../lib/cn'

type BadgeProps = {
  children: string
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

const statusClasses: Record<NonNullable<BadgeProps['status']>, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function Badge({ children, status = 'pending' }: BadgeProps) {
  return (
    <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize', statusClasses[status])}>
      {children}
    </span>
  )
}