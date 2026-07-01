import { Form, Link } from '@adonisjs/inertia/react'
import { useState } from 'react'
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '~/components/icons'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { PortalPrivilegeEditor } from '~/components/portal_privilege_editor'

type PortalUsersCreateProps = {
  pageTitle?: string
  pageDescription?: string
  roles: Array<{ value: string; label: string; defaultPrivileges: string[] }>
  privilegeGroups: Array<{
    id: string
    label: string
    description: string
    privileges: Array<{ key: string; label: string; description: string; enabled: boolean }>
  }>
  presets: Array<{ id: string; label: string; description: string; privileges: string[] }>
  assignablePrivileges: string[]
}

const selectClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100'

export default function PortalUsersCreate({ roles, privilegeGroups, presets, assignablePrivileges }: PortalUsersCreateProps) {
  const [role, setRole] = useState('member')
  const selectedRole = roles.find((item) => item.value === role) ?? roles[0]
  const defaultPrivileges = selectedRole?.defaultPrivileges ?? []

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          route="portal.users"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon />
          Back to user management
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Add user</h1>
        <p className="mt-1 text-sm text-slate-600">
          Create a portal login and choose what this person can do in your organization.
        </p>
      </div>

      <Form route="portal.users.store" className="space-y-6">
        {({ errors, processing }) => (
          <>
            <Card>
              <CardHeader title="Account details" description="Basic sign-in information." />
              <CardBody className="space-y-4">
                <Input label="Full name" name="fullName" autoComplete="name" error={errors.fullName} />
                <Input label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
                <Input
                  label="Temporary password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  error={errors.password}
                />
                <div>
                  <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className={selectClass}
                  >
                    {roles.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {errors.role ? <p className="mt-1 text-sm text-red-600">{errors.role}</p> : null}
                </div>
              </CardBody>
            </Card>

            {role !== 'owner' ? (
              <PortalPrivilegeEditor
                key={role}
                groups={privilegeGroups}
                presets={presets}
                selected={defaultPrivileges}
                assignable={assignablePrivileges}
              />
            ) : (
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                Organization owners receive full portal access automatically.
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" className="gap-2" loading={processing}>
                <PlusIcon />
                Add user
              </Button>
              <Link
                route="portal.users"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <XMarkIcon />
                Cancel
              </Link>
            </div>
          </>
        )}
      </Form>
    </div>
  )
}
