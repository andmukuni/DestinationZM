import { useState } from 'react'
import { ArrowPathIcon, FunnelIcon } from '~/components/icons'
import ResourceTable from '~/components/resource_table'
import { Badge } from '~/components/ui/badge'
import { useRouterLoading } from '~/hooks/use_router_loading'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { formatCurrency, formatStatusLabel } from '~/lib/format'
import { statusTone } from '~/lib/status_tone'

type BookingRow = {
  id: number
  reference: string
  customer: string
  destination: string
  departDate: string
  returnDate: string
  status: string
  statusLabel: string
  totalAmount: number
  currency: string
  branch: string
  agent: string
}

type BookingsIndexProps = {
  filters: { search: string; status: string | null; branchId: number | null }
  branches: Array<{ id: number; name: string }>
  bookings: BookingRow[]
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'paid', label: 'Paid' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function buildQuery(filters: BookingsIndexProps['filters']) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.branchId !== null) params.set('branchId', String(filters.branchId))
  return params.toString()
}

export default function BookingsIndex({ filters, branches, bookings }: BookingsIndexProps) {
  const [search, setSearch] = useState(filters.search)
  const [status, setStatus] = useState<string | null>(filters.status)
  const [branchId, setBranchId] = useState<number | null>(filters.branchId)
  const { loading: filterLoading, get } = useRouterLoading()

  const filterSummary = [
    branches.length > 0 && branchId
      ? branches.find((b) => b.id === branchId)?.name ?? 'Office'
      : branches.length > 0
        ? 'All offices'
        : null,
    status ? formatStatusLabel(status) : 'All statuses',
    search ? `"${search}"` : 'All enquiries',
  ]
    .filter(Boolean)
    .join(' · ')

  function applyFilters(next: Partial<BookingsIndexProps['filters']>) {
    const merged = {
      search: next.search ?? search,
      status: next.status !== undefined ? next.status : status,
      branchId: next.branchId !== undefined ? next.branchId : branchId,
    }
    setSearch(merged.search)
    setStatus(merged.status)
    setBranchId(merged.branchId)
    const query = buildQuery(merged)
    get(query ? `/bookings?${query}` : '/bookings')
  }

  function handleApply(event?: React.FormEvent) {
    event?.preventDefault()
    applyFilters({ search: search.trim() })
  }

  function handleReset() {
    setSearch('')
    setStatus(null)
    setBranchId(null)
    applyFilters({ search: '', status: null, branchId: null })
  }

  return (
    <div className="space-y-6">
      <form
        method="get"
        action="/bookings"
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
          <div className="min-w-[8.5rem] flex-1 basis-[8.5rem]">
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="status"
              value={status ?? ''}
              onChange={(event) => applyFilters({ status: event.target.value || null })}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[10rem] flex-1 basis-[10rem]">
            <Input
              label="Search"
              name="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Reference or destination"
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
        title="Enquiries"
        description={`${bookings.length} ${bookings.length === 1 ? 'enquiry' : 'enquiries'} · ${filterSummary}`}
        createHref="/bookings/create"
        createLabel="Create enquiry"
        columns={[
          { key: 'reference', label: 'Reference', className: 'font-medium text-slate-900' },
          { key: 'customer', label: 'Customer' },
          { key: 'destination', label: 'Destination' },
          { key: 'departDate', label: 'Depart', className: 'text-slate-600' },
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
          { key: 'agent', label: 'Agent', className: 'text-slate-600' },
        ]}
        rows={bookings}
        rowHref={(row) => `/bookings/${row.id}`}
        emptyMessage="No enquiries match these filters."
      />
    </div>
  )
}
