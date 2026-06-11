import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-copper-600 text-white hover:bg-copper-700',
  secondary: 'bg-sand-100 text-ink-950 hover:bg-sand-200',
  ghost: 'bg-transparent text-ink-950 hover:bg-black/5',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

export function Button({ className, type = 'button', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    />
  )
}