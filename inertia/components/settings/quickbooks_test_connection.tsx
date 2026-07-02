import { useState } from 'react'
import { urlFor } from '~/client'
import { Button } from '~/components/ui/button'

type TestResult = {
  ok: boolean
  stage: 'credentials' | 'oauth' | 'api'
  message: string
  reconnectRequired?: boolean
  details?: {
    environment?: string
    companyName?: string | null
    realmId?: string
    serviceItemCount?: number
    apiBaseUrl?: string
    redirectUri?: string
  }
}

function readCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]!) : ''
}

type QuickbooksTestConnectionProps = {
  configured: boolean
  disabled?: boolean
  compact?: boolean
}

export function QuickbooksTestConnection({
  configured,
  disabled,
  compact = false,
}: QuickbooksTestConnectionProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  async function runTest() {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(urlFor('settings.quickbooks.test'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': readCsrfToken(),
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
      })

      const payload = (await response.json()) as TestResult
      setResult(payload)
    } catch {
      setResult({
        ok: false,
        stage: 'api',
        message: 'Could not reach the test connection endpoint.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <Button
        type="button"
        variant={compact ? 'secondary' : 'secondary'}
        className={compact ? 'w-full' : undefined}
        disabled={!configured || disabled || loading}
        onClick={() => void runTest()}
      >
        {loading ? 'Testing…' : 'Test API connection'}
      </Button>

      {!configured ? (
        <p className="text-xs text-slate-500">Save credentials first, then test the API.</p>
      ) : null}

      {result ? (
        <div
          className={`rounded-lg border px-3 py-2.5 text-sm ${
            result.ok
              ? 'border-orange-200 bg-orange-50 text-orange-950'
              : 'border-red-200 bg-red-50 text-red-950'
          }`}
        >
          <p className="font-medium">{result.message}</p>
          {result.reconnectRequired ? (
            <p className="mt-2 text-xs">
              Use <strong>Connect QuickBooks</strong> in the Actions panel to reconnect your company.
            </p>
          ) : null}
          {result.details ? (
            <dl className="mt-2 space-y-1 text-xs">
              {result.details.companyName ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Company</dt>
                  <dd className="font-medium text-right">{result.details.companyName}</dd>
                </div>
              ) : null}
              {result.details.realmId ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Realm ID</dt>
                  <dd className="font-medium text-right">{result.details.realmId}</dd>
                </div>
              ) : null}
              {result.details.serviceItemCount !== undefined ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Service items</dt>
                  <dd className="font-medium">{result.details.serviceItemCount}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
