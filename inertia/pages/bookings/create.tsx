import { Form, Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '~/components/icons'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'

type BookingsCreateProps = {
  branches: Array<{ id: number; name: string }>
  customers: Array<{ id: number; fullName: string }>
  agents: Array<{ id: number; fullName: string }>
  defaultBranchId: number | null
}

export default function BookingsCreate({
  branches,
  customers,
  agents,
  defaultBranchId,
}: BookingsCreateProps) {
  const lockedBranch = defaultBranchId && branches.length === 1 ? branches[0] : null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          route="bookings"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon />
          Back to bookings
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Create booking</h1>
        <p className="mt-1 text-sm text-slate-600">Record a new travel booking for a customer.</p>
      </div>

      <Card>
        <CardHeader title="Booking details" />
        <CardBody>
          {branches.length === 0 || customers.length === 0 ? (
            <p className="text-sm text-slate-600">
              {branches.length === 0
                ? 'No offices available.'
                : 'No customers available. Create a customer first.'}
            </p>
          ) : (
            <Form route="bookings.store" className="space-y-4">
              {({ errors }) => (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Customer</label>
                    <select
                      name="customerId"
                      required
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">Select customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.fullName}
                        </option>
                      ))}
                    </select>
                    {errors.customerId ? <p className="mt-1 text-sm text-red-600">{errors.customerId}</p> : null}
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
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Assigned agent</label>
                    <select
                      name="assignedUserId"
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">Unassigned</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.fullName}
                        </option>
                      ))}
                    </select>
                    {errors.assignedUserId ? (
                      <p className="mt-1 text-sm text-red-600">{errors.assignedUserId}</p>
                    ) : null}
                  </div>
                  <Input label="Destination" name="destination" error={errors.destination} />
                  <Input label="Depart date" name="departDate" type="date" error={errors.departDate} />
                  <Input label="Return date" name="returnDate" type="date" error={errors.returnDate} />
                  <Input label="Passengers (pax)" name="pax" type="number" min={1} error={errors.pax} />
                  <Input label="Total amount" name="totalAmount" type="number" min={0} step="0.01" error={errors.totalAmount} />
                  <Input label="Currency" name="currency" value="ZMW" maxLength={3} error={errors.currency} />
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
                      Create booking
                    </Button>
                    <Link
                      route="bookings"
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
