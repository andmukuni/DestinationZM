import { Form } from '@adonisjs/inertia/react'
import { useState } from 'react'
import { ArrowPathIcon, FunnelIcon, QuickbooksIcon } from '~/components/icons'
import ResourceTable from '~/components/resource_table'
import { useRouterLoading } from '~/hooks/use_router_loading'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { ConfirmSubmitButton } from '~/components/ui/confirm_submit_button'
import { Input } from '~/components/ui/input'
import { quickbooksInvoiceLabel, quickbooksInvoiceTone } from '~/lib/quickbooks'

type CustomerRow = {
  id: number
  fullName: string
  email: string | null
  phone: string | null
  company: string | null
  branch: string
  branchId: number | null
  createdAt: string
  quickbooksStatus: 'pending' | 'synced' | 'failed' | 'skipped' | null
  quickbooksId: string | null
}

type CustomersIndexProps = {
  filters: { search: string; branchId: number | null }
  branches: Array<{ id: number; name: string }>
  customers: CustomerRow[]
  canManage: boolean
  quickbooksConnected: boolean
}

function buildQuery(filters: CustomersIndexProps['filters']) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.branchId !== null) params.set('branchId', String(filters.branchId))
  return params.toString()
}

export default function CustomersIndex({
  filters,
  branches,
  customers,
  canManage,
  quickbooksConnected,
}: CustomersIndexProps) {
  const [search, setSearch] = useState(filters.search)
  const [branchId, setBranchId] = useState<number | null>(filters.branchId)
  const { loading: filterLoading, get } = useRouterLoading()

  const filterSummary = [
    branches.length > 0 && branchId
      ? (branches.find((b) => b.id === branchId)?.name ?? 'Office')
      : branches.length > 0
        ? 'All offices'
        : null,
    search ? `"${search}"` : 'All customers',
  ]
    .filter(Boolean)
    .join(' · ')

  function applyFilters(next: Partial<CustomersIndexProps['filters']>) {
    const merged = {
      search: next.search ?? search,
      branchId: next.branchId !== undefined ? next.branchId : branchId,
    }
    setSearch(merged.search)
    setBranchId(merged.branchId)
    const query = buildQuery(merged)
    get(query ? `/customers?${query}` : '/customers')
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
        action="/customers"
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
                name="branchId"
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
              placeholder="Name, email, phone, company"
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
        title="Customers"
        description={`${customers.length} customer${customers.length === 1 ? '' : 's'} · ${filterSummary}`}
        createHref="/customers/create"
        createLabel="Create customer"
        columns={[
          { key: 'fullName', label: 'Name', className: 'font-medium text-slate-900' },
          { key: 'email', label: 'Email', className: 'text-slate-600' },
          { key: 'phone', label: 'Phone', className: 'text-slate-600' },
          { key: 'company', label: 'Company', className: 'text-slate-600' },
          { key: 'branch', label: 'Office' },
          { key: 'createdAt', label: 'Created', className: 'text-slate-600' },
          ...(quickbooksConnected
            ? [
                {
                  key: 'quickbooksStatus',
                  label: 'QBO',
                  render: (_: unknown, row: CustomerRow) => (
                    <Badge tone={quickbooksInvoiceTone(row.quickbooksStatus)}>
                      {quickbooksInvoiceLabel(row.quickbooksStatus, quickbooksConnected)}
                    </Badge>
                  ),
                } as const,
              ]
            : []),
          ...(canManage && quickbooksConnected
            ? [
                {
                  key: 'actions',
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <QuickbooksIcon className="h-3.5 w-3.5" />
                      <span className="sr-only">QuickBooks actions</span>
                    </span>
                  ),
                  stopRowClick: true,
                  render: (_: unknown, row: CustomerRow) => {
                    if (row.quickbooksStatus === 'synced' || row.quickbooksStatus === 'pending') {
                      return null
                    }

                    const isRetry = row.quickbooksStatus === 'failed'

                    return (
                      <Form route="customers.quickbooks.retry" routeParams={{ id: row.id }}>
                        <ConfirmSubmitButton
                          variant="secondary"
                          size="sm"
                          className="gap-1.5"
                          title={isRetry ? 'Retry QuickBooks sync?' : 'Post to QuickBooks?'}
                          description={
                            isRetry
                              ? `Retry syncing ${row.fullName} to QuickBooks Online?`
                              : `Post ${row.fullName} to QuickBooks Online?`
                          }
                          confirmLabel={isRetry ? 'Retry sync' : 'Post to QBO'}
                        >
                          <QuickbooksIcon className="h-4 w-4 shrink-0" />
                          {isRetry ? (
                            <>
                              <ArrowPathIcon className="h-3.5 w-3.5 shrink-0" />
                              Retry
                            </>
                          ) : (
                            'Post to QBO'
                          )}
                        </ConfirmSubmitButton>
                      </Form>
                    )
                  },
                } as const,
              ]
            : []),
        ]}
        rows={customers}
        rowHref={(row) => `/customers/${row.id}`}
        emptyMessage="No customers match these filters."
      />
    </div>
  )
}
