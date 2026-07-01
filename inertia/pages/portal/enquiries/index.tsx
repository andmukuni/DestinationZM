import { useState } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { EyeIcon, FunnelIcon, PlusIcon } from '~/components/icons'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardBody } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Table, TBody, TD, TH, THead, TR } from '~/components/ui/table'
import { portalTableIconPrimaryClass } from '~/lib/portal_theme'
import { TableActions, tableIconButtonClass } from '~/components/ui/table_icon_button'
import { useRouterLoading } from '~/hooks/use_router_loading'
import { stopRowClickProps } from '~/lib/table_row'

type EnquiryRow = {
  id: number
  reference: string
  destination: string
  productType: string | null
  departDate: string
  returnDate: string | null
  travelDates: string
  pax: number
  createdAt: string
  status: string
  statusLabel: string
  statusTone: 'pending' | 'quoted' | 'approved'
  quotationId: number | null
  itemCount: number
  servicesLabel: string
}

type PortalEnquiryStatusFilter = 'all' | 'pending' | 'quoted' | 'approved'

type PortalEnquiriesIndexProps = {
  pageTitle?: string
  pageDescription?: string
  canCreateBooking: boolean
  filters: {
    search: string
    status: PortalEnquiryStatusFilter
  }
  enquiries: EnquiryRow[]
}

const STATUS_TABS: Array<{ id: PortalEnquiryStatusFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Under review' },
  { id: 'quoted', label: 'Quotation added' },
  { id: 'approved', label: 'Quotation approved' },
]

const toneToBadge: Record<EnquiryRow['statusTone'], 'warning' | 'info' | 'success'> = {
  pending: 'warning',
  quoted: 'info',
  approved: 'success',
}

function buildEnquiriesUrl(status: PortalEnquiryStatusFilter, search: string) {
  const params = new URLSearchParams()
  if (status !== 'all') {
    params.set('status', status)
  }
  if (search.trim()) {
    params.set('search', search.trim())
  }
  const query = params.toString()
  return query ? `/portal/enquiries?${query}` : '/portal/enquiries'
}

export default function PortalEnquiriesIndex({
  canCreateBooking,
  filters,
  enquiries,
}: PortalEnquiriesIndexProps) {
  const [search, setSearch] = useState(filters.search)
  const { loading, get } = useRouterLoading()
  const hasActiveFilters = filters.status !== 'all' || filters.search.trim().length > 0

  function apply(status: PortalEnquiryStatusFilter = filters.status) {
    get(buildEnquiriesUrl(status, search))
  }

  function clearFilters() {
    setSearch('')
    get('/portal/enquiries')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-600">
            Submitted enquiries awaiting a quotation from DestinationZM.
          </p>
        </div>
        {canCreateBooking ? (
          <Link route="portal.bookings.create">
            <Button className="inline-flex items-center gap-1.5">
              <PlusIcon className="h-4 w-4" />
              New enquiry
            </Button>
          </Link>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => apply(tab.id)}
            className={[
              'rounded-full px-3 py-1.5 text-sm font-medium transition',
              filters.status === tab.id
                ? 'bg-orange-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="min-w-[12rem] flex-1">
          <Input
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                apply()
              }
            }}
            placeholder="Reference, destination, or service type…"
          />
        </div>
        <Button loading={loading} onClick={() => apply()} className="gap-2">
          <FunnelIcon className="h-4 w-4" />
          Apply
        </Button>
        {hasActiveFilters ? (
          <Button variant="secondary" loading={loading} onClick={clearFilters}>
            Clear
          </Button>
        ) : null}
      </div>

      <Card className="overflow-hidden">
        {enquiries.length === 0 ? (
          <CardBody>
            {hasActiveFilters ? (
              <>
                <p className="text-sm text-slate-600">No enquiries match your filters.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 text-sm font-medium text-orange-600 hover:underline"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">You don&apos;t have any open enquiries.</p>
                {canCreateBooking ? (
                  <Link
                    route="portal.bookings.create"
                    className="mt-3 inline-block text-sm font-medium text-orange-600 hover:underline"
                  >
                    Submit your first enquiry
                  </Link>
                ) : null}
              </>
            )}
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <Table scrollContainer={false} className="w-full min-w-[920px]">
              <THead>
                <TR>
                  <TH>Reference</TH>
                  <TH>Destination</TH>
                  <TH>Travel dates</TH>
                  <TH>Travellers</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {enquiries.map((enquiry) => (
                  <TR key={enquiry.id} href={`/portal/enquiries/${enquiry.id}`}>
                    <TD className="font-medium text-slate-900">
                      <div>{enquiry.reference}</div>
                      <div className="text-xs text-slate-500">Submitted {enquiry.createdAt}</div>
                    </TD>
                    <TD>
                      <div className="font-medium text-slate-900">{enquiry.destination}</div>
                      <div className="text-xs text-slate-500">{enquiry.servicesLabel}</div>
                    </TD>
                    <TD className="text-slate-700">{enquiry.travelDates}</TD>
                    <TD className="text-slate-700">
                      {enquiry.pax} {enquiry.pax === 1 ? 'person' : 'people'}
                    </TD>
                    <TD>
                      <Badge tone={toneToBadge[enquiry.statusTone]}>{enquiry.statusLabel}</Badge>
                    </TD>
                    <TD className="text-right" {...stopRowClickProps}>
                      <TableActions>
                        {enquiry.quotationId ? (
                          <Link
                            route="portal.quotations.show"
                            routeParams={{ id: enquiry.quotationId }}
                            className={portalTableIconPrimaryClass}
                            title="View quotation"
                            aria-label="View quotation"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                        ) : (
                          <Link
                            route="portal.enquiries.show"
                            routeParams={{ id: enquiry.id }}
                            className={tableIconButtonClass('secondary')}
                            title="View enquiry"
                            aria-label="View enquiry"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                        )}
                      </TableActions>
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
