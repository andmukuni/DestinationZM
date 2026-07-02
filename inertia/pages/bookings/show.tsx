import { Form, Link } from '@adonisjs/inertia/react'
import { useState, type ReactNode } from 'react'
import { ArrowLeftIcon, CheckCircleIcon } from '~/components/icons'
import EnquiryDetailsCard from '~/components/portal/enquiry_details_card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { ConfirmSubmitButton } from '~/components/ui/confirm_submit_button'
import { Input } from '~/components/ui/input'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'
import { UserAvatar } from '~/components/ui/user_avatar'
import {
  brandButtonPrimaryClass,
  brandLinkClass,
  brandSurfaceAccentClass,
  brandSurfaceAccentMutedClass,
  brandSurfaceAccentTextClass,
  brandWorkflowActiveClass,
  brandWorkflowCompleteClass,
} from '~/lib/brand_theme'
import { formatCurrency, formatStatusLabel } from '~/lib/format'
import { statusTone } from '~/lib/status_tone'

type WorkflowStep = {
  id: string
  label: string
  actor: string
  status: 'pending' | 'active' | 'complete' | 'blocked'
  detail?: string
  href?: string
  action?: string
}

type BookingsShowProps = {
  booking: {
    id: number
    reference: string
    customer: { id: number; fullName: string } | null
    destination: string
    departDate: string
    returnDate: string | null
    pax: number | null
    status: string
    statusLabel: string
    totalAmount: number
    currency: string
    notes: string | null
    branch: string
    agent: string
    confirmedAt: string | null
    productType: string | null
    pnr: string | null
    travelerName: string | null
    itineraryService: string | null
    tripName: string | null
    tripReason: string | null
    costCenter: string | null
    dateRequested: string
    approvedBy: string | null
    generalLedgerAccount: string | null
    supplierId: number | null
    invoiceReceiptNumber: string | null
    dzPaymentStatus: string
    dzPaymentDate: string
    dzPaymentReference: string | null
    amountPaidByDz: number | null
    items: Array<{
      id: number
      description: string
      quantity: number
      unitPrice: number
      lineTotal: number
      supplier: string | null
    }>
    quotations: Array<{ id: number; reference: string; status: string; totalAmount: number }>
    invoices: Array<{ id: number; invoiceNumber: string; status: string; totalAmount: number }>
  }
  steps: WorkflowStep[]
  latestQuotation: { id: number; reference: string; status: string } | null
  latestRecoveryItem: { id: number; reference: string; status: string } | null
  latestInvoice: { id: number; invoiceNumber: string; status: string } | null
  suppliers: Array<{ id: number; name: string }>
  hasWorkflowCycle: boolean
  enquiryDetails: {
    typeName: string
    rows: Array<{ label: string; value: string }>
  } | null
  backOffice: {
    documentCount: number
    recoveryItemCount: number
    supplierItemCount: number
    showPanel: boolean
  }
  actions: {
    canCreateQuotation: boolean
    canSendQuotation: boolean
    canConfirmBooking: boolean
    canRecordSupplierPayment: boolean
    canSendRecoveryItem: boolean
    canCreateInvoice: boolean
    canIssueInvoice: boolean
    canManageBookings: boolean
  }
}

type TabId = 'workflow' | 'items' | 'quotations' | 'invoices'

type Milestone = {
  id: string
  label: string
  status: WorkflowStep['status']
}

function stepCircle(status: WorkflowStep['status']) {
  if (status === 'complete') return brandWorkflowCompleteClass
  if (status === 'active') return brandWorkflowActiveClass
  return 'border border-slate-200 bg-slate-50 text-slate-400'
}

function milestoneTone(status: WorkflowStep['status']) {
  if (status === 'complete') return brandWorkflowCompleteClass
  if (status === 'active') return `${brandWorkflowActiveClass} ring-4 ring-orange-50`
  return 'border border-slate-200 bg-white text-slate-400'
}

function milestoneLine(complete: boolean) {
  return complete ? 'bg-orange-600' : 'bg-slate-200'
}

