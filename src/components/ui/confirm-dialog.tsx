import { AlertTriangle, X } from 'lucide-react'
import { Button } from './button'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Ja',
  cancelLabel = 'Nej',
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/55 px-4 py-6 backdrop-blur-sm">
      <div
        aria-modal="true"
        className="w-full max-w-md overflow-hidden rounded-[28px] border border-salon-line bg-white shadow-[0_28px_80px_rgba(17,17,17,0.28)]"
        role="dialog"
      >
        <div className="surface-gold p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600 text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <button
              aria-label="Stang"
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink-900/62 transition hover:bg-sand-100 hover:text-ink-950"
              onClick={onCancel}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mt-5 text-2xl font-bold text-ink-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-ink-900/66">{description}</p>
        </div>

        <div className="flex flex-col-reverse gap-3 p-5 sm:flex-row sm:justify-end">
          <Button disabled={isLoading} onClick={onCancel} variant="secondary">
            {cancelLabel}
          </Button>
          <Button disabled={isLoading} onClick={onConfirm} variant="danger">
            {isLoading ? 'Raderar...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
