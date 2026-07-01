import { useState } from 'react'
import { ArrowPathIcon, FunnelIcon } from '~/components/icons'
import ResourceTable from '~/components/resource_table'
import { Badge } from '~/components/ui/badge'
import { useRouterLoading } from '~/hooks/use_router_loading'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { formatCurrency } from '~/lib/format'
import { statusTone } from '~/lib/status_tone'

type QuotationRow = {
  id: number
  reference: string
  customer: string
  bookingReference: string | null
  status: string
  statusLabel: string
  totalAmount: number
  currency: string
  validUntil: string | null
  createdAt: string
}

type QuotationsIndexProps = {
  filters: { search: string; branchId: number | null; pending: boolean }
  branches: Array<{ id: number; name: string }>
  quotations: QuotationRow[]
}

function buildQuery(filters: QuotationsIndexProps['filters']) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.branchId !== null) params.set('branchId', String(filters.branchId))
  if (filters.pending) params.set('pending', '1')
  return params.toString()
}

export default function QuotationsIndex({ filters, branches, quotations }: QuotationsIndexProps) {
  const [search, setSearch] = useState(filters.search)
  const [branchId, setBranchId] = useState<number | null>(filters.branchId)
  const { loading: filterLoading, get } = useRouterLoading()

  const filterSummary = [
    filters.pending ? 'Pending inquiries' : null,
    branches.length > 0 && branchId
      ? branches.find((b) => b.id === branchId)?.name ?? 'Office'
      : branches.length > 0
        ? 'All offices'
        : null,
    search ? `"${search}"` : 'All quotations',
  ]
    .filter(Boolean)
    .join(' · ')

  function applyFilters(next: Partial<QuotationsIndexProps['filters']>) {
    const merged = {
      search: next.search ?? search,
      branchId: next.branchId !== undefined ? next.branchId : branchId,
      pending: next.pending !== undefined ? next.pending : filters.pending,
    }
    setSearch(merged.search)
    setBranchId(merged.branchId)
    const query = buildQuery(merged)
    get(query ? `/quotations?${query}` : '/quotations')
  }

  function handleApply(event?: React.FormEvent) {
    event?.preventDefault()
    applyFilters({ search: search.trim() })
  }

  function handleReset() {
    setSearch('')
    setBranchId(null)
    applyFilters({ search: '', branchId: null, pending: false })
  }

  return (
    <div className="space-y-6">
      <form
        method="get"
        action="/quotations"
        className="rounded-lg border border-slate-200 bg-white p-4"
        onSubmit={handleApply}
      >
        <div className="flex flex-wrap items-end gap-3">
          {branches.length > 0 ? (
            <div className="min-w-[8.5rem] flex-1 basis-[8.5rem]">
              <label htmlFor="office" className="mb-1 block text-sm font-medium text-slate-700">
                Office
              </label>
              <select
                id="office"
                value={branchId === null ? '' : String(branchId)}
                onChange={(event) =>
                  applyFilters({ branchId: event.target.value ? Number(event.target.value) : null })
                }
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              >
                <option value="">All offices</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="min-w-[10rem] flex-1 basis-[10rem]">
            <Input
              label="Search"
              name="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Reference"
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
        title={filters.pending ? 'Pending inquiries' : 'Quotations'}
        description={`${quotations.length} quotation${quotations.length === 1 ? '' : 's'} · ${filterSummary}`}
        createHref="/quotations/create"
        createLabel="Create quotation"
        columns={[
          { key: 'reference', label: 'Reference', className: 'font-medium text-slate-900' },
          { key: 'customer', label: 'Customer' },
          { key: 'bookingReference', label: 'Booking', className: 'text-slate-600' },
          {
            key: 'status',
            label: 'Status',
            render: (_, row) => (
              <Badge tone={statusTone(row.status)}>{row.statusLabel}</Badge>
            ),
          },
          {
            key: 'totalAmount',
            label: 'Amount',
            className: 'font-medium text-slate-900',
            render: (_, row) => formatCurrency(row.totalAmount, row.currency),
          },
          { key: 'validUntil', label: 'Valid until', className: 'text-slate-600' },
          { key: 'createdAt', label: 'Created', className: 'text-slate-600' },
        ]}
        rows={quotations}
        rowHref={(row) => `/quotations/${row.id}`}
        emptyMessage="No quotations match these filters."
      />
    </div>
  )
}
