import Booking from '#models/booking'
import Invoice from '#models/invoice'
import RecoveryReportItem from '#models/recovery_report_item'
import User from '#models/user'
import WorkflowService from '#services/workflow_service'
import { BOOKING_STATUS_LABELS, QUOTATION_STATUS_LABELS, type BookingStatus } from '#types/booking_status'
import { RECOVERY_ITEM_STATUS_LABELS } from '#types/recovery_reporting'
import { requiresBranch, type UserRole } from '#types/user_roles'

export type WorkflowCycleRow = {
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

export type WorkflowCycleDetail = WorkflowCycleRow & {
  departDate: string
  returnDate: string | null
  pax: number | null
  branch: string
  agent: string
  isComplete: boolean
  nextStep: string | null
  supplierPaid: boolean
  supplierPaidAt: string | null
  supplierAmount: string | null
  supplierReference: string | null
}

export type WorkflowCycleTravelDetails = {
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

function formatMoney(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString('en-ZM', { minimumFractionDigits: 0 })}`
}

function nextIncompleteStage(
  booking: Booking,
  recoveryItem: RecoveryReportItem | null,
  invoices: Invoice[]
) {
  const status = booking.status as BookingStatus

  if (WorkflowService.canConfirmBooking(status)) {
    return 'Confirm booking'
  }

  if (!WorkflowService.canRecordSupplierPayment(status)) {
    return 'Confirm booking'
  }

  if (booking.dzPaymentStatus !== 'PAID') {
    return 'Pay supplier'
  }

  const issuedInvoice = invoices.find((invoice) => invoice.status !== 'draft')
  if (!issuedInvoice) {
    return 'Issue client invoice'
  }

  if (!recoveryItem) {
    return 'Recovery report'
  }

  if (!['APPROVED_BY_CLIENT', 'RECOVERED'].includes(recoveryItem.recoveryStatus)) {
    return 'Client recovery review'
  }

  const paidInvoice = invoices.find((invoice) => invoice.status === 'paid')
  if (!paidInvoice) {
    return 'Client payment'
  }

  if (recoveryItem.recoveryStatus !== 'RECOVERED') {
    return 'Mark recovered'
  }

  return 'In progress'
}

function isCycleComplete(
  booking: Booking,
  recoveryItem: RecoveryReportItem | null,
  invoices: Invoice[]
) {
  const paidInvoice = invoices.find((invoice) => invoice.status === 'paid')

  return (
    booking.dzPaymentStatus === 'PAID' &&
    Boolean(paidInvoice) &&
    Boolean(recoveryItem) &&
    recoveryItem!.recoveryStatus === 'RECOVERED'
  )
}

function mapBookingToCycleDetail(booking: Booking): WorkflowCycleDetail {
  const row = mapBookingToCycleRow(booking, { includeStage: true })
  const recoveryItem = booking.recoveryReportItems[0] ?? null
  const supplierPaid = booking.dzPaymentStatus === 'PAID'

  return {
    ...row,
    departDate: booking.departDate.toFormat('dd LLL yyyy'),
    returnDate: booking.returnDate?.toFormat('dd LLL yyyy') ?? null,
    pax: booking.pax,
    branch: booking.branch?.name ?? '—',
    agent: booking.assignedUser?.fullName ?? 'Unassigned',
    isComplete: isCycleComplete(booking, recoveryItem, booking.invoices),
    nextStep: row.stageLabel,
    supplierPaid,
    supplierPaidAt: booking.dzPaymentDate?.toFormat('dd LLL yyyy') ?? null,
    supplierAmount: supplierPaid
      ? formatMoney(Number(booking.amountPaidByDz ?? booking.totalAmount), booking.currency)
      : null,
    supplierReference: booking.dzPaymentReference ?? booking.invoiceReceiptNumber ?? null,
  }
}

function mapBookingToCycleRow(
  booking: Booking,
  options: { includeStage?: boolean } = {}
): WorkflowCycleRow {
  const quotation = booking.quotations[0] ?? null
  const recoveryItem = booking.recoveryReportItems[0] ?? null
  const paidInvoice =
    booking.invoices.find((invoice) => invoice.status === 'paid') ?? booking.invoices[0] ?? null

  return {
    id: booking.id,
    bookingReference: booking.reference,
    customer: booking.customer?.fullName ?? 'Unknown',
    destination: booking.destination,
    enquiryDate: booking.createdAt.toFormat('dd LLL yyyy'),
    quotationId: quotation?.id ?? null,
    quotationReference: quotation?.reference ?? null,
    quotationStatus: quotation?.status ?? null,
    quotationStatusLabel: quotation
      ? (QUOTATION_STATUS_LABELS[quotation.status as keyof typeof QUOTATION_STATUS_LABELS] ??
        quotation.status)
      : null,
    recoveryItemId: recoveryItem?.id ?? null,
    recoveryReference: recoveryItem?.recoveryReference ?? null,
    recoveryStatus: recoveryItem?.recoveryStatus ?? null,
    recoveryStatusLabel: recoveryItem
      ? (RECOVERY_ITEM_STATUS_LABELS[recoveryItem.recoveryStatus] ?? recoveryItem.recoveryStatus)
      : null,
    invoiceId: paidInvoice?.id ?? null,
    invoiceNumber: paidInvoice?.invoiceNumber ?? null,
    invoiceStatus: paidInvoice?.status ?? null,
    invoiceStatusLabel: paidInvoice?.status ? paidInvoice.status.replaceAll('_', ' ') : null,
    paidAt: paidInvoice?.updatedAt?.toFormat('dd LLL yyyy') ?? null,
    amount: formatMoney(Number(paidInvoice?.totalAmount ?? booking.totalAmount), booking.currency),
    bookingStatus: booking.status,
    bookingStatusLabel: BOOKING_STATUS_LABELS[booking.status],
    stageLabel: options.includeStage
      ? nextIncompleteStage(booking, recoveryItem, booking.invoices)
      : null,
  }
}

function applyUserScope(query: ReturnType<typeof Booking.query>, user: User) {
  if (requiresBranch(user.role as UserRole) && user.branchId) {
    query.where('branch_id', user.branchId)
  }

  if (user.role === 'reservations' || user.role === 'operations') {
    query.where('assigned_user_id', user.id)
  }
}

export default class WorkflowCycleService {
  static async incompleteCount(user: User): Promise<number> {
    const query = Booking.query()
      .whereHas('quotations', (quotationQuery) =>
        quotationQuery.where('status', 'client_approved')
      )
      .where((builder) => {
        builder
          .where('status', 'quotation_approved')
          .orWhere('dz_payment_status', '!=', 'PAID')
          .orWhereDoesntHave('invoices', (invoiceQuery) => invoiceQuery.where('status', 'paid'))
          .orWhereDoesntHave('recoveryReportItems', (itemQuery) =>
            itemQuery.where('recovery_status', 'RECOVERED')
          )
      })

    applyUserScope(query, user)

    const result = await query.count('* as total')
    return Number(result[0].$extras.total)
  }

  static async list(user: User, options: { search?: string } = {}): Promise<WorkflowCycleRow[]> {
    const search = options.search?.trim()

    const query = Booking.query()
      .whereHas('quotations', (quotationQuery) =>
        quotationQuery.where('status', 'client_approved')
      )
      .where('dz_payment_status', 'PAID')
      .whereHas('invoices', (invoiceQuery) => invoiceQuery.where('status', 'paid'))
      .whereHas('recoveryReportItems', (itemQuery) =>
        itemQuery.where('recovery_status', 'RECOVERED')
      )
      .preload('customer')
      .preload('quotations', (q) => q.orderBy('id', 'desc'))
      .preload('recoveryReportItems', (q) => q.orderBy('id', 'desc'))
      .preload('invoices', (q) => q.orderBy('id', 'desc'))
      .orderBy('updated_at', 'desc')

    applyUserScope(query, user)

    if (search) {
      query.where((builder) => {
        builder
          .whereILike('reference', `%${search}%`)
          .orWhereILike('destination', `%${search}%`)
          .orWhereHas('customer', (customerQuery) => {
            customerQuery.whereILike('full_name', `%${search}%`)
          })
          .orWhereHas('quotations', (quotationQuery) => {
            quotationQuery.whereILike('reference', `%${search}%`)
          })
          .orWhereHas('recoveryReportItems', (itemQuery) => {
            itemQuery.whereILike('recovery_reference', `%${search}%`)
          })
          .orWhereHas('invoices', (invoiceQuery) => {
            invoiceQuery.whereILike('invoice_number', `%${search}%`)
          })
      })
    }

    const bookings = await query

    return bookings.map((booking) => mapBookingToCycleRow(booking))
  }

  static async listIncomplete(
    user: User,
    options: { search?: string } = {}
  ): Promise<WorkflowCycleRow[]> {
    const search = options.search?.trim()

    const query = Booking.query()
      .whereHas('quotations', (quotationQuery) =>
        quotationQuery.where('status', 'client_approved')
      )
      .where((builder) => {
        builder
          .where('status', 'quotation_approved')
          .orWhere('dz_payment_status', '!=', 'PAID')
          .orWhereDoesntHave('invoices', (invoiceQuery) => invoiceQuery.where('status', 'paid'))
          .orWhereDoesntHave('recoveryReportItems', (itemQuery) =>
            itemQuery.where('recovery_status', 'RECOVERED')
          )
      })
      .preload('customer')
      .preload('quotations', (q) => q.orderBy('id', 'desc'))
      .preload('recoveryReportItems', (q) => q.orderBy('id', 'desc'))
      .preload('invoices', (q) => q.orderBy('id', 'desc'))
      .orderBy('updated_at', 'desc')

    applyUserScope(query, user)

    if (search) {
      query.where((builder) => {
        builder
          .whereILike('reference', `%${search}%`)
          .orWhereILike('destination', `%${search}%`)
          .orWhereHas('customer', (customerQuery) => {
            customerQuery.whereILike('full_name', `%${search}%`)
          })
          .orWhereHas('quotations', (quotationQuery) => {
            quotationQuery.whereILike('reference', `%${search}%`)
          })
          .orWhereHas('recoveryReportItems', (itemQuery) => {
            itemQuery.whereILike('recovery_reference', `%${search}%`)
          })
          .orWhereHas('invoices', (invoiceQuery) => {
            invoiceQuery.whereILike('invoice_number', `%${search}%`)
          })
      })
    }

    const bookings = await query

    return bookings.map((booking) => mapBookingToCycleRow(booking, { includeStage: true }))
  }

  static async findForUser(user: User, bookingId: number): Promise<WorkflowCycleDetail | null> {
    const query = Booking.query()
      .where('id', bookingId)
      .whereHas('quotations', (quotationQuery) =>
        quotationQuery.where('status', 'client_approved')
      )
      .preload('customer')
      .preload('branch')
      .preload('assignedUser')
      .preload('quotations', (q) => q.orderBy('id', 'desc'))
      .preload('recoveryReportItems', (q) => q.orderBy('id', 'desc'))
      .preload('invoices', (q) => q.orderBy('id', 'desc'))

    applyUserScope(query, user)

    const booking = await query.first()
    if (!booking) {
      return null
    }

    return mapBookingToCycleDetail(booking)
  }

  static mapTravelDetails(booking: Booking): WorkflowCycleTravelDetails {
    return {
      productType: booking.productType,
      travelerName: booking.travelerName,
      pnr: booking.pnr,
      itineraryService: booking.itineraryService,
      tripName: booking.tripName,
      tripReason: booking.tripReason,
      costCenter: booking.costCenter,
      generalLedgerAccount: booking.generalLedgerAccount,
      approvedBy: booking.approvedBy,
      dateRequested: booking.dateRequested?.toFormat('dd LLL yyyy') ?? null,
      confirmedAt: booking.confirmedAt?.toFormat('dd LLL yyyy') ?? null,
    }
  }
}
