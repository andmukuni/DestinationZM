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
  }
}

export default function GeneralSettings({ migrationRequired, general }: GeneralSettingsProps) {
  return (
    <SettingsShell activeSection="general" migrationRequired={migrationRequired}>
      <Card>
        <CardHeader
          title="General"
          description="Organization profile and defaults shown across the admin app."
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
