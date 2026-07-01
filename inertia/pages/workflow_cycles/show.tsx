import { Link } from '@adonisjs/inertia/react'
import { type ReactNode } from 'react'
import { CheckCircleIcon } from '~/components/icons'
import RecoveryTravelItemsTable, {
  type RecoveryTravelItemRow,
} from '~/components/recovery_travel_items_table'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { brandLinkClassSm } from '~/lib/brand_theme'
import { statusTone } from '~/lib/status_tone'

type WorkflowStep = {
  id: string
  label: string
  actor: string
  status: 'pending' | 'active' | 'complete' | 'blocked'
  detail?: string
  href?: string
}

type CycleDetail = {
  id: number
  bookingReference: string
  customer: string
  destination: string
  enquiryDate: string
  departDate: string
  returnDate: string | null
  pax: number | null
  branch: string
  agent: string
  amount: string
  isComplete: boolean
  nextStep: string | null
  supplierPaid: boolean
  supplierPaidAt: string | null
  supplierAmount: string | null
  supplierReference: string | null
  quotationId: number | null
  quotationReference: string | null
  quotationStatusLabel: string | null
  invoiceId: number | null
  invoiceNumber: string | null
  invoiceStatusLabel: string | null
  recoveryItemId: number | null
  recoveryReference: string | null
  recoveryStatusLabel: string | null
  paidAt: string | null
  bookingStatus: string
  bookingStatusLabel: string
}

type TravelDetails = {
  productType: string | null
  travelerName: string | null
  pnr: string | null
  itineraryService: string | null
  tripName: string | null
  tripReason: string | null
  costCenter: string | null
  generalLedgerAccount: string | null
  approvedBy: string | null
  dateRequested: string | null
  confirmedAt: string | null
}

type WorkflowCyclesShowProps = {
  pageTitle?: string
  pageDescription?: string
  cycle: CycleDetail
  steps: WorkflowStep[]
  listTab: 'in_progress' | 'completed'
  initialStage: string | null
  travelDetails: TravelDetails
  travelItemsTable: {
    displayColumns: string[]
    rows: RecoveryTravelItemRow[]
    totalPrice: number
    currentItemId: number
  } | null
  canManageBookings: boolean
}

type Milestone = {
  id: string
  label: string
  status: WorkflowStep['status']
}

const VALID_STAGES = new Set([
  'enquiry',
  'quotation',
  'confirmed',
  'supplier',
  'invoice',
  'recovery',
  'paid',
])

function mergeStepStatus(...statuses: Array<WorkflowStep['status'] | undefined>): WorkflowStep['status'] {
  if (statuses.some((s) => s === 'active')) return 'active'
  if (statuses.every((s) => s === 'complete')) return 'complete'
  if (statuses.some((s) => s === 'complete')) return 'active'
  if (statuses.some((s) => s === 'blocked')) return 'blocked'
  return 'pending'
}

function buildMilestones(steps: WorkflowStep[]): Milestone[] {
  const byId = Object.fromEntries(steps.map((step) => [step.id, step]))

  return [
    { id: 'enquiry', label: 'Enquiry', status: byId.enquiry?.status ?? 'pending' },
    {
      id: 'quotation',
      label: 'Quotation',
      status: mergeStepStatus(byId.quotation?.status, byId.client_quotation?.status),
    },
    { id: 'confirmed', label: 'Confirmed', status: byId.booking_confirmed?.status ?? 'pending' },
    { id: 'supplier', label: 'Supplier paid', status: byId.supplier_payment?.status ?? 'pending' },
    { id: 'invoice', label: 'Client invoice', status: byId.client_invoice?.status ?? 'pending' },
    {
      id: 'recovery',
      label: 'Recovery',
      status: mergeStepStatus(
        byId.recovery_report?.status,
        byId.client_recovery?.status,
        byId.recovered?.status
      ),
    },
    { id: 'paid', label: 'Paid', status: byId.client_payment?.status ?? 'pending' },
  ]
}

function resolveInitialTab(milestones: Milestone[], initialStage: string | null): string {
  if (initialStage && VALID_STAGES.has(initialStage)) {
    return initialStage
  }
  const incomplete = milestones.find((milestone) => milestone.status !== 'complete')
  return incomplete?.id ?? 'paid'
}

function isMilestonePassed(
  milestones: Milestone[],
  index: number,
  cycle: CycleDetail,
  travelDetails: TravelDetails
): boolean {
  const milestone = milestones[index]
  if (milestone.status === 'complete') return true
  if (milestones.slice(index + 1).some((later) => later.status === 'complete')) return true

  if (milestone.id === 'confirmed') {
    return Boolean(travelDetails.confirmedAt)
  }
  if (milestone.id === 'supplier') {
    return cycle.supplierPaid
  }

  return false
}

function DetailGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
  )
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-0.5 text-sm text-slate-900">{value ?? '—'}</div>
    </div>
  )
}

function StagePanel({
  milestone,
  children,
  viewMore,
}: {
  milestone: Milestone
  children: ReactNode
  viewMore?: { href: string; label: string } | null
}) {
  return (
    <div className="space-y-3">
      <Badge tone={statusTone(milestone.status)} className="capitalize">
        {milestone.status}
      </Badge>
      {children}
      {viewMore ? (
        <div className="border-t border-slate-100 pt-3">
          <Link
            href={viewMore.href}
            className={`inline-flex items-center gap-1.5 ${brandLinkClassSm}`}
          >
            {viewMore.label}
            <span aria-hidden>→</span>
          </Link>
        </div>
      ) : null}
    </div>
  )
}

function stageViewMore(milestoneId: string, cycle: CycleDetail): { href: string; label: string } | null {
  const bookingHref = `/bookings/${cycle.id}`

  switch (milestoneId) {
    case 'enquiry':
      return { href: bookingHref, label: 'View enquiry workspace' }
    case 'quotation':
      return cycle.quotationId
        ? { href: `/quotations/${cycle.quotationId}`, label: 'View quotation' }
        : { href: bookingHref, label: 'Open enquiry to create quotation' }
    case 'confirmed':
      return { href: bookingHref, label: 'View enquiry workspace' }
    case 'supplier':
      return { href: bookingHref, label: 'View supplier payment in enquiry workspace' }
    case 'invoice':
      return cycle.invoiceId
        ? { href: `/invoices/${cycle.invoiceId}`, label: 'View invoice' }
        : { href: bookingHref, label: 'Open enquiry to issue invoice' }
    case 'recovery':
      return cycle.recoveryItemId
        ? {
            href: `/recovery-reports/items/${cycle.recoveryItemId}`,
            label: 'View full recovery report',
          }
        : null
    case 'paid':
      return cycle.invoiceId
        ? { href: `/invoices/${cycle.invoiceId}`, label: 'View invoice & payment' }
        : null
    default:
      return null
  }
}

