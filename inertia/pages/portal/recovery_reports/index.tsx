import { Link } from '@adonisjs/inertia/react'
import { useState } from 'react'
import { ArrowPathIcon, DownloadIcon, EyeIcon, FunnelIcon } from '~/components/icons'
import { Badge } from '~/components/ui/badge'
import { useRouterLoading } from '~/hooks/use_router_loading'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { FileDownloadLink } from '~/components/ui/file_download_link'
import { Input } from '~/components/ui/input'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'
import { tableIconButtonClass } from '~/components/ui/table_icon_button'
import { portalLinkClass, portalTableIconPrimaryClass } from '~/lib/portal_theme'
import { formatCurrency } from '~/lib/format'
import { buildRecoveryExportUrl } from '~/lib/recovery_export'
import { stopRowClick } from '~/lib/table_row'
import { statusTone } from '~/lib/status_tone'

type ReportRow = {
  id: number
  recoveryReference: string
  bookingReference: string
  travelerName: string
  productType: string
  price: number
  currency: string
  recoveryStatus: string
  recoveryStatusLabel: string
  sentToClientAt: string
  invoice: { id: number; invoiceNumber: string; status: string } | null
  quotation: { id: number; reference: string } | null
  lineItemCount: number
}

type PortalRecoveryIndexProps = {
  pageTitle?: string
  pageDescription?: string
  filters: { search: string; status: string | null }
  canExport: boolean
  reports: ReportRow[]
}

const STATUS_OPTIONS = [
  { value: 'PENDING_INVOICE', label: 'Pending supplier receipt' },
  { value: 'READY_FOR_CLIENT', label: 'Ready for client' },
  { value: 'SENT_TO_CLIENT', label: 'Sent for review' },
  { value: 'UNDER_CLIENT_REVIEW', label: 'Under review' },
  { value: 'QUERY_RAISED', label: 'Queried' },
  { value: 'APPROVED_BY_CLIENT', label: 'Approved' },
  { value: 'RECOVERED', label: 'Recovered' },
  { value: 'REJECTED', label: 'Rejected' },
]

function buildQuery(filters: PortalRecoveryIndexProps['filters']) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  return params.toString()
}

export default function PortalRecoveryReportsIndex({
  filters,
  canExport,
  reports,
}: PortalRecoveryIndexProps) {
  const [search, setSearch] = useState(filters.search)
  const [status, setStatus] = useState<string | null>(filters.status)
  const { loading, get } = useRouterLoading()

  function applyFilters(next: Partial<PortalRecoveryIndexProps['filters']>) {
    const merged = {
      search: next.search ?? search,
      status: next.status !== undefined ? next.status : status,
    }
    setSearch(merged.search)
    setStatus(merged.status)
    const query = buildQuery(merged)
    get(query ? `/portal/recovery-reports?${query}` : '/portal/recovery-reports')
  }

  function handleApply(event?: React.FormEvent) {
    event?.preventDefault()
    applyFilters({ search: search.trim() })
  }

  function handleReset() {
    setSearch('')
    setStatus(null)
    applyFilters({ search: '', status: null })
  }

  const filterSummary = [
    status
      ? (STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status)
      : 'All statuses',
    search ? `"${search}"` : 'All items',
  ].join(' · ')

  return (
    <div className="space-y-6">
      <form
        method="get"
        action="/portal/recovery-reports"
        className="rounded-lg border border-slate-200 bg-white p-4"
        onSubmit={handleApply}
      >
        <div className="flex flex-wrap items-end gap-3">
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
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
              placeholder="Reference, traveler, PNR, invoice…"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="submit" className="gap-2" loading={loading}>
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {reports.length === 0
            ? 'No recovery reports match these filters.'
            : `${reports.length} recovery report${reports.length === 1 ? '' : 's'} · ${filterSummary}`}
        </p>
        {canExport && reports.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <FileDownloadLink
              href={buildRecoveryExportUrl('/portal/recovery-reports/export', { status, search })}
              className="inline-flex"
            >
              <Button variant="secondary" className="gap-2">
                <DownloadIcon className="h-4 w-4" />
                Export all (Excel)
              </Button>
            </FileDownloadLink>
            <FileDownloadLink
              href={buildRecoveryExportUrl('/portal/recovery-reports/export-pdf', {
                status,
                search,
              })}
              className="inline-flex"
            >
              <Button variant="secondary" className="gap-2">
                <DownloadIcon className="h-4 w-4" />
                Export all (PDF)
              </Button>
            </FileDownloadLink>
          </div>
        ) : null}
      </div>

      <Card className="overflow-hidden">
        {reports.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            No recovery reports match these filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table scrollContainer={false}>
              <THead>
                <TR>
                  <TH>Recovery</TH>
                  <TH>Traveler</TH>
                  <TH>Items</TH>
                  <TH>Amount</TH>
                  <TH>Status</TH>
                  <TH>Sent</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {reports.map((report) => (
                  <TR key={report.id} href={`/portal/recovery-reports/${report.id}`}>
                    <TD>
                      <div className="font-semibold text-slate-900">{report.recoveryReference}</div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        Booking {report.bookingReference}
                        {report.invoice ? (
                          <>
                            {' '}
                            ·{' '}
                            <Link
                              route="portal.invoices.show"
                              routeParams={{ id: report.invoice.id }}
                              className={portalLinkClass}
                              onClick={stopRowClick}
                            >
                              {report.invoice.invoiceNumber}
                            </Link>
                          </>
                        ) : null}
                      </div>
                    </TD>
                    <TD>
                      <div className="text-slate-900">{report.travelerName}</div>
                      <div className="mt-0.5 text-xs capitalize text-slate-500">
                        {report.productType}
                      </div>
                    </TD>
                    <TD className="tabular-nums text-slate-700">
                      {report.lineItemCount} item{report.lineItemCount === 1 ? '' : 's'}
                    </TD>
                    <TD className="font-medium tabular-nums text-slate-900">
                      {formatCurrency(report.price, report.currency)}
                    </TD>
                    <TD>
                      <Badge tone={statusTone(report.recoveryStatus.toLowerCase())}>
                        {report.recoveryStatusLabel}
                      </Badge>
                    </TD>
                    <TD className="whitespace-nowrap text-sm text-slate-600">
                      {report.sentToClientAt}
                    </TD>
                    <TD className="text-right" onClick={stopRowClick}>
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/portal/recovery-reports/${report.id}`}
                          className={portalTableIconPrimaryClass}
                          title="View recovery report"
                          aria-label="View recovery report"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        {canExport ? (
                          <FileDownloadLink
                            href={buildRecoveryExportUrl('/portal/recovery-reports/export', {
                              recoveryItemId: report.id,
                            })}
                            className={tableIconButtonClass('secondary')}
                            title="Export to Excel"
                            aria-label="Export to Excel"
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </FileDownloadLink>
                        ) : null}
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}
