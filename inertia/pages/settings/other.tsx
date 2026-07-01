import { Form } from '@adonisjs/inertia/react'
import { SettingsShell } from '~/components/settings/settings_shell'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { brandCheckboxClass } from '~/lib/brand_theme'

type OtherSettingsProps = {
  activeSection: 'other'
  migrationRequired?: boolean
  other: {
    maintenanceMode: boolean
    allowPortalRegistration: boolean
    enableClientNotifications: boolean
    defaultInvoiceDueDays: number
    auditRetentionDays: number
  }
}

export default function OtherSettings({ migrationRequired, other }: OtherSettingsProps) {
  return (
    <SettingsShell activeSection="other" migrationRequired={migrationRequired}>
      <Card>
        <CardHeader
          title="Other"
          description="Operational toggles, retention policies, and recommended defaults."
        />
        <CardBody>
          <Form route="settings.other.update" className="space-y-4">
            {({ errors }) => (
              <>
                <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <label className="flex items-start gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name="maintenanceMode"
                      value="1"
                      defaultChecked={other.maintenanceMode}
                      className={`mt-0.5 ${brandCheckboxClass}`}
                    />
                    <span>
                      <span className="font-medium">Maintenance mode</span>
                      <span className="mt-0.5 block text-slate-500">
                        Restrict client portal access during maintenance. Admin staff can still sign
                        in.
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name="allowPortalRegistration"
                      value="1"
                      defaultChecked={other.allowPortalRegistration}
                      className={`mt-0.5 ${brandCheckboxClass}`}
                    />
                    <span>
                      <span className="font-medium">Allow portal self-registration</span>
                      <span className="mt-0.5 block text-slate-500">
                        Let new clients request portal accounts from the login page.
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name="enableClientNotifications"
                      value="1"
                      defaultChecked={other.enableClientNotifications}
                      className={`mt-0.5 ${brandCheckboxClass}`}
                    />
                    <span>
                      <span className="font-medium">Enable client notifications</span>
                      <span className="mt-0.5 block text-slate-500">
                        Send email/SMS/WhatsApp alerts when integrations are enabled.
                      </span>
                    </span>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Default invoice due days"
                    name="defaultInvoiceDueDays"
                    type="number"
                    min={1}
                    max={365}
                    defaultValue={String(other.defaultInvoiceDueDays)}
                    error={errors.defaultInvoiceDueDays}
                    required
                  />
                  <Input
                    label="Audit log retention (days)"
                    name="auditRetentionDays"
                    type="number"
                    min={30}
                    max={3650}
                    defaultValue={String(other.auditRetentionDays)}
                    error={errors.auditRetentionDays}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={migrationRequired}
                >
                  Save other settings
                </Button>
              </>
            )}
          </Form>
        </CardBody>
      </Card>
    </SettingsShell>
  )
}
