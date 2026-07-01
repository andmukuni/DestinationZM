import { DateTime } from 'luxon'
import Booking from '#models/booking'
import type ClientAccount from '#models/client_account'
import Invoice from '#models/invoice'
import Quotation from '#models/quotation'
import RecoveryReportItem from '#models/recovery_report_item'
import PortalPrivilegeService from '#services/portal_privilege_service'
import { CONFIRMED_BOOKING_STATUSES } from '#types/portal_privileges'
import { BOOKING_STATUS_LABELS } from '#types/booking_status'

function formatMoney(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString('en-ZM', { minimumFractionDigits: 0 })}`
}

export type PortalPendingAction = {
  id: string
  label: string
  detail: string
  href: string
  tone: 'warning' | 'danger' | 'default'
}

export default class PortalDashboardService {
  static async pendingEnquiriesCount(customerId: number) {
    const [{ $extras }] = await Booking.query()
      .where('customer_id', customerId)
      .whereIn('status', ['enquiry_submitted', 'quotation_preparing'])
      .count('* as total')

    return Number($extras.total ?? 0)
  }

  static async pendingQuotationsCount(customerId: number) {
    const [{ $extras }] = await Quotation.query()
      .where('customer_id', customerId)
      .where('status', 'sent')
      .count('* as total')

    return Number($extras.total ?? 0)
  }

  static async pendingInvoicesCount(customerId: number) {
    const [{ $extras }] = await Invoice.query()
      .where('customer_id', customerId)
      .whereIn('status', ['issued', 'partially_paid', 'overdue'])
      .count('* as total')

    return Number($extras.total ?? 0)
  }

  static async stats(customerId: number) {
    const today = DateTime.now().startOf('day')
    const in30Days = today.plus({ days: 30 })

    const activeBookings = await Booking.query()
      .where('customer_id', customerId)
      .whereNotIn('status', ['closed', 'cancelled'])
      .count('* as total')

    const upcomingTrips = await Booking.query()
      .where('customer_id', customerId)
      .where('depart_date', '>=', today.toSQLDate()!)
      .where('depart_date', '<=', in30Days.toSQLDate()!)
      .whereNotIn('status', ['cancelled', 'closed'])
      .count('* as total')

    const quotationsToReview = await Quotation.query()
      .where('customer_id', customerId)
      .where('status', 'sent')
      .count('* as total')

    const reportsToConfirm = await RecoveryReportItem.query()
      .where('customer_id', customerId)
      .whereIn('recovery_status', ['SENT_TO_CLIENT', 'UNDER_CLIENT_REVIEW', 'QUERY_RAISED'])
      .count('* as total')

    const payableInvoices = await Invoice.query()
      .where('customer_id', customerId)
      .whereIn('status', ['issued', 'partially_paid', 'overdue'])
      .count('* as total')

    const overdueInvoices = await Invoice.query()
      .where('customer_id', customerId)
      .where('status', 'overdue')
      .count('* as total')

    const paidBookings = await Booking.query()
      .where('customer_id', customerId)
      .whereIn('status', ['paid', 'closed'])
      .count('* as total')

    const unpaidInvoices = await Invoice.query()
      .where('customer_id', customerId)
      .whereIn('status', ['issued', 'partially_paid', 'overdue'])

    let outstandingBalance = 0
    let outstandingCurrency = 'ZMW'
    for (const invoice of unpaidInvoices) {
      outstandingBalance += Number(invoice.totalAmount) - Number(invoice.amountPaid)
      outstandingCurrency = invoice.currency
    }

    const paidInvoices = await Invoice.query()
      .where('customer_id', customerId)
      .where('status', 'paid')

    let totalPaid = 0
    let paidCurrency = 'ZMW'
    for (const invoice of paidInvoices) {
      totalPaid += Number(invoice.amountPaid)
      paidCurrency = invoice.currency
    }

    const pendingActions =
      Number(quotationsToReview[0].$extras.total) +
      Number(reportsToConfirm[0].$extras.total) +
      Number(payableInvoices[0].$extras.total)

    return {
      activeBookings: Number(activeBookings[0].$extras.total),
      pendingActions,
      outstandingBalance: formatMoney(outstandingBalance, outstandingCurrency),
      outstandingBalanceRaw: outstandingBalance,
      upcomingTrips: Number(upcomingTrips[0].$extras.total),
      quotationsToReview: Number(quotationsToReview[0].$extras.total),
      reportsToConfirm: Number(reportsToConfirm[0].$extras.total),
      invoicesToPay: Number(payableInvoices[0].$extras.total),
      overdueInvoices: Number(overdueInvoices[0].$extras.total),
      completedTrips: Number(paidBookings[0].$extras.total),
      totalPaid: formatMoney(totalPaid, paidCurrency),
    }
  }

  static async pendingActions(customerId: number): Promise<PortalPendingAction[]> {
    const actions: PortalPendingAction[] = []

    const quotations = await Quotation.query()
      .where('customer_id', customerId)
      .where('status', 'sent')
      .preload('booking')
      .orderBy('updated_at', 'desc')
      .limit(5)

    for (const quotation of quotations) {
      actions.push({
        id: `quotation-${quotation.id}`,
        label: 'Approve quotation',
        detail: `${quotation.reference}${quotation.booking ? ` · ${quotation.booking.reference}` : ''}`,
        href: `/portal/quotations/${quotation.id}`,
        tone: 'warning',
      })
    }

    const reports = await RecoveryReportItem.query()
      .where('customer_id', customerId)
      .whereIn('recovery_status', ['SENT_TO_CLIENT', 'UNDER_CLIENT_REVIEW', 'QUERY_RAISED'])
      .preload('booking')
      .orderBy('sent_to_client_at', 'desc')
      .limit(5)

    for (const report of reports) {
      actions.push({
        id: `report-${report.id}`,
        label: 'Review recovery item',
        detail: `${report.recoveryReference} · ${report.booking?.reference ?? '—'}`,
        href: `/portal/recovery-reports/${report.id}`,
        tone: 'warning',
      })
    }

    const invoices = await Invoice.query()
      .where('customer_id', customerId)
      .whereIn('status', ['issued', 'partially_paid', 'overdue'])
      .preload('booking')
      .orderBy('due_date', 'asc')
      .limit(5)

    for (const invoice of invoices) {
      const balance = Number(invoice.totalAmount) - Number(invoice.amountPaid)
      actions.push({
        id: `invoice-${invoice.id}`,
        label: invoice.status === 'overdue' ? 'Pay overdue invoice' : 'Pay invoice',
        detail: `${invoice.invoiceNumber} · ${formatMoney(balance, invoice.currency)} due ${invoice.dueDate.toFormat('dd LLL')}`,
        href: `/portal/invoices/${invoice.id}`,
        tone: invoice.status === 'overdue' ? 'danger' : 'default',
      })
    }

    return actions
  }

  static async listBookings(account: ClientAccount, customerId: number) {
    const query = Booking.query().where('customer_id', customerId).orderBy('created_at', 'desc')

    if (
      !PortalPrivilegeService.has(account, 'view_bookings') &&
      PortalPrivilegeService.has(account, 'view_confirmed_bookings')
    ) {
      query.whereIn('status', [...CONFIRMED_BOOKING_STATUSES])
    }

    const bookings = await query

    return bookings
      .filter((booking) => PortalPrivilegeService.canViewBooking(account, booking.status))
      .map((b) => ({
        id: b.id,
        reference: b.reference,
        destination: b.destination,
        departDate: b.departDate.toFormat('dd LLL yyyy'),
        returnDate: b.returnDate?.toFormat('dd LLL yyyy') ?? '—',
        status: b.status,
        statusLabel: BOOKING_STATUS_LABELS[b.status as keyof typeof BOOKING_STATUS_LABELS] ?? b.status,
        amount: formatMoney(b.totalAmount, b.currency),
      }))
  }

  static async recentBookings(customerId: number, limit = 8) {
    const bookings = await Booking.query()
      .where('customer_id', customerId)
      .orderBy('created_at', 'desc')
      .limit(limit)

    return bookings.map((b) => ({
      id: b.id,
      reference: b.reference,
      destination: b.destination,
      departDate: b.departDate.toFormat('dd LLL yyyy'),
      returnDate: b.returnDate?.toFormat('dd LLL yyyy') ?? '—',
      status: b.status,
      statusLabel: BOOKING_STATUS_LABELS[b.status as keyof typeof BOOKING_STATUS_LABELS] ?? b.status,
      amount: formatMoney(b.totalAmount, b.currency),
    }))
  }

  static async upcomingTrips(customerId: number, limit = 5) {
    const today = DateTime.now().startOf('day')

    const bookings = await Booking.query()
      .where('customer_id', customerId)
      .where('depart_date', '>=', today.toSQLDate()!)
      .whereNotIn('status', ['cancelled', 'closed'])
      .orderBy('depart_date', 'asc')
      .limit(limit)

    return bookings.map((b) => ({
      id: b.id,
      reference: b.reference,
      destination: b.destination,
      departDate: b.departDate.toFormat('dd LLL yyyy'),
      pax: b.pax,
      statusLabel: BOOKING_STATUS_LABELS[b.status as keyof typeof BOOKING_STATUS_LABELS] ?? b.status,
    }))
  }

  static async recentInvoices(customerId: number, limit = 5) {
    const invoices = await Invoice.query()
      .where('customer_id', customerId)
      .whereNot('status', 'draft')
      .preload('booking')
      .orderBy('issue_date', 'desc')
      .limit(limit)

    return invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      status: inv.status,
      balance: formatMoney(Number(inv.totalAmount) - Number(inv.amountPaid), inv.currency),
      dueDate: inv.dueDate.toFormat('dd LLL yyyy'),
      bookingReference: inv.booking?.reference ?? null,
      canPay: ['issued', 'partially_paid', 'overdue'].includes(inv.status),
    }))
  }
}
