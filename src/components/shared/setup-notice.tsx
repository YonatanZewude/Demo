import { AlertCircle } from 'lucide-react'

type SetupNoticeProps = {
  title: string
  description: string
}

export function SetupNotice({ title, description }: SetupNoticeProps) {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl items-center justify-center px-4 py-8">
      <div className="surface-panel w-full px-6 py-8 sm:px-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-copper-600 text-white">
          <AlertCircle className="h-5 w-5" />
        </div>
        <h2 className="mt-5 font-serif text-4xl text-ink-950">{title}</h2>
        <p className="mt-3 text-base leading-7 text-ink-900/70">{description}</p>
      </div>
    </div>
  )
}