export default function WorkflowCyclesShow({
  cycle,
  steps,
  listTab,
  initialStage,
  travelDetails,
  travelItemsTable,
  canManageBookings,
}: WorkflowCyclesShowProps) {
  const milestones = buildMilestones(steps)
  const listHref = listTab === 'completed' ? '/workflow-cycles?tab=completed' : '/workflow-cycles'
  const defaultTab = resolveInitialTab(milestones, initialStage)

  const milestoneById = Object.fromEntries(milestones.map((milestone) => [milestone.id, milestone]))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={listHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back to full cycles
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {cycle.bookingReference}
            </h1>
            <Badge tone={cycle.isComplete ? 'success' : 'warning'}>
              {cycle.isComplete ? 'Completed cycle' : 'In progress'}
            </Badge>
            {!cycle.isComplete && cycle.nextStep ? (
              <Badge tone="info">Next: {cycle.nextStep}</Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {cycle.customer} · {cycle.destination}
          </p>
        </div>
        {canManageBookings ? (
          <Link href={`/bookings/${cycle.id}`}>
            <Button>Open enquiry workspace</Button>
          </Link>
        ) : null}
      </div>

      <Tabs defaultTab={defaultTab}>
        <Card>
          <CardHeader title="Workflow" description="Read-only view of each stage in the full cycle" />
          <CardBody className="space-y-4">
            <TabsList className="w-full">
              {milestones.map((milestone, index) => (
                <TabsTrigger key={milestone.id} id={milestone.id}>
                  <span className="inline-flex items-center gap-1.5">
                    {isMilestonePassed(milestones, index, cycle, travelDetails) ? (
                      <CheckCircleIcon className="h-4 w-4 shrink-0 text-orange-600" aria-hidden />
                    ) : null}
                    {milestone.label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent id="enquiry" className="pt-3">
              <StagePanel milestone={milestoneById.enquiry} viewMore={stageViewMore('enquiry', cycle)}>
                <DetailGrid>
                  <DetailField label="Customer" value={cycle.customer} />
                  <DetailField label="Destination" value={cycle.destination} />
                  <DetailField label="Enquiry date" value={cycle.enquiryDate} />
                  <DetailField label="Departure" value={cycle.departDate} />
                  <DetailField label="Return" value={cycle.returnDate} />
                  <DetailField label="Passengers" value={cycle.pax} />
                  <DetailField label="Branch" value={cycle.branch} />
                  <DetailField label="Agent" value={cycle.agent} />
                  <DetailField label="Enquiry status" value={cycle.bookingStatusLabel} />
                </DetailGrid>
              </StagePanel>
            </TabsContent>

            <TabsContent id="quotation" className="pt-3">
              <StagePanel milestone={milestoneById.quotation} viewMore={stageViewMore('quotation', cycle)}>
                {cycle.quotationId ? (
                  <DetailGrid>
                    <DetailField label="Reference" value={cycle.quotationReference} />
                    <DetailField label="Status" value={cycle.quotationStatusLabel} />
                  </DetailGrid>
                ) : (
                  <p className="text-sm text-slate-500">No quotation yet</p>
                )}
              </StagePanel>
            </TabsContent>

            <TabsContent id="confirmed" className="pt-3">
              <StagePanel milestone={milestoneById.confirmed} viewMore={stageViewMore('confirmed', cycle)}>
                <DetailGrid>
                  <DetailField label="Confirmed at" value={travelDetails.confirmedAt} />
                  <DetailField label="Product type" value={travelDetails.productType} />
                  <DetailField label="Traveler" value={travelDetails.travelerName} />
                  <DetailField label="PNR" value={travelDetails.pnr} />
                  <DetailField label="Itinerary / service" value={travelDetails.itineraryService} />
                  <DetailField label="Trip name" value={travelDetails.tripName} />
                  <DetailField label="Trip reason" value={travelDetails.tripReason} />
                  <DetailField label="Cost center" value={travelDetails.costCenter} />
                  <DetailField label="General ledger" value={travelDetails.generalLedgerAccount} />
                  <DetailField label="Approved by" value={travelDetails.approvedBy} />
                  <DetailField label="Date requested" value={travelDetails.dateRequested} />
                </DetailGrid>
              </StagePanel>
            </TabsContent>

            <TabsContent id="supplier" className="pt-3">
              <StagePanel milestone={milestoneById.supplier} viewMore={stageViewMore('supplier', cycle)}>
                {cycle.supplierPaid ? (
                  <DetailGrid>
                    <DetailField label="Status" value="Paid to supplier" />
                    <DetailField label="Amount" value={cycle.supplierAmount} />
                    <DetailField label="Paid on" value={cycle.supplierPaidAt} />
                    <DetailField label="Reference" value={cycle.supplierReference} />
                  </DetailGrid>
                ) : (
                  <p className="text-sm text-slate-500">
                    Supplier payment not recorded yet. Use the enquiry workspace to upload the supplier
                    invoice and record payment.
                  </p>
                )}
              </StagePanel>
            </TabsContent>

            <TabsContent id="invoice" className="pt-3">
              <StagePanel milestone={milestoneById.invoice} viewMore={stageViewMore('invoice', cycle)}>
                {cycle.invoiceId ? (
                  <DetailGrid>
                    <DetailField label="Invoice number" value={cycle.invoiceNumber} />
                    <DetailField label="Status" value={cycle.invoiceStatusLabel} />
                    <DetailField label="Amount" value={cycle.amount} />
                  </DetailGrid>
                ) : (
                  <p className="text-sm text-slate-500">Client invoice not issued yet</p>
                )}
              </StagePanel>
            </TabsContent>

            <TabsContent id="recovery" className="pt-3">
              <StagePanel milestone={milestoneById.recovery} viewMore={stageViewMore('recovery', cycle)}>
                {cycle.recoveryItemId ? (
                  <DetailGrid>
                    <DetailField label="Reference" value={cycle.recoveryReference} />
                    <DetailField label="Status" value={cycle.recoveryStatusLabel} />
                  </DetailGrid>
                ) : (
                  <p className="text-sm text-slate-500">
                    Recovery report is auto-created when the client invoice is issued
                  </p>
                )}

                {travelItemsTable ? (
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <RecoveryTravelItemsTable
                      columns={travelItemsTable.displayColumns}
                      rows={travelItemsTable.rows}
                      totalPrice={travelItemsTable.totalPrice}
                      currentItemId={travelItemsTable.currentItemId}
                      rowHref={
                        travelItemsTable.rows.length > 1
                          ? (row) => `/recovery-reports/items/${row.id}`
                          : undefined
                      }
                    />
                  </div>
                ) : null}
              </StagePanel>
            </TabsContent>

            <TabsContent id="paid" className="pt-3">
              <StagePanel milestone={milestoneById.paid} viewMore={stageViewMore('paid', cycle)}>
                <DetailGrid>
                  <DetailField label="Invoice status" value={cycle.invoiceStatusLabel} />
                  <DetailField label="Paid on" value={cycle.paidAt} />
                  <DetailField label="Amount" value={cycle.amount} />
                  <DetailField
                    label="Recovery"
                    value={
                      cycle.recoveryStatusLabel ? (
                        <Badge tone={cycle.isComplete ? 'success' : 'warning'}>
                          {cycle.recoveryStatusLabel}
                        </Badge>
                      ) : (
                        '—'
                      )
                    }
                  />
                </DetailGrid>
              </StagePanel>
            </TabsContent>
          </CardBody>
        </Card>
      </Tabs>
    </div>
  )
}
