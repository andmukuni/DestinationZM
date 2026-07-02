import { useEffect, useRef } from 'react'

type AuthTurnstileProps = {
  siteKey: string
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          'sitekey': string
          'theme'?: 'light' | 'dark' | 'auto'
          'callback'?: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
        }
      ) => string
      remove: (widgetId: string) => void
    }
  }
}

export function AuthTurnstile({ siteKey }: AuthTurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      return
    }

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) {
        return
      }

      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current)
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'light',
      })
    }

    if (window.turnstile) {
      renderWidget()
      return () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current)
        }
      }
    }

    const existing = document.querySelector('script[data-turnstile="true"]')
    if (existing) {
      existing.addEventListener('load', renderWidget)
      return () => existing.removeEventListener('load', renderWidget)
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.dataset.turnstile = 'true'
    script.onload = renderWidget
    document.head.appendChild(script)

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [siteKey])

  return <div ref={containerRef} className="min-h-[65px]" />
}
