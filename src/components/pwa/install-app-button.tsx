import { Download, Share2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../ui/button'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isStandalone() {
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const canShowButton = useMemo(() => !isInstalled && (installPrompt || isIos()), [installPrompt, isInstalled])

  useEffect(() => {
    setIsInstalled(isStandalone())

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    const onAppInstalled = () => {
      setInstallPrompt(null)
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  if (!canShowButton) {
    return null
  }

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setInstallPrompt(null)
      }
      return
    }

    setShowIosHelp(true)
  }

  return (
    <>
      <Button
        className={compact ? 'min-h-10 rounded-2xl px-4 py-2 text-sm' : 'min-h-10 px-4 py-2 text-sm'}
        onClick={handleInstall}
        type="button"
        variant="secondary"
      >
        <Download className="h-4 w-4" />
        Ladda ner appen
      </Button>

      {showIosHelp ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-[28px] bg-white shadow-soft">
            <div className="surface-gold p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ink-950 text-gold-300">
                  <Share2 className="h-5 w-5" />
                </div>
                <button
                  aria-label="Stang"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/80 text-ink-950"
                  onClick={() => setShowIosHelp(false)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <h2 className="mt-5 text-xl font-bold text-ink-950">Ladda ner appen</h2>
              <p className="mt-3 text-sm leading-6 text-ink-900/68">
                På iPhone: tryck på Dela-knappen i Safari och välj Lägg till på hemskärmen.
              </p>
              <Button className="mt-5 min-h-11 w-full" onClick={() => setShowIosHelp(false)} type="button">
                OK
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
