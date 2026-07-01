import { Form } from '@adonisjs/inertia/react'
import { SettingsShell, SettingsSourceBadge } from '~/components/settings/settings_shell'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { brandCheckboxClass } from '~/lib/brand_theme'

type SmsSettingsProps = {
  activeSection: 'sms'
  migrationRequired?: boolean
  sms: {
    provider: 'twilio' | 'africas_talking' | 'custom'
    accountSid: string
    fromNumber: string
    hasAuthToken: boolean
    enabled: boolean
    configured: boolean
    source: 'database' | 'environment' | 'none'
  }
}

export default function SmsSettings({ migrationRequired, sms }: SmsSettingsProps) {
  return (
    <SettingsShell activeSection="sms" migrationRequired={migrationRequired}>
      <Card>
        <CardHeader
          title="SMS"
          description="Configure SMS provider credentials for text message notifications. Sending is not yet wired to all workflows."
        />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={sms.configured ? 'success' : 'warning'}>
              {sms.configured ? 'Configured' : 'Not configured'}
            </Badge>
            <SettingsSourceBadge source={sms.source} />
          </div>

          <Form route="settings.sms.update" className="space-y-4">
            {({ errors }) => (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="provider" className="text-sm font-medium text-slate-700">
                    Provider
                  </label>
                  <select
                    id="provider"
                    name="provider"
                    defaultValue={sms.provider}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="twilio">Twilio</option>
                    <option value="africas_talking">Africa&apos;s Talking</option>
                    <option value="custom">Custom</option>
                  </select>
                  {errors.provider ? <p className="text-sm text-red-600">{errors.provider}</p> : null}
                </div>
                <Input
                  label="Account SID / API key"
                  name="accountSid"
                  defaultValue={sms.accountSid}
                  error={errors.accountSid}
                  required
                />
                <Input
                  label="Auth token"
                  name="authToken"
                  type="password"
                  autoComplete="new-password"
                  placeholder={sms.hasAuthToken ? 'Leave blank to keep current token' : 'Required on first save'}
                  error={errors.authToken}
                />
                <Input
                  label="From number"
                  name="fromNumber"
                  defaultValue={sms.fromNumber}
                  placeholder="+260..."
                  error={errors.fromNumber}
                  required
                />
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="enabled"
                    value="1"
                    defaultChecked={sms.enabled}
                    className={brandCheckboxClass}
                  />
                  Enable SMS notifications
                </label>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={migrationRequired}>
                  Save SMS settings
                </Button>
              </>
            )}
          </Form>
        </CardBody>
      </Card>
    </SettingsShell>
  )
}
