import { Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon, CheckCircleIcon } from '~/components/icons'
import EnquiryDetailsCard from '~/components/portal/enquiry_details_card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { formatCurrency } from '~/lib/format'
import { statusTone } from '~/lib/status_tone'

type WorkflowStep = {
  id: string
  label: string
  actor: string
  status: 'pending' | 'active' | 'complete' | 'blocked'
  detail?: string
}

type PortalBookingsShowProps = {
  pageTitle?: string
  pageDescription?: string
  booking: {
    id: number
    reference: string
    destination: string
    departDate: string
    returnDate: string | null
    pax: number | null
    totalAmount: number
    currency: string
    status: string
    statusLabel: string
    notes: string | null
  }
  quotation: {
    id: number
    reference: string
    status: string
    totalAmount: number
    currency: string
    canApprove: boolean
  } | null
  recoveryItem: {
    id: number
    reference: string
    status: string
    statusLabel: string
    canApprove: boolean
  } | null
  invoice: {
    id: number
    invoiceNumber: string
    status: string
    totalAmount: number
    amountPaid: number
    currency: string
    canPay: boolean
  } | null
  steps: WorkflowStep[]
  enquiryDetails: {
    typeName: string
    rows: Array<{ label: string; value: string }>
  } | null
}

function stepCircle(status: WorkflowStep['status']) {
  if (status === 'complete') return 'bg-orange-600 text-white'
  if (status === 'active') return 'border-2 border-orange-600 bg-white text-orange-600'
  return 'border border-slate-200 bg-slate-50 text-slate-400'
}

export default function PortalBookingsShow({
  booking,
  quotation,
  recoveryItem,
  invoice,
  steps,
  enquiryDetails,
}: PortalBookingsShowProps) {
  return (
    <div className="space-y-6">
      <Link
        route="portal.dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeftIcon />
        Back to dashboard
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={statusTone(booking.status)}>{booking.statusLabel}</Badge>
      </div>

      {enquiryDetails ? (
        <EnquiryDetailsCard typeName={enquiryDetails.typeName} rows={enquiryDetails.rows} />
      ) : null}

      <Card>
        <CardHeader title="Workflow progress" />
        <CardBody>
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={step.id} className="flex gap-4">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${stepCircle(step.status)}`}
                >
                  {step.status === 'complete' ? <CheckCircleIcon className="h-4 w-4" /> : index + 1}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-slate-900">{step.label}</p>
                  {step.detail ? <p className="mt-0.5 text-sm text-slate-500">{step.detail}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {quotation ? (
          <Card>
            <CardHeader title="Quotation" />
            <CardBody className="space-y-3">
              <p className="text-sm text-slate-600">
                {quotation.reference} · {formatCurrency(quotation.totalAmount, quotation.currency)}
              </p>
              <Link route="portal.quotations.show" routeParams={{ id: quotation.id }}>
                <Button variant="secondary" className="w-full">
                  {quotation.canApprove ? 'Review & approve' : 'View quotation'}
                </Button>
              </Link>
            </CardBody>
          </Card>
        ) : null}

        {invoice ? (
          <Card>
            <CardHeader title="Invoice" />
            <CardBody className="space-y-3">
              <p className="text-sm text-slate-600">
                {invoice.invoiceNumber} · {formatCurrency(invoice.totalAmount, invoice.currency)}
              </p>
              <Link route="portal.invoices.show" routeParams={{ id: invoice.id }}>
                <Button variant="secondary" className="w-full">
                  {invoice.canPay ? 'View & pay' : 'View invoice'}
                </Button>
              </Link>
            </CardBody>
          </Card>
        ) : null}

        {recoveryItem ? (
          <Card>
            <CardHeader title="Recovery report" />
            <CardBody className="space-y-3">
              <p className="text-sm text-slate-600">
                {recoveryItem.reference} · {recoveryItem.statusLabel}
              </p>
              <Link route="portal.recovery_reports.show" routeParams={{ id: recoveryItem.id }}>
                <Button variant="secondary" className="w-full">
                  {recoveryItem.canApprove ? 'Review recovery report' : 'View recovery report'}
                </Button>
              </Link>
            </CardBody>
          </Card>
        ) : null}
      </div>

      {booking.notes ? (
        <Card>
          <CardHeader title="Your notes" />
          <CardBody>
            <p className="text-sm text-slate-700">{booking.notes}</p>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
