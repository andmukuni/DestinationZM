import { Form, Link } from '@adonisjs/inertia/react'
import { useState, type ReactNode } from 'react'
import { ArrowLeftIcon, CheckCircleIcon } from '~/components/icons'
import EnquiryDetailsCard from '~/components/portal/enquiry_details_card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { ConfirmSubmitButton } from '~/components/ui/confirm_submit_button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'
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
  if (status === 'complete') return 'bg-slate-900 text-white'
  if (status === 'active') return 'border-2 border-slate-900 bg-white text-slate-900'
  return 'border border-slate-200 bg-slate-50 text-slate-400'
}

function milestoneTone(status: WorkflowStep['status']) {
  if (status === 'complete') return 'bg-slate-900 text-white'
  if (status === 'active') return 'border-2 border-slate-900 bg-white text-slate-900 ring-4 ring-slate-100'
  return 'border border-slate-200 bg-white text-slate-400'
}

function milestoneLine(complete: boolean) {
  return complete ? 'bg-slate-900' : 'bg-slate-200'
}

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
        <Form action={`/recovery-reports/items/${latestRecoveryItem.id}/send-to-client`} method="post">
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
  const [showSupplierPaymentForm, setShowSupplierPaymentForm] = useState(actions.canRecordSupplierPayment)

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            route="bookings"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeftIcon />
            Back to enquiries
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{booking.reference}</h1>
            <Badge tone={statusTone(booking.status)}>{booking.statusLabel}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {booking.customer?.fullName ?? 'Unknown customer'} · {booking.destination} ·{' '}
            {booking.departDate}
            {booking.returnDate ? ` – ${booking.returnDate}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasWorkflowCycle ? (
            <Link href={`/workflow-cycles/${booking.id}`}>
              <Button variant="secondary">View full cycle</Button>
            </Link>
          ) : null}
          {hasHeaderActions ? (
            <WorkflowActions
              bookingId={booking.id}
              actions={actions}
              latestQuotation={latestQuotation}
              latestRecoveryItem={latestRecoveryItem}
              latestInvoice={latestInvoice}
            />
          ) : null}
        </div>
      </div>

      <Card>
        <CardBody className="py-5">
          <div className="flex items-center">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className={`flex items-center ${index < milestones.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${milestoneTone(milestone.status)}`}
                  >
                    {milestone.status === 'complete' ? <CheckCircleIcon className="h-4 w-4" /> : index + 1}
                  </div>
                  <span
                    className={`text-xs font-medium ${milestone.status === 'pending' ? 'text-slate-400' : 'text-slate-700'}`}
                  >
                    {milestone.label}
                  </span>
                </div>
                {index < milestones.length - 1 ? (
                  <div className={`mx-2 mb-5 h-0.5 flex-1 ${milestoneLine(milestone.status === 'complete')}`} />
                ) : null}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="border-b border-slate-200 px-6">
              <nav className="-mb-px flex gap-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 border-b-2 py-3 text-sm font-medium ${
                      activeTab === tab.id
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== undefined ? (
                      <span className="ml-1.5 text-slate-400">({tab.count})</span>
                    ) : null}
                  </button>
                ))}
              </nav>
            </div>

            {activeTab === 'workflow' ? (
              <CardBody className="space-y-6">
                {actions.canConfirmBooking ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-amber-950">Confirm enquiry</h3>
                        <p className="mt-1 text-sm text-amber-900/80">
                          Capture travel and recovery metadata after the client approves the quotation.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setShowConfirmForm((v) => !v)}
                      >
                        {showConfirmForm ? 'Hide form' : 'Show form'}
                      </Button>
                    </div>
                    {showConfirmForm ? (
                      <Form
                        route="bookings.confirm"
                        routeParams={{ id: booking.id }}
                        className="mt-4 space-y-4"
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
                              <Input label="PNR" name="pnr" defaultValue={booking.pnr ?? ''} error={errors.pnr} />
                              <Input
                                label="Traveler name"
                                name="travelerName"
                                defaultValue={booking.travelerName ?? booking.customer?.fullName ?? ''}
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
                                <label htmlFor="supplierId" className="mb-1 block text-sm font-medium text-slate-700">
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
                    ) : null}
                  </div>
                ) : null}

                {actions.canRecordSupplierPayment ? (
                  <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-sky-950">Pay supplier</h3>
                        <p className="mt-1 text-sm text-sky-900/80">
                          DestinationZM pays the supplier first. Upload the supplier invoice and record payment
                          before billing the client.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setShowSupplierPaymentForm((v) => !v)}
                      >
                        {showSupplierPaymentForm ? 'Hide form' : 'Show form'}
                      </Button>
                    </div>
                    {showSupplierPaymentForm ? (
                      <Form
                        action={`/bookings/${booking.id}/record-supplier-payment`}
                        method="post"
                        encType="multipart/form-data"
                        className="mt-4 space-y-4"
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
                            <label htmlFor="supplierInvoice" className="mb-1 block text-sm font-medium text-slate-700">
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
                    ) : null}
                  </div>
                ) : null}

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Workflow steps</h3>
                  <ol className="relative mt-4 space-y-0">
                    {steps.map((step, index) => (
                      <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
                        {index < steps.length - 1 ? (
                          <span
                            className={`absolute left-4 top-8 h-[calc(100%-1rem)] w-px -translate-x-1/2 ${
                              step.status === 'complete' ? 'bg-slate-900' : 'bg-slate-200'
                            }`}
                            aria-hidden
                          />
                        ) : null}
                        <div
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${stepCircle(step.status)}`}
                        >
                          {step.status === 'complete' ? (
                            <CheckCircleIcon className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-slate-900">{step.label}</p>
                            <span className="text-xs uppercase tracking-wide text-slate-400">{step.actor}</span>
                            {step.status === 'active' ? (
                              <Badge tone="warning" className="text-[10px]">
                                In progress
                              </Badge>
                            ) : null}
                          </div>
                          {step.detail ? (
                            <p className="mt-0.5 text-sm text-slate-500">{step.detail}</p>
                          ) : null}
                          {step.href ? (
                            <Link
                              href={step.href}
                              className="mt-1 inline-block text-sm font-medium text-slate-900 hover:underline"
                            >
                              View record →
                            </Link>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {backOffice.showPanel ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Back-office</h3>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Supplier items
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-900">
                          {backOffice.supplierItemCount}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Documents</dt>
                        <dd className="mt-1">
                          <Link href="/documents" className="text-sm font-medium text-slate-900 hover:underline">
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
                              className="text-sm font-medium text-slate-900 hover:underline"
                            >
                              View item
                            </Link>
                          ) : (
                            <span className="text-sm font-medium text-slate-900">—</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ) : null}
              </CardBody>
            ) : null}

            {activeTab === 'items' ? (
              <CardBody className="p-0">
                {booking.items.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-slate-500">No line items on this enquiry.</p>
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
              </CardBody>
            ) : null}

            {activeTab === 'quotations' ? (
              <CardBody className="p-0">
                {booking.quotations.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-slate-500">No quotations yet.</p>
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
              </CardBody>
            ) : null}

            {activeTab === 'invoices' ? (
              <CardBody className="p-0">
                {booking.invoices.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-slate-500">No invoices yet.</p>
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
                            <Badge tone={statusTone(inv.status)}>{formatStatusLabel(inv.status)}</Badge>
                          </TD>
                          <TD>{formatCurrency(inv.totalAmount, booking.currency)}</TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                )}
              </CardBody>
            ) : null}
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          {enquiryDetails ? (
            <EnquiryDetailsCard typeName={enquiryDetails.typeName} rows={enquiryDetails.rows} />
          ) : null}

          <Card>
            <CardHeader title="Enquiry summary" />
            <CardBody className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {formatCurrency(booking.totalAmount, booking.currency)}
                </p>
              </div>
              <dl className="space-y-3 border-t border-slate-100 pt-4">
                <DetailRow
                  label="Customer"
                  value={
                    booking.customer ? (
                      <Link
                        href={`/customers/${booking.customer.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {booking.customer.fullName}
                      </Link>
                    ) : (
                      'Unknown'
                    )
                  }
                />
                <DetailRow label="Office" value={booking.branch} />
                <DetailRow label="Agent" value={booking.agent} />
                <DetailRow label="Pax" value={booking.pax != null ? String(booking.pax) : null} />
                <DetailRow
                  label="Travel dates"
                  value={`${booking.departDate}${booking.returnDate ? ` – ${booking.returnDate}` : ''}`}
                />
                <DetailRow label="Confirmed" value={booking.confirmedAt} />
              </dl>
              {booking.notes ? (
                <p className="border-t border-slate-100 pt-4 text-sm text-slate-600">{booking.notes}</p>
              ) : null}
            </CardBody>
          </Card>

          {(latestQuotation || latestRecoveryItem || latestInvoice) && (
            <Card>
              <CardHeader title="Linked records" />
              <CardBody className="space-y-3">
                {latestQuotation ? (
                  <Link
                    href={`/quotations/${latestQuotation.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 transition hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Quotation</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-900">{latestQuotation.reference}</p>
                    </div>
                    <Badge tone={statusTone(latestQuotation.status)}>
                      {formatStatusLabel(latestQuotation.status)}
                    </Badge>
                  </Link>
                ) : null}
                {latestRecoveryItem ? (
                  <Link
                    href={`/recovery-reports/items/${latestRecoveryItem.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 transition hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Recovery</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-900">{latestRecoveryItem.reference}</p>
                    </div>
                    <Badge tone={statusTone(latestRecoveryItem.status.toLowerCase())}>
                      {formatStatusLabel(latestRecoveryItem.status)}
                    </Badge>
                  </Link>
                ) : null}
                {latestInvoice ? (
                  <Link
                    href={`/invoices/${latestInvoice.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 transition hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Invoice</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-900">{latestInvoice.invoiceNumber}</p>
                    </div>
                    <Badge tone={statusTone(latestInvoice.status)}>
                      {formatStatusLabel(latestInvoice.status)}
                    </Badge>
                  </Link>
                ) : null}
              </CardBody>
            </Card>
          )}

          {hasHeaderActions ? (
            <Card>
              <CardHeader title="Actions" />
              <CardBody>
                <WorkflowActions
                  bookingId={booking.id}
                  actions={actions}
                  latestQuotation={latestQuotation}
                  latestRecoveryItem={latestRecoveryItem}
                  latestInvoice={latestInvoice}
                  layout="stack"
                />
              </CardBody>
            </Card>
          ) : null}

          {populatedTravelFields.length > 0 || showDzPayment ? (
            <Card>
              <CardHeader title="Travel & recovery" />
              <CardBody>
                {populatedTravelFields.length > 0 ? (
                  <dl className="space-y-3">
                    {populatedTravelFields.map(([label, value]) => (
                      <DetailRow key={label} label={label} value={value} />
                    ))}
                  </dl>
                ) : null}

                {showDzPayment ? (
                  <div className={populatedTravelFields.length > 0 ? 'mt-4 border-t border-slate-100 pt-4' : ''}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">DZ payment</p>
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
              </CardBody>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
