import { Form, Link } from '@adonisjs/inertia/react'
import { useState } from 'react'
import { ArrowPathIcon, FunnelIcon, PlusIcon, QuickbooksIcon } from '~/components/icons'
import ResourceTable from '~/components/resource_table'
import { Badge } from '~/components/ui/badge'
import { useRouterLoading } from '~/hooks/use_router_loading'
import { Button } from '~/components/ui/button'
import { ConfirmSubmitButton } from '~/components/ui/confirm_submit_button'
import { Input } from '~/components/ui/input'
import { formatCurrency, formatStatusLabel } from '~/lib/format'
import {
  invoicePaymentLabel,
  invoicePaymentTone,
  quickbooksInvoiceLabel,
  quickbooksInvoiceTone,
  quickbooksPaymentLabel,
  quickbooksPaymentTone,
} from '~/lib/quickbooks'
import { statusTone } from '~/lib/status_tone'

type InvoiceRow = {
  id: number
  invoiceNumber: string
  customer: string
  status: string
  totalAmount: number
  amountPaid: number
  currency: string
  issueDate: string
  dueDate: string
  branch: string
  quickbooksStatus: 'pending' | 'synced' | 'failed' | 'skipped' | null
  quickbooksInvoiceId: string | null
  quickbooksPaymentStatus: 'pending' | 'synced' | 'failed' | null
  canPostToQuickbooks: boolean
  canRetryQuickbooks: boolean
}

type InvoicesIndexProps = {
  filters: { search: string; status: string | null; branchId: number | null }
  branches: Array<{ id: number; name: string }>
  invoices: InvoiceRow[]
  canManage: boolean
  quickbooksConnected: boolean
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'issued', label: 'Issued' },
  { value: 'partially_paid', label: 'Partially paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'void', label: 'Void' },
]

function buildQuery(filters: InvoicesIndexProps['filters']) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.branchId !== null) params.set('branchId', String(filters.branchId))
  return params.toString()
}

export default function InvoicesIndex({
  filters,
  branches,
  invoices,
  canManage,
  quickbooksConnected,
}: InvoicesIndexProps) {
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
    search ? `"${search}"` : 'All invoices',
  ]
    .filter(Boolean)
    .join(' · ')

  function applyFilters(next: Partial<InvoicesIndexProps['filters']>) {
    const merged = {
      search: next.search ?? search,
      status: next.status !== undefined ? next.status : status,
      branchId: next.branchId !== undefined ? next.branchId : branchId,
    }
    setSearch(merged.search)
    setStatus(merged.status)
    setBranchId(merged.branchId)
    const query = buildQuery(merged)
    get(query ? `/invoices?${query}` : '/invoices')
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

  const showQuickbooksColumns = canManage

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Invoices</h1>
          <p className="mt-1 text-sm text-slate-600">
            {invoices.length} invoice{invoices.length === 1 ? '' : 's'} · {filterSummary}
          </p>
        </div>
        {canManage ? (
          <Link
            href="/invoices/create"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-transparent bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            <PlusIcon />
            Create invoice
          </Link>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <form
          method="get"
          action="/invoices"
          className="border-b border-slate-200 bg-slate-50/60 p-4"
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
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
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
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
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
                placeholder="Invoice number"
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
          title="Invoices"
          showHeader={false}
          embedded
          columns={[
          { key: 'invoiceNumber', label: 'Number', className: 'font-medium text-slate-900' },
          { key: 'customer', label: 'Customer' },
          {
            key: 'status',
            label: 'Status',
            render: (value) => (
              <Badge tone={statusTone(String(value))}>{formatStatusLabel(String(value))}</Badge>
            ),
          },
          {
            key: 'payment',
            label: 'Payment',
            render: (_, row) => {
              const paymentLabel = invoicePaymentLabel(row.status, row.amountPaid, row.totalAmount)
              const qboPaymentLabel = quickbooksPaymentLabel(row.quickbooksPaymentStatus)

              return (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={invoicePaymentTone(row.status, row.amountPaid, row.totalAmount)}>
                    {paymentLabel}
                  </Badge>
                  {qboPaymentLabel ? (
                    <Badge tone={quickbooksPaymentTone(row.quickbooksPaymentStatus)}>
                      {qboPaymentLabel}
                    </Badge>
                  ) : null}
                </div>
              )
            },
          },
          ...(showQuickbooksColumns
            ? [
                {
                  key: 'quickbooksStatus',
                  label: 'QBO',
                  render: (_: unknown, row: InvoiceRow) => (
                    <Badge tone={quickbooksInvoiceTone(row.quickbooksStatus)}>
                      {quickbooksInvoiceLabel(row.quickbooksStatus, quickbooksConnected)}
                    </Badge>
                  ),
                } as const,
              ]
            : []),
          {
            key: 'totalAmount',
            label: 'Total',
            className: 'font-medium text-slate-900',
            render: (_, row) => formatCurrency(row.totalAmount, row.currency),
          },
          {
            key: 'amountPaid',
            label: 'Paid',
            className: 'text-slate-600',
            render: (_, row) => formatCurrency(row.amountPaid, row.currency),
          },
          { key: 'issueDate', label: 'Issued', className: 'text-slate-600' },
          { key: 'dueDate', label: 'Due', className: 'text-slate-600' },
          ...(showQuickbooksColumns && quickbooksConnected
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
                  render: (_: unknown, row: InvoiceRow) => {
                    if (!row.canPostToQuickbooks && !row.canRetryQuickbooks) {
                      return null
                    }

                    return (
                      <Form route="invoices.quickbooks.retry" routeParams={{ id: row.id }}>
                        <ConfirmSubmitButton
                          variant="secondary"
                          size="sm"
                          className="gap-1.5"
                          title={
                            row.canRetryQuickbooks
                              ? 'Retry QuickBooks sync?'
                              : 'Post to QuickBooks?'
                          }
                          description={
                            row.canRetryQuickbooks
                              ? 'Retry syncing this invoice to QuickBooks Online?'
                              : 'Post this invoice to QuickBooks Online?'
                          }
                          confirmLabel={row.canRetryQuickbooks ? 'Retry sync' : 'Post to QBO'}
                        >
                          <QuickbooksIcon className="h-4 w-4 shrink-0" />
                          {row.canRetryQuickbooks ? (
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
          rows={invoices}
          rowHref={(row) => `/invoices/${row.id}`}
          emptyMessage="No invoices match these filters."
        />
      </div>
    </div>
  )
}
