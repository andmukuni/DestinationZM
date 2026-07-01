import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import { ArrowPathIcon, FunnelIcon } from '~/components/icons'
import { Badge } from '~/components/ui/badge'
import { useRouterLoading } from '~/hooks/use_router_loading'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'

type CycleRow = {
  id: number
  bookingReference: string
  customer: string
  destination: string
  enquiryDate: string
  quotationId: number | null
  quotationReference: string | null
  quotationStatus: string | null
  quotationStatusLabel: string | null
  recoveryItemId: number | null
  recoveryReference: string | null
  recoveryStatus: string | null
  recoveryStatusLabel: string | null
  invoiceId: number | null
  invoiceNumber: string | null
  invoiceStatus: string | null
  invoiceStatusLabel: string | null
  paidAt: string | null
  amount: string
  bookingStatus: string
  bookingStatusLabel: string
  stageLabel: string | null
}

type WorkflowCyclesIndexProps = {
  pageTitle?: string
  pageDescription?: string
  filters: { search: string }
  incompleteCount: number
  cycles: CycleRow[]
}

function resolveTab(url: string): 'in_progress' | 'completed' {
  const query = url.includes('?') ? url.slice(url.indexOf('?') + 1) : ''
  const tab = new URLSearchParams(query).get('tab')
  return tab === 'completed' ? 'completed' : 'in_progress'
}

export default function WorkflowCyclesIndex({
  filters,
  incompleteCount,
  cycles,
  pageDescription,
}: WorkflowCyclesIndexProps) {
  const { url } = usePage()
  const [search, setSearch] = useState(filters.search)
  const { loading, get } = useRouterLoading()
  const tab = resolveTab(url)

  function apply(nextSearch = search.trim(), nextTab = tab) {
    const params = new URLSearchParams()
    if (nextTab === 'completed') params.set('tab', 'completed')
    if (nextSearch) params.set('search', nextSearch)
    get(params.toString() ? `/workflow-cycles?${params}` : '/workflow-cycles')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Full workflow cycles</h1>
        <p className="mt-1 text-sm text-slate-600">
          {pageDescription ??
            'Track bookings through the middleman workflow from quotation approval to client payment.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => apply(search, 'in_progress')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            tab === 'in_progress'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
          }`}
        >
          In progress
          {incompleteCount > 0 ? (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
              {incompleteCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => apply(search, 'completed')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            tab === 'completed'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
          }`}
        >
          Completed
        </button>
      </div>

      <form
        className="rounded-lg border border-slate-200 bg-white p-4"
        onSubmit={(event) => {
          event.preventDefault()
          apply()
        }}
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[14rem] flex-1">
            <Input
              label="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Booking, customer, quotation, recovery, invoice…"
            />
          </div>
          <Button type="submit" loading={loading} className="gap-2">
            <FunnelIcon />
            Apply
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="gap-2"
            onClick={() => {
              setSearch('')
              apply('', tab)
            }}
          >
            <ArrowPathIcon />
            Reset
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-medium text-slate-900">
            {cycles.length} {tab === 'completed' ? 'completed' : 'in progress'} cycle
            {cycles.length === 1 ? '' : 's'}
          </p>
        </div>
        <Table scrollContainer={false}>
          <THead>
            <TR>
              <TH>Booking</TH>
              <TH>Customer</TH>
              {tab === 'in_progress' ? <TH>Next step</TH> : null}
              <TH>Quotation</TH>
              <TH>Invoice</TH>
              <TH>Recovery</TH>
              {tab === 'completed' ? <TH>Paid</TH> : null}
              <TH>Amount</TH>
            </TR>
          </THead>
          <TBody>
            {cycles.length === 0 ? (
              <TR>
                <TD colSpan={tab === 'completed' ? 7 : 7} className="py-10 text-center text-sm text-slate-500">
                  {tab === 'completed'
                    ? 'No completed workflow cycles match these filters.'
                    : 'No in-progress workflow cycles match these filters.'}
                </TD>
              </TR>
            ) : (
              cycles.map((row) => (
                <TR key={row.id} href={`/workflow-cycles/${row.id}${tab === 'completed' ? '?tab=completed' : ''}`}>
                  <TD>
                    <span className="font-medium text-slate-900">{row.bookingReference}</span>
                    <p className="mt-0.5 text-xs text-slate-500">{row.destination}</p>
                  </TD>
                  <TD className="text-slate-700">{row.customer}</TD>
                  {tab === 'in_progress' ? (
                    <TD>
                      {row.stageLabel ? (
                        <Badge tone="warning">{row.stageLabel}</Badge>
                      ) : (
                        '—'
                      )}
                    </TD>
                  ) : null}
                  <TD className="text-slate-600">
                    {row.quotationReference ? (
                      <>
                        <span className="font-medium text-slate-800">{row.quotationReference}</span>
                        {row.quotationStatusLabel ? (
                          <p className="mt-0.5 text-xs text-slate-500">{row.quotationStatusLabel}</p>
                        ) : null}
                      </>
                    ) : (
                      '—'
                    )}
                  </TD>
                  <TD className="text-slate-600">
                    {row.invoiceNumber ? (
                      <>
                        <span className="font-medium text-slate-800">{row.invoiceNumber}</span>
                        {row.invoiceStatusLabel ? (
                          <p className="mt-0.5 text-xs text-slate-500">{row.invoiceStatusLabel}</p>
                        ) : null}
                      </>
                    ) : (
                      '—'
                    )}
                  </TD>
                  <TD>
                    {row.recoveryReference ? (
                      <>
                        <span className="font-medium text-slate-800">{row.recoveryReference}</span>
                        {row.recoveryStatusLabel ? (
                          <p className="mt-0.5 text-xs text-slate-500">{row.recoveryStatusLabel}</p>
                        ) : null}
                      </>
                    ) : (
                      '—'
                    )}
                  </TD>
                  {tab === 'completed' ? (
                    <TD className="text-slate-600">{row.paidAt ?? '—'}</TD>
                  ) : null}
                  <TD className="font-medium text-slate-900">{row.amount}</TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </div>
    </div>
  )
}
