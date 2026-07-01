import { Form, Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '~/components/icons'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'

type CustomersCreateProps = {
  branches: Array<{ id: number; name: string }>
  defaultBranchId: number | null
}

export default function CustomersCreate({ branches, defaultBranchId }: CustomersCreateProps) {
  const lockedBranch = defaultBranchId && branches.length === 1 ? branches[0] : null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          route="customers"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon />
          Back to customers
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Create customer</h1>
        <p className="mt-1 text-sm text-slate-600">Add a new customer to the agency database.</p>
      </div>

      <Card>
        <CardHeader title="Customer details" />
        <CardBody>
          {branches.length === 0 ? (
            <p className="text-sm text-slate-600">
              No offices available. Add an office before creating customers.
            </p>
          ) : (
            <Form route="customers.store" className="space-y-4">
              {({ errors }) => (
                <>
                  <Input label="Full name" name="fullName" autoComplete="name" error={errors.fullName} />
                  <Input label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
                  <Input label="Phone" name="phone" type="tel" autoComplete="tel" error={errors.phone} />
                  <Input label="Company" name="company" error={errors.company} />
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
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
                    <textarea
                      name="notes"
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                    {errors.notes ? <p className="mt-1 text-sm text-red-600">{errors.notes}</p> : null}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="gap-2">
                      <PlusIcon />
                      Create customer
                    </Button>
                    <Link
                      route="customers"
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
