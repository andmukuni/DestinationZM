import { Form, Link } from '@adonisjs/inertia/react'
import { useEffect } from 'react'
import { ArrowLeftIcon } from '~/components/icons'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { PortalPrivilegeEditor } from '~/components/portal_privilege_editor'
import { UserAvatar } from '~/components/ui/user_avatar'

type PortalUsersEditProps = {
  pageTitle?: string
  pageDescription?: string
  organizationName: string
  isManager: boolean
  member: {
    id: number
    fullName: string
    email: string
    role: string
    roleLabel: string
    isActive: boolean
    initials: string
    isOrganizationOwner: boolean
    isSelf: boolean
    canChangePassword: boolean
  }
  roles: Array<{ value: string; label: string }>
  privileges: string[]
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

export default function PortalUsersEdit({
  member,
  roles,
  privileges,
  privilegeGroups,
  presets,
  assignablePrivileges,
}: PortalUsersEditProps) {
  const readOnly = member.isOrganizationOwner
  const showPasswordReset =
    member.canChangePassword === true ||
    (member.isSelf && (member.isOrganizationOwner || member.role === 'owner' || member.role === 'admin'))

  useEffect(() => {
    if (window.location.hash === '#password' && showPasswordReset) {
      document.getElementById('password')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showPasswordReset])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/portal/users"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon />
          Back to user management
        </Link>
      </div>

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <UserAvatar initials={member.initials} className="h-12 w-12 bg-slate-900 text-base" />
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{member.fullName}</h1>
              <p className="text-sm text-slate-500">{member.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={member.isOrganizationOwner ? 'info' : 'default'}>{member.roleLabel}</Badge>
            <Badge tone={member.isActive ? 'success' : 'default'}>
              {member.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardBody>
      </Card>

      <Form action={`/portal/users/${member.id}`} method="post" className="space-y-6">
        {({ errors, processing }) => (
          <>
            {showPasswordReset ? (
              <div id="password" className="scroll-mt-24">
                <Card className="border-orange-200 bg-orange-50/40">
                  <CardHeader
                    title="Change password"
                    description={
                      member.isSelf
                        ? 'Set a new portal sign-in password for your account. Both fields must match.'
                        : 'Set a new portal sign-in password for this user. Both fields must match.'
                    }
                  />
                  <CardBody className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="New password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Minimum 8 characters"
                      error={errors.password}
                    />
                    <Input
                      label="Confirm new password"
                      name="passwordConfirmation"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Re-enter the new password"
                      error={errors.passwordConfirmation}
                    />
                  </CardBody>
                </Card>
              </div>
            ) : null}

            {!readOnly ? (
              <Card>
                <CardHeader title="Role" description="The role sets default privileges. You can customize below." />
                <CardBody>
                  <select
                    name="role"
                    defaultValue={member.role}
                    className={selectClass}
                    aria-label="User role"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {errors.role ? <p className="mt-1 text-sm text-red-600">{errors.role}</p> : null}
                </CardBody>
              </Card>
            ) : (
              <input type="hidden" name="role" value={member.role} />
            )}

            <PortalPrivilegeEditor
              groups={privilegeGroups}
              presets={presets}
              selected={privileges}
              assignable={assignablePrivileges}
              disabled={readOnly}
              readOnlyMessage={
                readOnly
                  ? 'Organization owners always have full portal access, including user management.'
                  : undefined
              }
            />

            <div className="flex flex-wrap gap-3">
              {!readOnly || showPasswordReset ? (
                <Button type="submit" loading={processing}>
                  Save changes
                </Button>
              ) : null}
              <Link
                href="/portal/users"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Done
              </Link>
            </div>
          </>
        )}
      </Form>
    </div>
  )
}
