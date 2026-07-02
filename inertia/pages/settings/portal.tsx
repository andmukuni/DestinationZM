import { Form, Link } from '@adonisjs/inertia/react'
import { SettingsShell } from '~/components/settings/settings_shell'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { brandCheckboxClass } from '~/lib/brand_theme'

type PortalSettingsProps = {
  activeSection: 'portal'
  migrationRequired?: boolean
  portal: {
    portalWelcomeMessage: string
    maintenanceMode: boolean
    allowPortalRegistration: boolean
    enableClientNotifications: boolean
  }
}

export default function PortalSettings({ migrationRequired, portal }: PortalSettingsProps) {
  return (
    <SettingsShell activeSection="portal" migrationRequired={migrationRequired}>
      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Client portal"
            description="Control how clients sign in, what they see, and portal availability."
          />
          <CardBody>
            <Form route="settings.portal.update" className="space-y-4">
              {({ errors }) => (
                <>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="portalWelcomeMessage"
                      className="text-sm font-medium text-slate-700"
                    >
                      Welcome message
                    </label>
                    <textarea
                      id="portalWelcomeMessage"
                      name="portalWelcomeMessage"
                      rows={4}
                      defaultValue={portal.portalWelcomeMessage}
                      placeholder="Sign in to review quotations, confirm reports, and pay invoices."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                    <p className="text-xs text-slate-500">
                      Shown on the client portal login page. Leave blank to use the default
                      message.
                    </p>
                    {errors.portalWelcomeMessage ? (
                      <p className="text-sm text-red-600">{errors.portalWelcomeMessage}</p>
                    ) : null}
                  </div>

                  <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <label className="flex items-start gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="maintenanceMode"
                        value="1"
                        defaultChecked={portal.maintenanceMode}
                        className={`mt-0.5 ${brandCheckboxClass}`}
                      />
                      <span>
                        <span className="font-medium">Maintenance mode</span>
                        <span className="mt-0.5 block text-slate-500">
                          Block client portal access and sign out active portal sessions. Admin
                          staff can still sign in.
                        </span>
                      </span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="allowPortalRegistration"
                        value="1"
                        defaultChecked={portal.allowPortalRegistration}
                        className={`mt-0.5 ${brandCheckboxClass}`}
                      />
                      <span>
                        <span className="font-medium">Allow portal self-registration</span>
                        <span className="mt-0.5 block text-slate-500">
                          Show a registration link on the login page so new clients can request
                          portal access.
                        </span>
                      </span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="enableClientNotifications"
                        value="1"
                        defaultChecked={portal.enableClientNotifications}
                        className={`mt-0.5 ${brandCheckboxClass}`}
                      />
                      <span>
                        <span className="font-medium">Enable client notifications</span>
                        <span className="mt-0.5 block text-slate-500">
                          Send email, SMS, and WhatsApp alerts to clients when those integrations
                          are enabled.
                        </span>
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={migrationRequired}
                  >
                    Save client portal settings
                  </Button>
                </>
              )}
            </Form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Portal enquiry forms"
            description="Configure the enquiry types and fields clients see when submitting new requests."
          />
          <CardBody>
            <p className="text-sm text-slate-600">
              Manage enquiry tabs, required fields, and labels shown in the client portal booking
              flow.
            </p>
            <Link
              route="portal_booking_types.index"
              className="mt-4 inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Manage portal enquiry forms
            </Link>
          </CardBody>
        </Card>
      </div>
    </SettingsShell>
  )
}
