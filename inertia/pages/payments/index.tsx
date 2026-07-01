import { useState } from 'react'
import { ArrowPathIcon, FunnelIcon } from '~/components/icons'
import ResourceTable from '~/components/resource_table'
import { Badge } from '~/components/ui/badge'
import { useRouterLoading } from '~/hooks/use_router_loading'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { formatCurrency, formatStatusLabel } from '~/lib/format'
import { statusTone } from '~/lib/status_tone'

type PaymentRow = {
  id: number
  reference: string
  customer: string
  invoiceId: number | null
  invoiceNumber: string
  amount: number
  currency: string
  paymentMethod: string
  paymentDate: string
  status: string
}

type PaymentsIndexProps = {
  filters: { search: string; branchId: number | null }
  payments: PaymentRow[]
}

function buildQuery(filters: PaymentsIndexProps['filters']) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.branchId !== null) params.set('branchId', String(filters.branchId))
  return params.toString()
}

export default function PaymentsIndex({ filters, payments }: PaymentsIndexProps) {
  const [search, setSearch] = useState(filters.search)
  const { loading: filterLoading, get } = useRouterLoading()

  const filterSummary = search ? `"${search}"` : 'All payments'

  function applyFilters(next: Partial<PaymentsIndexProps['filters']>) {
    const merged = { search: next.search ?? search, branchId: filters.branchId }
    setSearch(merged.search)
    const query = buildQuery(merged)
    get(query ? `/payments?${query}` : '/payments')
  }

  function handleApply(event?: React.FormEvent) {
    event?.preventDefault()
    applyFilters({ search: search.trim() })
  }

  function handleReset() {
    setSearch('')
    applyFilters({ search: '' })
  }

  return (
    <div className="space-y-6">
      <form
        method="get"
        action="/payments"
        className="rounded-lg border border-slate-200 bg-white p-4"
        onSubmit={handleApply}
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[10rem] flex-1 basis-[10rem]">
            <Input
              label="Search"
              name="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Payment reference"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="submit" className="gap-2" loading={filterLoading}>
              <FunnelIcon />
              Apply filters
            </Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={handleReset}>
              <ArrowPathIcon />
              Reset
            </Button>
          </div>
        </div>
      </form>

      <ResourceTable
        title="Payments"
        description={`${payments.length} payment${payments.length === 1 ? '' : 's'} · ${filterSummary}`}
        createHref="/payments/create"
        createLabel="Record payment"
        columns={[
          { key: 'reference', label: 'Reference', className: 'font-medium text-slate-900' },
          { key: 'customer', label: 'Customer' },
          { key: 'invoiceNumber', label: 'Invoice', className: 'text-slate-600' },
          {
            key: 'amount',
            label: 'Amount',
            className: 'font-medium text-slate-900',
            render: (_, row) => formatCurrency(row.amount, row.currency),
          },
          { key: 'paymentMethod', label: 'Method', className: 'text-slate-600' },
          { key: 'paymentDate', label: 'Date', className: 'text-slate-600' },
          {
            key: 'status',
            label: 'Status',
            render: (value) => (
              <Badge tone={statusTone(String(value))}>{formatStatusLabel(String(value))}</Badge>
            ),
          },
        ]}
        rows={payments}
        rowHref={(row) => (row.invoiceId ? `/invoices/${row.invoiceId}` : undefined)}
        emptyMessage="No payments match these filters."
      />
    </div>
  )
}
