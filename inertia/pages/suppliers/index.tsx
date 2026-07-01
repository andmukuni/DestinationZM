import { useState } from 'react'
import { ArrowPathIcon, FunnelIcon } from '~/components/icons'
import ResourceTable from '~/components/resource_table'
import { Badge } from '~/components/ui/badge'
import { useRouterLoading } from '~/hooks/use_router_loading'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

type SupplierRow = {
  id: number
  name: string
  code: string | null
  contactName: string | null
  email: string | null
  phone: string | null
  isActive: boolean
  branch: string
  branchId: number | null
}

type SuppliersIndexProps = {
  filters: { search: string; branchId: number | null }
  branches: Array<{ id: number; name: string }>
  suppliers: SupplierRow[]
}

function buildQuery(filters: SuppliersIndexProps['filters']) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.branchId !== null) params.set('branchId', String(filters.branchId))
  return params.toString()
}

export default function SuppliersIndex({ filters, branches, suppliers }: SuppliersIndexProps) {
  const [search, setSearch] = useState(filters.search)
  const [branchId, setBranchId] = useState<number | null>(filters.branchId)
  const { loading: filterLoading, get } = useRouterLoading()

  const filterSummary = [
    branches.length > 0 && branchId
      ? branches.find((b) => b.id === branchId)?.name ?? 'Office'
      : branches.length > 0
        ? 'All offices'
        : null,
    search ? `"${search}"` : 'All suppliers',
  ]
    .filter(Boolean)
    .join(' · ')

  function applyFilters(next: Partial<SuppliersIndexProps['filters']>) {
    const merged = {
      search: next.search ?? search,
      branchId: next.branchId !== undefined ? next.branchId : branchId,
    }
    setSearch(merged.search)
    setBranchId(merged.branchId)
    const query = buildQuery(merged)
    get(query ? `/suppliers?${query}` : '/suppliers')
  }

  function handleApply(event?: React.FormEvent) {
    event?.preventDefault()
    applyFilters({ search: search.trim() })
  }

  function handleReset() {
    setSearch('')
    setBranchId(null)
    applyFilters({ search: '', branchId: null })
  }

  return (
    <div className="space-y-6">
      <form
        method="get"
        action="/suppliers"
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
              placeholder="Name, code, or contact"
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
        title="Suppliers"
        description={`${suppliers.length} supplier${suppliers.length === 1 ? '' : 's'} · ${filterSummary}`}
        createHref="/suppliers/create"
        createLabel="Create supplier"
        columns={[
          { key: 'name', label: 'Name', className: 'font-medium text-slate-900' },
          { key: 'code', label: 'Code', className: 'text-slate-600' },
          { key: 'contactName', label: 'Contact', className: 'text-slate-600' },
          { key: 'email', label: 'Email', className: 'text-slate-600' },
          { key: 'phone', label: 'Phone', className: 'text-slate-600' },
          {
            key: 'isActive',
            label: 'Status',
            render: (value) =>
              value ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Inactive</Badge>,
          },
          { key: 'branch', label: 'Office' },
        ]}
        rows={suppliers}
        rowHref={(row) => `/suppliers/${row.id}`}
        emptyMessage="No suppliers match these filters."
      />
    </div>
  )
}
