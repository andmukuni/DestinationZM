import { Form } from '@adonisjs/inertia/react'
import { SettingsShell } from '~/components/settings/settings_shell'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'

type GeneralSettingsProps = {
  activeSection: 'general'
  migrationRequired?: boolean
  general: {
    appDisplayName: string
    supportEmail: string
    supportPhone: string
    defaultCurrency: string
    defaultTimezone: string
    portalWelcomeMessage: string
  }
}

export default function GeneralSettings({ migrationRequired, general }: GeneralSettingsProps) {
  return (
    <SettingsShell activeSection="general" migrationRequired={migrationRequired}>
      <Card>
        <CardHeader
          title="General"
          description="Organization profile and defaults shown across admin and client portal."
        />
        <CardBody>
          <Form route="settings.general.update" className="space-y-4">
            {({ errors }) => (
              <>
                <Input
                  label="Application display name"
                  name="appDisplayName"
                  defaultValue={general.appDisplayName}
                  error={errors.appDisplayName}
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Support email"
                    name="supportEmail"
                    type="email"
                    defaultValue={general.supportEmail}
                    error={errors.supportEmail}
                  />
                  <Input
                    label="Support phone"
                    name="supportPhone"
                    defaultValue={general.supportPhone}
                    error={errors.supportPhone}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Default currency"
                    name="defaultCurrency"
                    defaultValue={general.defaultCurrency}
                    maxLength={3}
                    error={errors.defaultCurrency}
                    required
                  />
                  <Input
                    label="Default timezone"
                    name="defaultTimezone"
                    defaultValue={general.defaultTimezone}
                    error={errors.defaultTimezone}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="portalWelcomeMessage" className="text-sm font-medium text-slate-700">
                    Portal welcome message
                  </label>
                  <textarea
                    id="portalWelcomeMessage"
                    name="portalWelcomeMessage"
                    rows={4}
                    defaultValue={general.portalWelcomeMessage}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                  {errors.portalWelcomeMessage ? (
                    <p className="text-sm text-red-600">{errors.portalWelcomeMessage}</p>
                  ) : null}
                </div>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={migrationRequired}>
                  Save general settings
                </Button>
              </>
            )}
          </Form>
        </CardBody>
      </Card>
    </SettingsShell>
  )
}
