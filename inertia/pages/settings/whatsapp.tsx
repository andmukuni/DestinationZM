import { Form } from '@adonisjs/inertia/react'
import { SettingsShell, SettingsSourceBadge } from '~/components/settings/settings_shell'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { brandCheckboxClass } from '~/lib/brand_theme'

type WhatsappSettingsProps = {
  activeSection: 'whatsapp'
  migrationRequired?: boolean
  whatsapp: {
    provider: 'meta' | 'twilio' | 'custom'
    phoneNumberId: string
    businessAccountId: string
    fromNumber: string
    hasApiKey: boolean
    enabled: boolean
    configured: boolean
    source: 'database' | 'environment' | 'none'
  }
}

export default function WhatsappSettings({ migrationRequired, whatsapp }: WhatsappSettingsProps) {
  return (
    <SettingsShell activeSection="whatsapp" migrationRequired={migrationRequired}>
      <Card>
        <CardHeader
          title="WhatsApp"
          description="Configure WhatsApp Business API credentials. Message delivery will be enabled in a future release."
        />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={whatsapp.configured ? 'success' : 'warning'}>
              {whatsapp.configured ? 'Configured' : 'Not configured'}
            </Badge>
            <SettingsSourceBadge source={whatsapp.source} />
          </div>

          <Form route="settings.whatsapp.update" className="space-y-4">
            {({ errors }) => (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="provider" className="text-sm font-medium text-slate-700">
                    Provider
                  </label>
                  <select
                    id="provider"
                    name="provider"
                    defaultValue={whatsapp.provider}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="meta">Meta (Cloud API)</option>
                    <option value="twilio">Twilio</option>
                    <option value="custom">Custom</option>
                  </select>
                  {errors.provider ? <p className="text-sm text-red-600">{errors.provider}</p> : null}
                </div>
                <Input
                  label="API key / access token"
                  name="apiKey"
                  type="password"
                  autoComplete="new-password"
                  placeholder={
                    whatsapp.hasApiKey ? 'Leave blank to keep current key' : 'Required on first save'
                  }
                  error={errors.apiKey}
                />
                <Input
                  label="Phone number ID"
                  name="phoneNumberId"
                  defaultValue={whatsapp.phoneNumberId}
                  error={errors.phoneNumberId}
                  required
                />
                <Input
                  label="Business account ID"
                  name="businessAccountId"
                  defaultValue={whatsapp.businessAccountId}
                  error={errors.businessAccountId}
                />
                <Input
                  label="Display / sender number"
                  name="fromNumber"
                  defaultValue={whatsapp.fromNumber}
                  placeholder="+260..."
                  error={errors.fromNumber}
                />
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="enabled"
                    value="1"
                    defaultChecked={whatsapp.enabled}
                    className={brandCheckboxClass}
                  />
                  Enable WhatsApp notifications
                </label>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={migrationRequired}>
                  Save WhatsApp settings
                </Button>
              </>
            )}
          </Form>
        </CardBody>
      </Card>
    </SettingsShell>
  )
}
