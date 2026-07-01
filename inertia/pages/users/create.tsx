import { Form, Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '~/components/icons'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'

type UsersCreateProps = {
  branches: Array<{ id: number; name: string }>
  roles: Array<{ value: string; label: string }>
  canCreateAdmin: boolean
  defaultBranchId: number | null
}

export default function UsersCreate({
  branches,
  roles,
  canCreateAdmin,
  defaultBranchId,
}: UsersCreateProps) {
  const availableRoles = canCreateAdmin ? roles : roles.filter((role) => role.value !== 'admin')
  const lockedBranch = defaultBranchId && branches.length === 1 ? branches[0] : null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          route="users"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon />
          Back to users
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Create user</h1>
        <p className="mt-1 text-sm text-slate-600">
          Accounts are created by administrators — no self-registration.
        </p>
      </div>

      <Card>
        <CardHeader title="User details" description="All fields are required unless noted." />
        <CardBody>
          {branches.length === 0 && availableRoles.some((role) => role.value !== 'admin') ? (
            <p className="text-sm text-slate-600">
              No offices available. Run the database seeder or add offices before creating
              office-scoped users.
            </p>
          ) : (
            <Form route="users.store" className="space-y-4">
              {({ errors }) => (
                <>
                  <Input label="Full name" name="fullName" autoComplete="name" error={errors.fullName} />
                  <Input label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    error={errors.password}
                  />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
                    <select
                      name="role"
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      {availableRoles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    {errors.role ? <p className="mt-1 text-sm text-red-600">{errors.role}</p> : null}
                  </div>
                  {lockedBranch ? (
                    <>
                      <input type="hidden" name="branchId" value={lockedBranch.id} />
                      <Input label="Office" name="branchName" value={lockedBranch.name} readOnly disabled />
                    </>
                  ) : (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Office</label>
                      <select
                        name="branchId"
                        defaultValue={defaultBranchId ?? ''}
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      >
                        <option value="">Select office</option>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                      {errors.branchId ? <p className="mt-1 text-sm text-red-600">{errors.branchId}</p> : null}
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="gap-2">
                      <PlusIcon />
                      Create user
                    </Button>
                    <Link
                      route="users"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <XMarkIcon />
                      Cancel
                    </Link>
                  </div>
                </>
              )}
            </Form>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
