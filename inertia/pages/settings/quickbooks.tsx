import { Form, Link } from '@adonisjs/inertia/react'
import { QuickbooksTestConnection } from '~/components/settings/quickbooks_test_connection'
import { SettingsShell } from '~/components/settings/settings_shell'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { ConfirmSubmitButton } from '~/components/ui/confirm_submit_button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { brandCheckboxClass, brandInputFocusClass, brandSurfaceAccentClass } from '~/lib/brand_theme'

type QuickbooksAppSettingsView = {
  clientId: string
  redirectUri: string
  environment: 'sandbox' | 'production'
  hasClientSecret: boolean
  source: 'database' | 'environment' | 'none'
  configured: boolean
}

type QuickbooksSettingsProps = {
  activeSection: 'quickbooks'
  migrationRequired?: boolean
  canEditCredentials: boolean
  appSettings: QuickbooksAppSettingsView
  configured: boolean
  environment: string
  redirectUri: string
  connection: {
    companyName: string | null
    realmId: string
    environment: string
    syncEnabled: boolean
    defaultServiceItemId: string | null
    defaultServiceItemName: string | null
    defaultIncomeAccountId: string | null
    connectedAt: string
  } | null
  serviceItems: Array<{ id: string; name: string }>
  failedSyncs: Array<{
    id: number
    entityType: string
    localId: number
    lastError: string | null
    attemptCount: number
    updatedAt: string | null
  }>
}

const selectClass = `h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ${brandInputFocusClass}`

function syncTone(enabled: boolean) {
  return enabled ? 'success' : 'warning'
}

function sourceLabel(source: QuickbooksAppSettingsView['source']) {
  if (source === 'database') return 'Saved in settings'
  if (source === 'environment') return 'From environment'
  return 'Not saved'
}

