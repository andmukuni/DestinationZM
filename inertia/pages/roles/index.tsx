import { useForm } from '@inertiajs/react'
import { Fragment, useMemo } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'

type PermissionGroup = {
  id: string
  label: string
  permissions: Array<{
    slug: string
    label: string
    description: string
  }>
}

type RoleSummary = {
  value: string
  label: string
  userCount: number
  manageable: boolean
}

type RolesIndexProps = {
  permissionGroups: PermissionGroup[]
  roles: RoleSummary[]
  rolePermissions: Record<string, string[]>
}

export default function RolesIndex({ permissionGroups, roles, rolePermissions }: RolesIndexProps) {
  const manageableRoles = useMemo(
    () => roles.filter((role) => role.manageable).map((role) => role.value),
    [roles]
  )

  const initialPermissions = useMemo(() => {
    const record: Record<string, string[]> = {}
    for (const role of manageableRoles) {
      record[role] = rolePermissions[role] ?? []
    }
    return record
  }, [manageableRoles, rolePermissions])

  const form = useForm({
    permissions: initialPermissions,
  })

  function togglePermission(role: string, slug: string) {
    const current = form.data.permissions[role] ?? []
    const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]
    form.setData('permissions', { ...form.data.permissions, [role]: next })
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    form.patch('/roles')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Roles & permissions</h1>
        <p className="mt-1 text-sm text-slate-600">
          Configure what each department role can access across the system.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {roles.map((role) => (
          <Card key={role.value} className="h-full">
            <CardBody>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">Role</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{role.label}</p>
                </div>
                {!role.manageable ? <Badge tone="info">Full access</Badge> : null}
              </div>
              <p className="mt-3 text-sm text-slate-600">
                {role.userCount} user{role.userCount === 1 ? '' : 's'}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Permission matrix"
          description="System administrators always have full access. Adjust permissions for each department role."
        />
        <CardBody className="p-0">
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Permission
                    </th>
                    {roles.map((role) => (
                      <th
                        key={role.value}
                        className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {role.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {permissionGroups.map((group) => (
                    <Fragment key={group.id}>
                      <tr className="bg-slate-50/60">
                        <td
                          colSpan={roles.length + 1}
                          className="px-6 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
                        >
                          {group.label}
                        </td>
                      </tr>
                      {group.permissions.map((permission) => (
                        <tr key={permission.slug}>
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900">{permission.label}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{permission.description}</p>
                          </td>
                          {roles.map((role) => {
                            const isAdmin = role.value === 'admin'
                            const isManageable = role.manageable
                            const checked = isAdmin
                              ? true
                              : (form.data.permissions[role.value]?.includes(permission.slug) ?? false)

                            return (
                              <td key={`${role.value}-${permission.slug}`} className="px-4 py-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={!isManageable}
                                  aria-label={`${permission.label} for ${role.label}`}
                                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 disabled:opacity-60"
                                  onChange={() => {
                                    if (isManageable) {
                                      togglePermission(role.value, permission.slug)
                                    }
                                  }}
                                />
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <Button
                type="button"
                variant="secondary"
                disabled={!form.isDirty || form.processing}
                onClick={() => form.setData('permissions', initialPermissions)}
              >
                Reset changes
              </Button>
              <Button type="submit" loading={form.processing} disabled={!form.isDirty}>
                Save permissions
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
