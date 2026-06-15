import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type FieldProps = {
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

export function Field({ label, error, hint, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-ink-950">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs text-ink-900/55">{hint}</span> : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'min-h-12 rounded-2xl border border-salon-line bg-white px-4 py-3 text-sm text-ink-950 outline-none transition placeholder:text-ink-900/35 focus:border-copper-600 focus:ring-4 focus:ring-copper-600/10',
        props.className,
      )}
      {...props}
    />
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'min-h-12 rounded-2xl border border-salon-line bg-white px-4 py-3 text-sm text-ink-950 outline-none transition focus:border-copper-600 focus:ring-4 focus:ring-copper-600/10',
        props.className,
      )}
      {...props}
    />
  )
}

const timeOptions = Array.from({ length: 24 * 4 }, (_, index) => {
  const hours = Math.floor(index / 4)
  const minutes = (index % 4) * 15
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
})

export function TimeSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Select className={cn('tabular-nums', className)} {...props}>
      <option value="">--:--</option>
      {timeOptions.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </Select>
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-28 rounded-2xl border border-salon-line bg-white px-4 py-3 text-sm text-ink-950 outline-none transition placeholder:text-ink-900/35 focus:border-copper-600 focus:ring-4 focus:ring-copper-600/10',
        props.className,
      )}
      {...props}
    />
  )
}
