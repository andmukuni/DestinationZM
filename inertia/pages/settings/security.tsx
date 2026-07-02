import { Form } from '@adonisjs/inertia/react'
import { SettingsShell } from '~/components/settings/settings_shell'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { brandCheckboxClass } from '~/lib/brand_theme'

type SecuritySettingsProps = {
  activeSection: 'security'
  migrationRequired?: boolean
  security: {
    turnstileEnabled: boolean
    turnstileSiteKey: string
    hasTurnstileSecret: boolean
    requireMfaForStaff: boolean
    loginMaxAttempts: number
    loginWindowMinutes: number
  }
  mfa: {
    enabled: boolean
    confirmedAt: string | null
    setup: { qrDataUrl: string; manualKey: string } | null
  }
}

export default function SecuritySettings({
  migrationRequired,
  security,
  mfa,
}: SecuritySettingsProps) {
  return (
    <SettingsShell activeSection="security" migrationRequired={migrationRequired}>
      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Security settings"
            description="Captcha, login rate limits, and QuickBooks MFA policy."
          />
          <CardBody>
            <Form route="settings.security.update" className="space-y-6">
              {({ errors }) => (
                <>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">Login protection</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Max failed attempts"
                        name="loginMaxAttempts"
                        type="number"
                        min={3}
                        max={20}
                        defaultValue={String(security.loginMaxAttempts)}
                        error={errors.loginMaxAttempts}
                      />
                      <Input
                        label="Lockout window (minutes)"
                        name="loginWindowMinutes"
                        type="number"
                        min={5}
                        max={120}
                        defaultValue={String(security.loginWindowMinutes)}
                        error={errors.loginWindowMinutes}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-slate-200 pt-6">
                    <h3 className="text-sm font-semibold text-slate-900">Cloudflare Turnstile</h3>
                    <label className="flex items-start gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="turnstileEnabled"
                        value="1"
                        defaultChecked={security.turnstileEnabled}
                        className={`mt-0.5 ${brandCheckboxClass}`}
                      />
                      <span>
                        <span className="font-medium">Enable Turnstile captcha</span>
                        <span className="mt-0.5 block text-slate-500">
                          Applies to staff login, portal login, and portal registration. For local
                          dev, set <code>TURNSTILE_SKIP=true</code> in `.env`.
                        </span>
                      </span>
                    </label>
                    <Input
                      label="Site key"
                      name="turnstileSiteKey"
                      defaultValue={security.turnstileSiteKey}
                      error={errors.turnstileSiteKey}
                    />
                    <Input
                      label="Secret key"
                      name="turnstileSecret"
                      type="password"
                      placeholder={
                        security.hasTurnstileSecret
                          ? 'Saved — leave blank to keep'
                          : 'Paste secret key'
                      }
                      error={errors.turnstileSecret}
                    />
                  </div>

                  <div className="space-y-3 border-t border-slate-200 pt-6">
                    <label className="flex items-start gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="requireMfaForStaff"
                        value="1"
                        defaultChecked={security.requireMfaForStaff}
                        className={`mt-0.5 ${brandCheckboxClass}`}
                      />
                      <span>
                        <span className="font-medium">Require MFA before QuickBooks access</span>
                        <span className="mt-0.5 block text-slate-500">
                          Staff must enable two-factor authentication before opening QuickBooks
                          settings.
                        </span>
                      </span>
                    </label>
                  </div>

                  <Button type="submit">Save security settings</Button>
                </>
              )}
            </Form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Staff two-factor authentication"
            description="Protect your admin sign-in with an authenticator app."
          />
          <CardBody className="space-y-4">
            {mfa.enabled ? (
              <>
                <p className="text-sm text-emerald-700">
                  MFA is enabled
                  {mfa.confirmedAt ? ` since ${new Date(mfa.confirmedAt).toLocaleString()}` : ''}.
                </p>
                <Form
                  route="settings.security.mfa.disable"
                  className="space-y-3 rounded-lg border border-slate-200 p-4"
                >
                  {({ errors }) => (
                    <>
                      <Input
                        label="Current password"
                        name="password"
                        type="password"
                        required
                        error={errors.password}
                      />
                      <Input
                        label="Authentication code"
                        name="code"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        error={errors.code}
                      />
                      <Button type="submit" variant="secondary">
                        Disable MFA
                      </Button>
                    </>
                  )}
                </Form>
              </>
            ) : mfa.setup ? (
              <>
                <img
                  src={mfa.setup.qrDataUrl}
                  alt="MFA QR code"
                  className="mx-auto h-48 w-48 rounded-lg border border-slate-200 bg-white p-2"
                />
                <p className="text-center text-xs text-slate-500">
                  Manual key:{' '}
                  <code className="rounded bg-slate-100 px-1">{mfa.setup.manualKey}</code>
                </p>
                <Form route="settings.security.mfa.confirm" className="space-y-3">
                  {({ errors }) => (
                    <>
                      <Input
                        label="Confirm with 6-digit code"
                        name="code"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        error={errors.code}
                      />
                      <Button type="submit">Confirm and enable MFA</Button>
                    </>
                  )}
                </Form>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  Enable MFA on your staff account before connecting QuickBooks in production.
                </p>
                <Form route="settings.security.mfa.start">
                  <Button type="submit">Set up authenticator app</Button>
                </Form>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </SettingsShell>
  )
}
