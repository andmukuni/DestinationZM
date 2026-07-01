import Booking from '#models/booking'
import Invoice from '#models/invoice'
import Quotation from '#models/quotation'
import RecoveryReportItem from '#models/recovery_report_item'
import { RECOVERY_ITEM_STATUS_LABELS } from '#types/recovery_reporting'
import PortalBookingTypeService from '#services/portal_booking_type_service'
import PortalContextService from '#services/portal_context_service'
import PortalDashboardService from '#services/portal_dashboard_service'
import PortalPrivilegeService from '#services/portal_privilege_service'
import WorkflowService from '#services/workflow_service'
import { BOOKING_STATUS_LABELS } from '#types/booking_status'
import type { HttpContext } from '@adonisjs/core/http'

export default class PortalDashboardController {
  async index({ auth, inertia, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'view_dashboard')) {
      return response.forbidden()
    }
    const context = await PortalContextService.fromAccount(account)
    const organizationCustomerId = context.organizationCustomerId

    const [stats, bookings, upcomingTrips, recentInvoices] = await Promise.all([
      PortalDashboardService.stats(organizationCustomerId),
      PortalDashboardService.recentBookings(organizationCustomerId),
      PortalDashboardService.upcomingTrips(organizationCustomerId),
      PortalDashboardService.recentInvoices(organizationCustomerId),
    ])

    return inertia.render('portal/dashboard', {
      pageTitle: 'Dashboard',
      pageDescription: context.organization.name,
      stats,
      bookings,
      upcomingTrips,
      recentInvoices,
    })
  }

  async showBooking({ auth, inertia, params, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    const context = await PortalContextService.fromAccount(account)

    const booking = await Booking.query()
      .where('id', params.id)
      .where('customer_id', context.organizationCustomerId)
      .first()

    if (!booking || !PortalPrivilegeService.canViewBooking(account, booking.status)) {
      return response.notFound()
    }

    const quotation = await Quotation.query().where('booking_id', booking.id).orderBy('id', 'desc').first()
    const recoveryItem = await RecoveryReportItem.findBy('booking_id', booking.id)
    const invoice = await Invoice.query().where('booking_id', booking.id).orderBy('id', 'desc').first()
    const steps = await WorkflowService.stepsForBooking(booking, { audience: 'portal' })
    const enquiryDetails = await PortalBookingTypeService.enquiryDetailsForBooking(booking)

    return inertia.render('portal/bookings/show', {
      pageTitle: booking.reference,
      pageDescription: `${booking.destination} · ${booking.departDate.toFormat('dd LLL yyyy')}`,
      booking: {
        id: booking.id,
        reference: booking.reference,
        destination: booking.destination,
        departDate: booking.departDate.toFormat('dd LLL yyyy'),
        returnDate: booking.returnDate?.toFormat('dd LLL yyyy') ?? null,
        pax: booking.pax,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        status: booking.status,
        statusLabel: BOOKING_STATUS_LABELS[booking.status as keyof typeof BOOKING_STATUS_LABELS] ?? booking.status,
        notes: booking.notes,
      },
      enquiryDetails,
      quotation: quotation
        ? {
            id: quotation.id,
            reference: quotation.reference,
            status: quotation.status,
            totalAmount: quotation.totalAmount,
            currency: quotation.currency,
            canApprove: quotation.status === 'sent' && PortalPrivilegeService.has(account, 'approve_quotations'),
          }
        : null,
      recoveryItem: recoveryItem
        ? {
            id: recoveryItem.id,
            reference: recoveryItem.recoveryReference,
            status: recoveryItem.recoveryStatus,
            statusLabel:
              RECOVERY_ITEM_STATUS_LABELS[recoveryItem.recoveryStatus] ?? recoveryItem.recoveryStatus,
            canApprove:
              ['SENT_TO_CLIENT', 'UNDER_CLIENT_REVIEW', 'QUERY_RAISED'].includes(
                recoveryItem.recoveryStatus
              ) && PortalPrivilegeService.has(account, 'approve_recovery_reports'),
          }
        : null,
      invoice: invoice
        ? {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            status: invoice.status,
            totalAmount: invoice.totalAmount,
            amountPaid: invoice.amountPaid,
            currency: invoice.currency,
            canPay:
              WorkflowService.canClientPay(invoice.status) && PortalPrivilegeService.has(account, 'pay_invoices'),
          }
        : null,
      steps,
    })
  }
}
