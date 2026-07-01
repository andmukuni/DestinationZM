import { Form } from '@adonisjs/inertia/react'
import { SettingsShell, SettingsSourceBadge } from '~/components/settings/settings_shell'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { brandCheckboxClass } from '~/lib/brand_theme'

type SmtpSettingsProps = {
  activeSection: 'smtp'
  migrationRequired?: boolean
  smtp: {
    host: string
    port: number
    secure: boolean
    username: string
    hasPassword: boolean
    fromAddress: string
    fromName: string
    enabled: boolean
    configured: boolean
    source: 'database' | 'environment' | 'none'
  }
}

export default function SmtpSettings({ migrationRequired, smtp }: SmtpSettingsProps) {
  return (
    <SettingsShell activeSection="smtp" migrationRequired={migrationRequired}>
      <Card>
        <CardHeader
          title="Email (SMTP)"
          description="Configure outbound email for quotations, invoices, recovery reports, and notifications."
        />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={smtp.configured ? 'success' : 'warning'}>
              {smtp.configured ? 'Configured' : 'Not configured'}
            </Badge>
            <SettingsSourceBadge source={smtp.source} />
          </div>

          <Form route="settings.smtp.update" className="space-y-4">
            {({ errors }) => (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="SMTP host" name="host" defaultValue={smtp.host} error={errors.host} required />
                  <Input
                    label="SMTP port"
                    name="port"
                    type="number"
                    defaultValue={String(smtp.port)}
                    error={errors.port}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Username"
                    name="username"
                    defaultValue={smtp.username}
                    autoComplete="off"
                    error={errors.username}
                  />
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder={smtp.hasPassword ? 'Leave blank to keep current password' : 'Required on first save'}
                    error={errors.password}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="From address"
                    name="fromAddress"
                    type="email"
                    defaultValue={smtp.fromAddress}
                    error={errors.fromAddress}
                    required
                  />
                  <Input
                    label="From name"
                    name="fromName"
                    defaultValue={smtp.fromName}
                    error={errors.fromName}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="secure"
                    value="1"
                    defaultChecked={smtp.secure}
                    className={brandCheckboxClass}
                  />
                  Use TLS/SSL (secure connection)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="enabled"
                    value="1"
                    defaultChecked={smtp.enabled}
                    className={brandCheckboxClass}
                  />
                  Enable outbound email
                </label>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={migrationRequired}>
                  Save SMTP settings
                </Button>
              </>
            )}
          </Form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Send test email" description="Verify SMTP credentials after saving." />
        <CardBody>
          <Form route="settings.smtp.test" className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {({ errors }) => (
              <>
                <div className="flex-1">
                  <Input
                    label="Recipient email"
                    name="testEmail"
                    type="email"
                    placeholder="you@example.com"
                    error={errors.testEmail}
                    required
                  />
                </div>
                <Button type="submit" variant="secondary" disabled={migrationRequired}>
                  Send test
                </Button>
              </>
            )}
          </Form>
        </CardBody>
      </Card>
    </SettingsShell>
  )
}
