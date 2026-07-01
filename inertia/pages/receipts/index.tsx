import { useState } from 'react'
import { ArrowPathIcon, FunnelIcon } from '~/components/icons'
import ResourceTable from '~/components/resource_table'
import { useRouterLoading } from '~/hooks/use_router_loading'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { formatCurrency } from '~/lib/format'

type ReceiptRow = {
  id: number
  receiptNumber: string
  customer: string
  invoiceId: number | null
  invoiceNumber: string
  amount: number
  currency: string
  paymentMethod: string
  receivedDate: string
}

type ReceiptsIndexProps = {
  filters: { search: string; branchId: number | null }
  receipts: ReceiptRow[]
}

function buildQuery(filters: ReceiptsIndexProps['filters']) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.branchId !== null) params.set('branchId', String(filters.branchId))
  return params.toString()
}

export default function ReceiptsIndex({ filters, receipts }: ReceiptsIndexProps) {
  const [search, setSearch] = useState(filters.search)
  const { loading: filterLoading, get } = useRouterLoading()

  const filterSummary = search ? `"${search}"` : 'All receipts'

  function applyFilters(next: Partial<ReceiptsIndexProps['filters']>) {
    const merged = { search: next.search ?? search, branchId: filters.branchId }
    setSearch(merged.search)
    const query = buildQuery(merged)
    get(query ? `/receipts?${query}` : '/receipts')
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
        action="/receipts"
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
              placeholder="Receipt number"
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
        title="Receipts"
        description={`${receipts.length} receipt${receipts.length === 1 ? '' : 's'} · ${filterSummary}`}
        createHref="/receipts/create"
        createLabel="Record receipt"
        columns={[
          { key: 'receiptNumber', label: 'Number', className: 'font-medium text-slate-900' },
          { key: 'customer', label: 'Customer' },
          { key: 'invoiceNumber', label: 'Invoice', className: 'text-slate-600' },
          {
            key: 'amount',
            label: 'Amount',
            className: 'font-medium text-slate-900',
            render: (_, row) => formatCurrency(row.amount, row.currency),
          },
          { key: 'paymentMethod', label: 'Method', className: 'text-slate-600' },
          { key: 'receivedDate', label: 'Received', className: 'text-slate-600' },
        ]}
        rows={receipts}
        rowHref={(row) => (row.invoiceId ? `/invoices/${row.invoiceId}` : undefined)}
        emptyMessage="No receipts match these filters."
      />
    </div>
  )
}
