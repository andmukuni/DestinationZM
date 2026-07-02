import { Form } from '@adonisjs/inertia/react'
import { SettingsShell } from '~/components/settings/settings_shell'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'

type OtherSettingsProps = {
  activeSection: 'other'
  migrationRequired?: boolean
  other: {
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
          description="Operational defaults and retention policies."
        />
        <CardBody>
          <Form route="settings.other.update" className="space-y-4">
            {({ errors }) => (
              <>
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
