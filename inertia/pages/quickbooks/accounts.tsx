import { Form } from '@adonisjs/inertia/react'
import { useState } from 'react'
import { ArrowPathIcon, FunnelIcon, QuickbooksIcon } from '~/components/icons'
import ResourceTable from '~/components/resource_table'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useRouterLoading } from '~/hooks/use_router_loading'
import { formatCurrency } from '~/lib/format'

type AccountRow = {
  id: number
  quickbooksId: string
  name: string
  fullyQualifiedName: string
  accountType: string
  accountSubType: string
  classification: string
  currency: string | null
  currentBalance: number | null
}

type QuickbooksAccountsProps = {
  filters: { search: string; type: string | null }
  accountTypes: string[]
  accounts: AccountRow[]
  quickbooksConnected: boolean
  canRefresh: boolean
  lastSyncedAt: string | null
}

function buildQuery(filters: QuickbooksAccountsProps['filters']) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.type) params.set('type', filters.type)
  return params.toString()
}

export default function QuickbooksAccounts({
  filters,
  accountTypes,
  accounts,
  quickbooksConnected,
  canRefresh,
  lastSyncedAt,
}: QuickbooksAccountsProps) {
  const [search, setSearch] = useState(filters.search)
  const [type, setType] = useState<string | null>(filters.type)
  const { loading: filterLoading, get } = useRouterLoading()

  function applyFilters(next: Partial<QuickbooksAccountsProps['filters']>) {
    const merged = {
      search: next.search ?? search,
      type: next.type !== undefined ? next.type : type,
    }
    setSearch(merged.search)
    setType(merged.type)
    const query = buildQuery(merged)
    get(query ? `/quickbooks/accounts?${query}` : '/quickbooks/accounts')
  }

  function handleApply(event?: React.FormEvent) {
    event?.preventDefault()
    applyFilters({ search: search.trim() })
  }

  function handleReset() {
    setSearch('')
    setType(null)
    applyFilters({ search: '', type: null })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <QuickbooksIcon className="h-6 w-6" />
            Chart of accounts
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {accounts.length} account{accounts.length === 1 ? '' : 's'} from QuickBooks Online
            {lastSyncedAt ? ` · Up to date as of ${lastSyncedAt}` : ''}
          </p>
        </div>
        {canRefresh && quickbooksConnected ? (
          <Form route="quickbooks.accounts.refresh">
            <Button type="submit" variant="secondary" className="gap-2">
              <ArrowPathIcon />
              Refresh from QuickBooks
            </Button>
          </Form>
        ) : null}
      </div>

      {!quickbooksConnected ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          QuickBooks is not connected. Connect it in Settings → QuickBooks to load the chart of
          accounts.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <form
            method="get"
            action="/quickbooks/accounts"
            className="border-b border-slate-200 bg-slate-50/60 p-4"
            onSubmit={handleApply}
          >
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[10rem] flex-1 basis-[10rem]">
                <label htmlFor="type" className="mb-1 block text-sm font-medium text-slate-700">
                  Type
                </label>
                <select
                  id="type"
                  value={type ?? ''}
                  onChange={(event) => applyFilters({ type: event.target.value || null })}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="">All types</option>
                  {accountTypes.map((option) => (
                    <option key={option} value={option}>
                      {option}
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
                  placeholder="Account name"
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
            title="Chart of accounts"
            showHeader={false}
            embedded
            columns={[
              {
                key: 'fullyQualifiedName',
                label: 'Account',
                className: 'font-medium text-slate-900',
              },
              { key: 'accountType', label: 'Type', className: 'text-slate-600' },
              { key: 'accountSubType', label: 'Detail type', className: 'text-slate-600' },
              {
                key: 'classification',
                label: 'Classification',
                render: (value) =>
                  value && value !== '—' ? <Badge tone="info">{String(value)}</Badge> : '—',
              },
              {
                key: 'currentBalance',
                label: 'Balance',
                className: 'font-medium text-slate-900',
                render: (_, row) =>
                  row.currentBalance !== null
                    ? formatCurrency(row.currentBalance, row.currency ?? 'ZMW')
                    : '—',
              },
            ]}
            rows={accounts}
            emptyMessage="No accounts found. Use “Refresh from QuickBooks” to pull the chart of accounts."
          />
        </div>
      )}
    </div>
  )
}