export default function QuickbooksSettings({
  migrationRequired,
  canEditCredentials,
  appSettings,
  configured,
  environment,
  redirectUri,
  connection,
  serviceItems,
  failedSyncs,
}: QuickbooksSettingsProps) {
  const effectiveRedirectUri = appSettings.redirectUri || redirectUri

  return (
    <SettingsShell activeSection="quickbooks" migrationRequired={migrationRequired}>
      {/* Status overview */}
      <div className={`rounded-xl border px-5 py-4 ${brandSurfaceAccentClass}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">QuickBooks Online</p>
            <p className="mt-0.5 text-sm text-slate-600">
              Sync invoices and payments with your Intuit company.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={configured ? 'success' : 'warning'}>
              Credentials {configured ? 'ready' : 'missing'}
            </Badge>
            <Badge tone={connection ? 'success' : 'info'}>
              {connection ? 'Company connected' : 'Not connected'}
            </Badge>
            {connection ? (
              <Badge tone={syncTone(connection.syncEnabled)}>
                {connection.syncEnabled ? 'Sync on' : 'Sync paused'}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Credentials */}
        <Card className="h-fit">
          <CardHeader
            title="API credentials"
            description="Intuit developer app OAuth settings. The client secret is encrypted at rest."
          />
          <CardBody>
            {canEditCredentials ? (
              <Form route="settings.quickbooks.credentials" className="space-y-5">
                {({ errors }) => (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Input
                          label="Client ID"
                          name="clientId"
                          defaultValue={appSettings.clientId}
                          autoComplete="off"
                          error={errors.clientId}
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          label="Client secret"
                          name="clientSecret"
                          type="password"
                          autoComplete="new-password"
                          placeholder={
                            appSettings.hasClientSecret
                              ? 'Leave blank to keep the current secret'
                              : 'Required on first save'
                          }
                          error={errors.clientSecret}
                        />
                      </div>
                      <Input
                        label="Redirect URI"
                        name="redirectUri"
                        defaultValue={effectiveRedirectUri}
                        autoComplete="off"
                        error={errors.redirectUri}
                        required
                      />
                      <div className="space-y-1.5">
                        <label htmlFor="environment" className="text-sm font-medium text-slate-700">
                          Environment
                        </label>
                        <select
                          id="environment"
                          name="environment"
                          defaultValue={appSettings.environment}
                          className={selectClass}
                        >
                          <option value="sandbox">Sandbox (development)</option>
                          <option value="production">Production</option>
                        </select>
                        {errors.environment ? (
                          <p className="text-sm text-red-600">{errors.environment}</p>
                        ) : null}
                      </div>
                    </div>

                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      Register the redirect URI in your{' '}
                      <a
                        href="https://developer.intuit.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-orange-600 hover:underline"
                      >
                        Intuit developer app
                      </a>
                      . Reconnect QuickBooks after changing credentials or environment.
                    </p>

                    <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      <Button
                        type="submit"
                        className="bg-orange-600 hover:bg-orange-700"
                        disabled={migrationRequired}
                      >
                        Save credentials
                      </Button>
                    </div>
                  </>
                )}
              </Form>
            ) : (
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Client ID</dt>
                  <dd className="mt-0.5 break-all font-medium text-slate-900">
                    {appSettings.clientId || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Client secret</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">
                    {appSettings.hasClientSecret ? 'Saved (hidden)' : '—'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Redirect URI</dt>
                  <dd className="mt-0.5 break-all font-medium text-slate-900">{effectiveRedirectUri}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Environment</dt>
                  <dd className="mt-0.5 font-medium capitalize text-slate-900">{appSettings.environment}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Source</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">{sourceLabel(appSettings.source)}</dd>
                </div>
              </dl>
            )}
          </CardBody>
        </Card>

        {/* Sidebar actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Actions" />
            <CardBody className="space-y-4">
              <QuickbooksTestConnection
                configured={configured}
                disabled={migrationRequired}
                compact
              />

              {configured && !connection ? (
                <Link route="settings.quickbooks.connect" className="block">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Connect QuickBooks
                  </Button>
                </Link>
              ) : null}

              {connection ? (
                <Form route="settings.quickbooks.disconnect">
                  <ConfirmSubmitButton
                    variant="secondary"
                    className="w-full"
                    title="Disconnect QuickBooks?"
                    description="Disconnect the linked QuickBooks company? Invoice sync will stop until you reconnect."
                    confirmLabel="Disconnect"
                    confirmVariant="danger"
                  >
                    Disconnect company
                  </ConfirmSubmitButton>
                </Form>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Setup checklist" />
            <CardBody>
              <ol className="space-y-3 text-sm text-slate-700">
                <li className="flex gap-2">
                  <span className={configured ? 'text-orange-600' : 'text-slate-400'}>
                    {configured ? '✓' : '1.'}
                  </span>
                  <span>Save API credentials</span>
                </li>
                <li className="flex gap-2">
                  <span className={connection ? 'text-orange-600' : 'text-slate-400'}>
                    {connection ? '✓' : '2.'}
                  </span>
                  <span>Connect your QuickBooks company</span>
                </li>
                <li className="flex gap-2">
                  <span className={connection?.defaultServiceItemId ? 'text-orange-600' : 'text-slate-400'}>
                    {connection?.defaultServiceItemId ? '✓' : '3.'}
                  </span>
                  <span>Choose a default service item</span>
                </li>
              </ol>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Connection details */}
      {connection ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Connected company" />
            <CardBody>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Company</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">
                    {connection.companyName ?? 'QuickBooks company'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Realm ID</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">{connection.realmId}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Environment</dt>
                  <dd className="mt-0.5 font-medium capitalize text-slate-900">{environment}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Connected</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">
                    {new Date(connection.connectedAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Sync settings"
              description="Default service item for invoice line items."
            />
            <CardBody>
              <Form route="settings.quickbooks.update" className="space-y-4">
                {({ errors }) => (
                  <>
                    <div className="space-y-1.5">
                      <label htmlFor="defaultServiceItemId" className="text-sm font-medium text-slate-700">
                        Default service item
                      </label>
                      <select
                        id="defaultServiceItemId"
                        name="defaultServiceItemId"
                        defaultValue={connection.defaultServiceItemId ?? ''}
                        className={selectClass}
                      >
                        <option value="">Select a service item</option>
                        {serviceItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                      {errors.defaultServiceItemId ? (
                        <p className="text-sm text-red-600">{errors.defaultServiceItemId}</p>
                      ) : null}
                    </div>

                    <input
                      type="hidden"
                      name="defaultServiceItemName"
                      value={
                        serviceItems.find((item) => item.id === connection.defaultServiceItemId)?.name ??
                        connection.defaultServiceItemName ??
                        ''
                      }
                    />

                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="syncEnabled"
                        value="1"
                        defaultChecked={connection.syncEnabled}
                        className={brandCheckboxClass}
                      />
                      Enable automatic QuickBooks sync
                    </label>

                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                      Save sync settings
                    </Button>
                  </>
                )}
              </Form>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {failedSyncs.length > 0 ? (
        <Card>
          <CardHeader title="Recent sync failures" />
          <CardBody className="space-y-3">
            {failedSyncs.map((record) => (
              <div
                key={record.id}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
              >
                <p className="font-medium">
                  {record.entityType} #{record.localId} · {record.attemptCount} attempt(s)
                </p>
                <p className="mt-1 text-red-800">{record.lastError ?? 'Unknown error'}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      ) : null}
    </SettingsShell>
  )
}
