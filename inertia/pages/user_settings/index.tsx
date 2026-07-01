import { Form, Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon, SettingsIcon, XMarkIcon } from '~/components/icons'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'

type UserSettingsIndexProps = {
  pageTitle?: string
  pageDescription?: string
}

export default function UserSettingsIndex(_props: UserSettingsIndexProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          route="profile"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon />
          Back to profile
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">User Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Update your password. Name, email, role, and branch are managed by an administrator.
        </p>
      </div>

      <Card>
        <CardHeader title="Change password" description="Use at least 6 characters for your new password." />
        <CardBody>
          <Form route="user_settings.password" className="space-y-4">
            {({ errors }) => (
              <>
                <Input
                  label="Current password"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  error={errors.currentPassword}
                />
                <Input
                  label="New password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  error={errors.password}
                />
                <Input
                  label="Confirm new password"
                  name="passwordConfirmation"
                  type="password"
                  autoComplete="new-password"
                  error={errors.passwordConfirmation}
                />
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="gap-2">
                    <SettingsIcon />
                    Update password
                  </Button>
                  <Link
                    route="profile"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <XMarkIcon />
                    Cancel
                  </Link>
                </div>
              </>
            )}
          </Form>
        </CardBody>
      </Card>
    </div>
  )
}
