import { Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon } from '~/components/icons'
import { Badge } from '~/components/ui/badge'
import { Card, CardBody, CardHeader } from '~/components/ui/card'

type SuppliersShowProps = {
  supplier: {
    id: number
    name: string
    code: string | null
    contactName: string | null
    email: string | null
    phone: string | null
    notes: string | null
    isActive: boolean
    branch: string
    branchId: number | null
    createdAt: string
  }
}

export default function SuppliersShow({ supplier }: SuppliersShowProps) {
  return (
    <div className="space-y-6">
      <div>
        <Link
          route="suppliers"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon />
          Back to suppliers
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">{supplier.name}</h1>
          {supplier.isActive ? (
            <Badge tone="success">Active</Badge>
          ) : (
            <Badge tone="danger">Inactive</Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {supplier.branch} · Created {supplier.createdAt}
        </p>
      </div>

      <Card>
        <CardHeader title="Supplier details" />
        <CardBody>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500">Code</dt>
              <dd className="mt-1 text-sm text-slate-900">{supplier.code ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Contact name</dt>
              <dd className="mt-1 text-sm text-slate-900">{supplier.contactName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Email</dt>
              <dd className="mt-1 text-sm text-slate-900">{supplier.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Phone</dt>
              <dd className="mt-1 text-sm text-slate-900">{supplier.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Office</dt>
              <dd className="mt-1 text-sm text-slate-900">{supplier.branch}</dd>
            </div>
            {supplier.notes ? (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500">Notes</dt>
                <dd className="mt-1 text-sm text-slate-700">{supplier.notes}</dd>
              </div>
            ) : null}
          </dl>
        </CardBody>
      </Card>
    </div>
  )
}