function bookingInitials(booking: BookingsShowProps['booking']) {
  if (booking.customer?.fullName) {
    const parts = booking.customer.fullName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }

  const fromRef = booking.reference.replace(/[^A-Za-z0-9]/g, '').slice(0, 2)
  return fromRef.toUpperCase() || 'EN'
}

function FeedCard({
  title,
  description,
  action,
  children,
  className = '',
  bodyClassName = '',
}: {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {title ? (
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {description ? <p className="mt-0.5 text-sm text-slate-500">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={`p-4 sm:p-5 ${bodyClassName}`}>{children}</div>
    </div>
  )
}

function mergeStepStatus(
  ...statuses: Array<WorkflowStep['status'] | undefined>
): WorkflowStep['status'] {
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
    {
      id: 'invoice',
      label: 'Client invoice',
      status: byId.client_invoice?.status ?? 'pending',
    },
    {
      id: 'recovery',
      label: 'Recovery',
      status: mergeStepStatus(
        byId.recovery_report?.status,
        byId.client_recovery?.status,
        byId.recovered?.status
      ),
    },
    {
      id: 'paid',
      label: 'Paid',
      status: byId.client_payment?.status ?? 'pending',
    },
  ]
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  if (value == null || value === '') return null

  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-sm text-slate-500">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium text-slate-900">{value}</dd>
    </div>
  )
}

function WorkflowActions({
  bookingId,
  actions,
  latestQuotation,
  latestRecoveryItem,
  latestInvoice,
  layout = 'inline',
}: {
  bookingId: number
  actions: BookingsShowProps['actions']
  latestQuotation: BookingsShowProps['latestQuotation']
  latestRecoveryItem: BookingsShowProps['latestRecoveryItem']
  latestInvoice: BookingsShowProps['latestInvoice']
  layout?: 'inline' | 'stack'
}) {
  const buttons = (
    <>
      {actions.canCreateQuotation ? (
        <Form route="bookings.quotations.store" routeParams={{ id: bookingId }}>
          <ConfirmSubmitButton
            size="sm"
            title="Create quotation?"
            description="Create a draft quotation from this enquiry?"
            confirmLabel="Create quotation"
          >
            Create quotation
          </ConfirmSubmitButton>
        </Form>
      ) : null}
      {actions.canSendQuotation && latestQuotation ? (
        <Form route="quotations.send" routeParams={{ id: latestQuotation.id }}>
          <ConfirmSubmitButton
            size="sm"
            title="Send quotation?"
            description={`Send quotation ${latestQuotation.reference} to the client?`}
            confirmLabel="Send quotation"
          >
            Send quotation
          </ConfirmSubmitButton>
        </Form>
      ) : null}
      {actions.canSendRecoveryItem && latestRecoveryItem ? (
        <Form
          action={`/recovery-reports/items/${latestRecoveryItem.id}/send-to-client`}
          method="post"
        >
          <ConfirmSubmitButton
            size="sm"
            title="Send recovery report?"
            description="Send this recovery item to the client for review?"
            confirmLabel="Send to client"
          >
            Send recovery to client
          </ConfirmSubmitButton>
        </Form>
      ) : null}
      {actions.canCreateInvoice ? (
        <Form route="bookings.create_invoice" routeParams={{ id: bookingId }}>
          <ConfirmSubmitButton
            size="sm"
            title="Create client invoice?"
            description="Create a draft client invoice for this enquiry?"
            confirmLabel="Create invoice"
          >
            Create client invoice
          </ConfirmSubmitButton>
        </Form>
      ) : null}
      {actions.canIssueInvoice && latestInvoice ? (
        <Form route="invoices.issue" routeParams={{ id: latestInvoice.id }}>
          <ConfirmSubmitButton
            size="sm"
            title="Issue invoice?"
            description={`Issue invoice ${latestInvoice.invoiceNumber} to the client?`}
            confirmLabel="Issue invoice"
          >
            Issue invoice
          </ConfirmSubmitButton>
        </Form>
      ) : null}
    </>
  )

  const hasActions =
    actions.canCreateQuotation ||
    actions.canSendQuotation ||
    actions.canSendRecoveryItem ||
    actions.canCreateInvoice ||
    actions.canIssueInvoice

  if (!hasActions) return null

  return (
    <div className={layout === 'stack' ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2'}>
      {buttons}
    </div>
  )
}

export default function BookingsShow({
  booking,
  steps,
  actions,
  backOffice,
  latestQuotation,
  latestRecoveryItem,
  latestInvoice,
  suppliers,
  hasWorkflowCycle,
  enquiryDetails,
}: BookingsShowProps) {
  const [activeTab, setActiveTab] = useState<TabId>('workflow')
  const [showConfirmForm, setShowConfirmForm] = useState(actions.canConfirmBooking)
  const [showSupplierPaymentForm, setShowSupplierPaymentForm] = useState(
    actions.canRecordSupplierPayment
  )

  const milestones = buildMilestones(steps)
  const supplierName = suppliers.find((s) => s.id === booking.supplierId)?.name ?? null
  const showDzPayment =
    booking.dzPaymentStatus !== 'NOT_PAID' ||
    Boolean(booking.dzPaymentDate) ||
    Boolean(booking.dzPaymentReference) ||
    booking.amountPaidByDz != null

  const travelFields: Array<[string, string | null]> = [
    ['Product type', booking.productType],
    ['Traveler', booking.travelerName],
    ['PNR', booking.pnr],
    ['Itinerary / service', booking.itineraryService],
    ['Trip name', booking.tripName],
    ['Trip reason', booking.tripReason],
    ['Cost center', booking.costCenter],
    ['Approved by', booking.approvedBy],
    ['GL account', booking.generalLedgerAccount],
    ['Supplier', supplierName],
    ['Invoice / receipt', booking.invoiceReceiptNumber],
    ['Date requested', booking.dateRequested || null],
  ]
  const populatedTravelFields = travelFields.filter(([, value]) => Boolean(value))

  const tabs: Array<{ id: TabId; label: string; count?: number }> = [
    { id: 'workflow', label: 'Workflow' },
    { id: 'items', label: 'Items', count: booking.items.length },
    { id: 'quotations', label: 'Quotations', count: booking.quotations.length },
    { id: 'invoices', label: 'Invoices', count: booking.invoices.length },
  ]

  const hasHeaderActions =
    actions.canCreateQuotation ||
    actions.canSendQuotation ||
    actions.canSendRecoveryItem ||
    actions.canCreateInvoice ||
    actions.canIssueInvoice

  const metaChips = [
    booking.branch !== '—' ? booking.branch : null,
    booking.agent !== 'Unassigned' ? booking.agent : null,
    booking.pax != null ? `${booking.pax} pax` : null,
    booking.confirmedAt ? `Confirmed ${booking.confirmedAt}` : null,
  ].filter(Boolean)

  const avatarInitials = bookingInitials(booking)
  const dateRange = `${booking.departDate}${booking.returnDate ? ` – ${booking.returnDate}` : ''}`

  return (
    <div className="pb-8">
      <Link
        route="bookings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeftIcon />
        Back to enquiries
      </Link>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-32 overflow-hidden bg-slate-900 sm:h-40 md:h-44">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900 via-[#1a2744] to-slate-800"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-orange-600/25"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                'radial-gradient(circle at 85% 20%, rgba(234,88,12,0.4), transparent 45%), radial-gradient(circle at 10% 80%, rgba(51,65,85,0.55), transparent 40%)',
            }}
          />
        </div>

        <div className="relative px-4 pb-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
              <div className="-mt-10 shrink-0 sm:-mt-12">
                <div className="rounded-full ring-4 ring-white">
                  <UserAvatar
                    initials={avatarInitials}
                    title={booking.customer?.fullName ?? booking.reference}
                    className="h-20 w-20 text-xl sm:h-24 sm:w-24 sm:text-2xl"
                  />
                </div>
              </div>
              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {booking.reference}
                  </h1>
                  <Badge tone={statusTone(booking.status)}>{booking.statusLabel}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {booking.customer?.fullName ?? 'Unknown customer'} · {booking.destination}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">{dateRange}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  <span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(booking.totalAmount, booking.currency)}
                    </span>{' '}
                    total
                  </span>
                  {booking.pax != null ? (
                    <span>
                      <span className="font-semibold text-slate-900">{booking.pax}</span> pax
                    </span>
                  ) : null}
                  {booking.items.length > 0 ? (
                    <span>
                      <span className="font-semibold text-slate-900">{booking.items.length}</span>{' '}
                      items
                    </span>
                  ) : null}
                  {booking.quotations.length > 0 ? (
                    <span>
                      <span className="font-semibold text-slate-900">
                        {booking.quotations.length}
                      </span>{' '}
                      quotations
                    </span>
                  ) : null}
                </div>
                {metaChips.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {metaChips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            {hasWorkflowCycle ? (
              <Link href={`/workflow-cycles/${booking.id}`}>
                <Button variant="secondary" size="sm" className={brandButtonPrimaryClass}>
                  View full cycle
                </Button>
              </Link>
            ) : null}
            <WorkflowActions
              bookingId={booking.id}
              actions={actions}
              latestQuotation={latestQuotation}
              latestRecoveryItem={latestRecoveryItem}
              latestInvoice={latestInvoice}
            />
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 -mx-1 mt-6 border-b border-slate-200 bg-white/95 px-1 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <nav className="flex overflow-x-auto" aria-label="Enquiry sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'text-orange-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {tab.count !== undefined ? (
                <span
                  className={`ml-1.5 tabular-nums ${activeTab === tab.id ? 'text-orange-500' : 'text-slate-400'}`}
                >
                  {tab.count}
                </span>
              ) : null}
              {activeTab === tab.id ? (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-orange-600"
                  aria-hidden="true"
                />
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[16rem_minmax(0,1fr)_18rem]">
        <aside className="order-2 space-y-4 xl:order-1 xl:sticky xl:top-14 xl:self-start">
          <FeedCard title="About this enquiry">
            <dl className="space-y-3">
              <DetailRow
                label="Customer"
                value={
                  booking.customer ? (
                    <Link href={`/customers/${booking.customer.id}`} className={brandLinkClass}>
                      {booking.customer.fullName}
                    </Link>
                  ) : (
                    'Unknown'
                  )
                }
              />
              <DetailRow label="Destination" value={booking.destination} />
              <DetailRow label="Travel dates" value={dateRange} />
              <DetailRow label="Office" value={booking.branch} />
              <DetailRow label="Agent" value={booking.agent} />
              <DetailRow label="Pax" value={booking.pax != null ? String(booking.pax) : null} />
            </dl>
            {booking.notes ? (
              <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
                {booking.notes}
              </p>
            ) : null}
          </FeedCard>

          <FeedCard title="Progress">
            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex items-center gap-2.5">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${milestoneTone(milestone.status)}`}
                  >
                    {milestone.status === 'complete' ? (
                      <CheckCircleIcon className="h-3.5 w-3.5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`min-w-0 flex-1 truncate text-xs font-medium ${
                      milestone.status === 'pending' ? 'text-slate-400' : 'text-slate-700'
                    }`}
                  >
                    {milestone.label}
                  </span>
                  {index < milestones.length - 1 ? (
                    <div
                      className={`hidden h-px w-3 shrink-0 sm:block ${milestoneLine(milestone.status === 'complete')}`}
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </FeedCard>

          {(latestQuotation || latestRecoveryItem || latestInvoice) && (
            <FeedCard title="Linked records">
              <div className="space-y-2">
                {latestQuotation ? (
                  <Link
                    href={`/quotations/${latestQuotation.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 transition hover:border-orange-200 hover:bg-orange-50/50"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Quotation
                      </p>
                      <p className="mt-0.5 truncate text-sm font-medium text-slate-900">
                        {latestQuotation.reference}
                      </p>
                    </div>
                    <Badge tone={statusTone(latestQuotation.status)}>
                      {formatStatusLabel(latestQuotation.status)}
                    </Badge>
                  </Link>
                ) : null}
                {latestRecoveryItem ? (
                  <Link
                    href={`/recovery-reports/items/${latestRecoveryItem.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 transition hover:border-orange-200 hover:bg-orange-50/50"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Recovery
                      </p>
                      <p className="mt-0.5 truncate text-sm font-medium text-slate-900">
                        {latestRecoveryItem.reference}
                      </p>
                    </div>
                    <Badge tone={statusTone(latestRecoveryItem.status.toLowerCase())}>
                      {formatStatusLabel(latestRecoveryItem.status)}
                    </Badge>
                  </Link>
                ) : null}
                {latestInvoice ? (
                  <Link
                    href={`/invoices/${latestInvoice.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 transition hover:border-orange-200 hover:bg-orange-50/50"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Invoice
                      </p>
                      <p className="mt-0.5 truncate text-sm font-medium text-slate-900">
                        {latestInvoice.invoiceNumber}
                      </p>
                    </div>
                    <Badge tone={statusTone(latestInvoice.status)}>
                      {formatStatusLabel(latestInvoice.status)}
                    </Badge>
                  </Link>
                ) : null}
              </div>
            </FeedCard>
          )}
        </aside>

        <main className="order-1 min-w-0 space-y-4 xl:order-2">
          {activeTab === 'workflow' ? (
            <>
              {hasHeaderActions ? (
                <FeedCard title="Next steps" description="Actions available for this enquiry">
                  <WorkflowActions
                    bookingId={booking.id}
                    actions={actions}
                    latestQuotation={latestQuotation}
                    latestRecoveryItem={latestRecoveryItem}
                    latestInvoice={latestInvoice}
                    layout="stack"
                  />
                </FeedCard>
              ) : null}

              {actions.canConfirmBooking ? (
                <FeedCard
                  title="Confirm enquiry"
                  description="Capture travel and recovery metadata after the client approves the quotation."
                  className={brandSurfaceAccentClass}
                  action={
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowConfirmForm((v) => !v)}
                    >
                      {showConfirmForm ? 'Hide form' : 'Show form'}
                    </Button>
                  }
                  bodyClassName={brandSurfaceAccentTextClass}
                >
                  {showConfirmForm ? (
                    <Form
                      route="bookings.confirm"
                      routeParams={{ id: booking.id }}
                      className="space-y-4"
                    >
                      {({ errors }) => (
                        <>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                              label="Product type"
                              name="productType"
                              defaultValue={booking.productType ?? 'travel'}
                              error={errors.productType}
                            />
                            <Input
                              label="PNR"
                              name="pnr"
                              defaultValue={booking.pnr ?? ''}
                              error={errors.pnr}
                            />
                            <Input
                              label="Traveler name"
                              name="travelerName"
                              defaultValue={
                                booking.travelerName ?? booking.customer?.fullName ?? ''
                              }
                              error={errors.travelerName}
                            />
                            <Input
                              label="Itinerary / service"
                              name="itineraryService"
                              defaultValue={booking.itineraryService ?? booking.destination}
                              error={errors.itineraryService}
                            />
                            <Input
                              label="Trip name"
                              name="tripName"
                              defaultValue={booking.tripName ?? ''}
                              error={errors.tripName}
                            />
                            <Input
                              label="Trip reason"
                              name="tripReason"
                              defaultValue={booking.tripReason ?? ''}
                              error={errors.tripReason}
                            />
                            <Input
                              label="Cost center"
                              name="costCenter"
                              defaultValue={booking.costCenter ?? ''}
                              error={errors.costCenter}
                            />
                            <Input
                              label="Date requested"
                              name="dateRequested"
                              type="date"
                              defaultValue={booking.dateRequested}
                              error={errors.dateRequested}
                            />
                            <Input
                              label="Approved by"
                              name="approvedBy"
                              defaultValue={booking.approvedBy ?? ''}
                              error={errors.approvedBy}
                            />
                            <Input
                              label="General ledger account"
                              name="generalLedgerAccount"
                              defaultValue={booking.generalLedgerAccount ?? ''}
                              error={errors.generalLedgerAccount}
                            />
                            <div>
                              <label
                                htmlFor="supplierId"
                                className="mb-1 block text-sm font-medium text-slate-700"
                              >
                                Supplier
                              </label>
                              <select
                                id="supplierId"
                                name="supplierId"
                                defaultValue={booking.supplierId ?? ''}
                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                              >
                                <option value="">Select supplier</option>
                                {suppliers.map((supplier) => (
                                  <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <ConfirmSubmitButton
                            title="Confirm enquiry?"
                            description="Capture travel details and confirm this enquiry after client quotation approval?"
                            confirmLabel="Confirm enquiry"
                          >
                            Confirm enquiry
                          </ConfirmSubmitButton>
                        </>
                      )}
                    </Form>
                  ) : (
                    <p className={`text-sm ${brandSurfaceAccentMutedClass}`}>
                      Open the form to capture travel details and confirm this enquiry.
                    </p>
                  )}
                </FeedCard>
              ) : null}

              {actions.canRecordSupplierPayment ? (
                <FeedCard
                  title="Pay supplier"
                  description="DestinationZM pays the supplier first. Upload the supplier invoice and record payment before billing the client."
                  action={
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowSupplierPaymentForm((v) => !v)}
                    >
                      {showSupplierPaymentForm ? 'Hide form' : 'Show form'}
                    </Button>
                  }
                >
                  {showSupplierPaymentForm ? (
                    <Form
                      action={`/bookings/${booking.id}/record-supplier-payment`}
                      method="post"
                      encType="multipart/form-data"
                      className="space-y-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label="Supplier invoice / receipt #"
                          name="invoiceReceiptNumber"
                          defaultValue={booking.invoiceReceiptNumber ?? ''}
                          required
                        />
                        <Input
                          label="Payment date"
                          name="dzPaymentDate"
                          type="date"
                          defaultValue={booking.dzPaymentDate || undefined}
                        />
                        <Input
                          label="Payment reference"
                          name="dzPaymentReference"
                          defaultValue={booking.dzPaymentReference ?? ''}
                        />
                        <Input
                          label="Amount paid to supplier"
                          name="amountPaidByDz"
                          type="number"
                          step="0.01"
                          defaultValue={String(booking.amountPaidByDz ?? booking.totalAmount)}
                        />
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="supplierInvoice"
                            className="mb-1 block text-sm font-medium text-slate-700"
                          >
                            Supplier invoice file
                          </label>
                          <input
                            id="supplierInvoice"
                            type="file"
                            name="supplierInvoice"
                            accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                            className="block w-full text-sm"
                          />
                        </div>
                      </div>
                      <ConfirmSubmitButton
                        title="Record supplier payment?"
                        description="Record supplier payment and upload the supplier invoice?"
                        confirmLabel="Record payment"
                      >
                        Record supplier payment
                      </ConfirmSubmitButton>
                    </Form>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Open the form to record supplier payment and upload the invoice.
                    </p>
                  )}
                </FeedCard>
              ) : null}

              {steps.map((step, index) => (
                <FeedCard key={step.id} bodyClassName="py-4">
                  <div className="flex gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${stepCircle(step.status)}`}
                    >
                      {step.status === 'complete' ? (
                        <CheckCircleIcon className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                        <span className="text-xs uppercase tracking-wide text-slate-400">
                          {step.actor}
                        </span>
                        {step.status === 'active' ? (
                          <Badge tone="warning" className="text-[10px]">
                            In progress
                          </Badge>
                        ) : null}
                      </div>
                      {step.detail ? (
                        <p className="mt-1 text-sm text-slate-500">{step.detail}</p>
                      ) : null}
                      {step.href ? (
                        <Link href={step.href} className={`mt-2 inline-block ${brandLinkClass}`}>
                          View record →
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </FeedCard>
              ))}
            </>
          ) : null}

          {activeTab === 'items' ? (
            <FeedCard title="Line items" bodyClassName="p-0">
              {booking.items.length === 0 ? (
                <p className="px-5 py-8 text-sm text-slate-500">No line items on this enquiry.</p>
              ) : (
                <Table scrollContainer={false}>
                  <THead>
                    <TR>
                      <TH>Description</TH>
                      <TH>Supplier</TH>
                      <TH>Qty</TH>
                      <TH>Unit price</TH>
                      <TH>Line total</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {booking.items.map((item) => (
                      <TR key={item.id}>
                        <TD>{item.description}</TD>
                        <TD>{item.supplier ?? '—'}</TD>
                        <TD>{item.quantity}</TD>
                        <TD>{formatCurrency(item.unitPrice, booking.currency)}</TD>
                        <TD>{formatCurrency(item.lineTotal, booking.currency)}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              )}
            </FeedCard>
          ) : null}

          {activeTab === 'quotations' ? (
            <FeedCard title="Quotations" bodyClassName="p-0">
              {booking.quotations.length === 0 ? (
                <p className="px-5 py-8 text-sm text-slate-500">No quotations yet.</p>
              ) : (
                <Table scrollContainer={false}>
                  <THead>
                    <TR>
                      <TH>Reference</TH>
                      <TH>Status</TH>
                      <TH>Total</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {booking.quotations.map((q) => (
                      <TR key={q.id} href={`/quotations/${q.id}`}>
                        <TD className="font-medium text-slate-900">{q.reference}</TD>
                        <TD>
                          <Badge tone={statusTone(q.status)}>{formatStatusLabel(q.status)}</Badge>
                        </TD>
                        <TD>{formatCurrency(q.totalAmount, booking.currency)}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              )}
            </FeedCard>
          ) : null}

          {activeTab === 'invoices' ? (
            <FeedCard title="Invoices" bodyClassName="p-0">
              {booking.invoices.length === 0 ? (
                <p className="px-5 py-8 text-sm text-slate-500">No invoices yet.</p>
              ) : (
                <Table scrollContainer={false}>
                  <THead>
                    <TR>
                      <TH>Invoice</TH>
                      <TH>Status</TH>
                      <TH>Total</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {booking.invoices.map((inv) => (
                      <TR key={inv.id} href={`/invoices/${inv.id}`}>
                        <TD className="font-medium text-slate-900">{inv.invoiceNumber}</TD>
                        <TD>
                          <Badge tone={statusTone(inv.status)}>
                            {formatStatusLabel(inv.status)}
                          </Badge>
                        </TD>
                        <TD>{formatCurrency(inv.totalAmount, booking.currency)}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              )}
            </FeedCard>
          ) : null}
        </main>

        <aside className="order-3 space-y-4 xl:sticky xl:top-14 xl:self-start">
          {enquiryDetails ? (
            <EnquiryDetailsCard
              typeName={enquiryDetails.typeName}
              rows={enquiryDetails.rows}
              compact
            />
          ) : null}

          {populatedTravelFields.length > 0 || showDzPayment ? (
            <FeedCard title="Travel & recovery">
              {populatedTravelFields.length > 0 ? (
                <dl className="space-y-3">
                  {populatedTravelFields.map(([label, value]) => (
                    <DetailRow key={label} label={label} value={value} />
                  ))}
                </dl>
              ) : null}

              {showDzPayment ? (
                <div
                  className={
                    populatedTravelFields.length > 0 ? 'mt-4 border-t border-slate-100 pt-4' : ''
                  }
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    DZ payment
                  </p>
                  <dl className="mt-3 space-y-3">
                    <DetailRow label="Status" value={formatStatusLabel(booking.dzPaymentStatus)} />
                    <DetailRow label="Date" value={booking.dzPaymentDate || null} />
                    <DetailRow label="Reference" value={booking.dzPaymentReference} />
                    <DetailRow
                      label="Amount paid"
                      value={
                        booking.amountPaidByDz != null
                          ? formatCurrency(booking.amountPaidByDz, booking.currency)
                          : null
                      }
                    />
                  </dl>
                </div>
              ) : null}
            </FeedCard>
          ) : null}

          {backOffice.showPanel ? (
            <FeedCard title="Back-office">
              <dl className="grid gap-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Supplier items
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">
                    {backOffice.supplierItemCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Documents
                  </dt>
                  <dd className="mt-1">
                    <Link href="/documents" className={brandLinkClass}>
                      {backOffice.documentCount} linked
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Recovery report
                  </dt>
                  <dd className="mt-1">
                    {latestRecoveryItem ? (
                      <Link
                        href={`/recovery-reports/items/${latestRecoveryItem.id}`}
                        className={brandLinkClass}
                      >
                        View item
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-slate-900">—</span>
                    )}
                  </dd>
                </div>
              </dl>
            </FeedCard>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
