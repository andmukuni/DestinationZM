import Booking from '#models/booking'
import type ClientAccount from '#models/client_account'
import BookingService from '#services/booking_service'
import EnquiryDocumentHtmlService from '#services/enquiry_document_html_service'
import { enquiryStatusBadge } from '#services/enquiry_status_service'
import PortalBookingTypeService from '#services/portal_booking_type_service'
import PortalContextService from '#services/portal_context_service'
import PortalPrivilegeService from '#services/portal_privilege_service'
import type { BookingStatus } from '#types/booking_status'
import type { HttpContext } from '@adonisjs/core/http'

const ENQUIRY_VIEW_STATUSES: BookingStatus[] = [
  'enquiry_submitted',
  'quotation_preparing',
  'quotation_sent',
  'quotation_approved',
]

export const PORTAL_ENQUIRY_CANCELLABLE_STATUSES: BookingStatus[] = [
  'enquiry_submitted',
  'quotation_preparing',
]

export function portalEnquiryCanCancel(status: BookingStatus) {
  return PORTAL_ENQUIRY_CANCELLABLE_STATUSES.includes(status)
}

export type PortalEnquiryStatusFilter = 'all' | 'pending' | 'quoted' | 'approved'

const PORTAL_ENQUIRY_STATUS_FILTER: Record<PortalEnquiryStatusFilter, BookingStatus[] | null> = {
  all: null,
  pending: ['enquiry_submitted', 'quotation_preparing'],
  quoted: ['quotation_sent'],
  approved: ['quotation_approved'],
}

export function portalEnquiryStatusesForFilter(filter: string): BookingStatus[] {
  const statuses = PORTAL_ENQUIRY_STATUS_FILTER[filter as PortalEnquiryStatusFilter]
  if (statuses) {
    return statuses
  }
  return ENQUIRY_VIEW_STATUSES
}

export function normalizePortalEnquiryStatusFilter(filter: string): PortalEnquiryStatusFilter {
  if (filter === 'pending' || filter === 'quoted' || filter === 'approved') {
    return filter
  }
  return 'all'
}

function formatTravelDates(departDate: string, returnDate: string | null) {
  if (!returnDate || returnDate === departDate) {
    return departDate
  }
  return `${departDate} – ${returnDate}`
}

function serializeEnquiryRow(booking: Booking) {
  const latestQuotation = booking.quotations?.[0] ?? null
  const badge = enquiryStatusBadge(booking.status as BookingStatus)
  const itemCount = PortalBookingTypeService.enquiryItemCountForBooking(booking)
  const servicesLabel = PortalBookingTypeService.servicesLabelForBooking(booking)

  return {
    id: booking.id,
    reference: booking.reference,
    destination: booking.destination,
    productType: booking.productType ?? null,
    departDate: booking.departDate.toFormat('dd LLL yyyy'),
    returnDate: booking.returnDate?.toFormat('dd LLL yyyy') ?? null,
    travelDates: formatTravelDates(
      booking.departDate.toFormat('dd LLL yyyy'),
      booking.returnDate?.toFormat('dd LLL yyyy') ?? null
    ),
    pax: booking.pax,
    createdAt: booking.createdAt.toFormat('dd LLL yyyy'),
    status: booking.status,
    statusLabel: badge.label,
    statusTone: badge.tone,
    quotationId: latestQuotation?.id ?? null,
    itemCount,
    servicesLabel,
  }
}

async function loadPortalEnquiry(
  account: ClientAccount,
  enquiryId: string | number,
  statuses: BookingStatus[]
) {
  const context = await PortalContextService.fromAccount(account)
  await account.load('customer')

  const booking = await Booking.query()
    .where('id', enquiryId)
    .where('customer_id', context.organizationCustomerId)
    .whereIn('status', statuses)
    .preload('branch')
    .preload('quotations', (q) => q.orderBy('created_at', 'desc'))
    .first()

  if (!booking) {
    return null
  }

  const badge = enquiryStatusBadge(booking.status as BookingStatus)
  const customer = account.customer

  const document = await PortalBookingTypeService.enquiryDocumentForBooking(
    {
      reference: booking.reference,
      status: booking.status,
      statusLabel: badge.label,
      totalAmount: Number(booking.totalAmount ?? 0),
      currency: booking.currency,
      createdAt: booking.createdAt,
      portalBookingTypeId: booking.portalBookingTypeId,
      enquiryData: booking.enquiryData,
      destination: booking.destination,
      productType: booking.productType,
      departDate: booking.departDate,
      returnDate: booking.returnDate,
      notes: booking.notes,
      pax: booking.pax,
    },
    {
      company: customer.company,
      name: PortalContextService.organizationName(customer),
      contactName: account.fullName,
      email: account.email,
      phone: customer.phone,
    },
    booking.branch
  )

  return { booking, badge, document }
}

export default class PortalEnquiriesController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.canViewEnquiries(account)) {
      return response.forbidden()
    }

    const context = await PortalContextService.fromAccount(account)
    const search = String(request.qs().search ?? '').trim()
    const status = normalizePortalEnquiryStatusFilter(String(request.qs().status ?? 'all'))

    const query = Booking.query()
      .where('customer_id', context.organizationCustomerId)
      .whereIn('status', portalEnquiryStatusesForFilter(status))
      .preload('quotations', (q) => q.orderBy('created_at', 'desc'))
      .orderBy('created_at', 'desc')

    if (search) {
      query.where((builder) => {
        builder
          .whereILike('reference', `%${search}%`)
          .orWhereILike('destination', `%${search}%`)
          .orWhereILike('product_type', `%${search}%`)
      })
    }

    const bookings = await query

    return inertia.render('portal/enquiries/index', {
      pageTitle: 'Enquiries',
      pageDescription: context.organization.name,
      canCreateBooking: PortalPrivilegeService.has(account, 'create_booking'),
      filters: { search, status },
      enquiries: bookings.map(serializeEnquiryRow),
    })
  }

  async show({ auth, inertia, params, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.canViewEnquiries(account)) {
      return response.forbidden()
    }

    const loaded = await loadPortalEnquiry(account, params.id, ENQUIRY_VIEW_STATUSES)
    if (!loaded) {
      return response.notFound()
    }

    const { booking, badge, document } = loaded
    const latestQuotation = booking.quotations?.[0] ?? null

    return inertia.render('portal/enquiries/show', {
      pageTitle: booking.reference,
      pageDescription: 'Enquiry details',
      enquiryId: booking.id,
      document,
      statusTone: badge.tone,
      canCancel: portalEnquiryCanCancel(booking.status as BookingStatus),
      quotation: latestQuotation
        ? {
            id: latestQuotation.id,
            reference: latestQuotation.reference,
            canView: true,
          }
        : null,
    })
  }

  async download({ auth, params, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.canViewEnquiries(account)) {
      return response.forbidden()
    }

    const loaded = await loadPortalEnquiry(account, params.id, ENQUIRY_VIEW_STATUSES)
    if (!loaded) {
      return response.notFound()
    }

    const html = EnquiryDocumentHtmlService.render(loaded.document)
    const fileName = `${loaded.booking.reference}.html`

    response.header('Content-Type', 'text/html; charset=utf-8')
    response.header('Content-Disposition', `attachment; filename="${fileName}"`)
    return response.send(html)
  }

  async cancel({ auth, params, request, response, session }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.canViewEnquiries(account)) {
      return response.forbidden()
    }

    const context = await PortalContextService.fromAccount(account)

    const booking = await Booking.query()
      .where('id', params.id)
      .where('customer_id', context.organizationCustomerId)
      .whereIn('status', PORTAL_ENQUIRY_CANCELLABLE_STATUSES)
      .first()

    if (!booking) {
      session.flash('error', 'This enquiry cannot be cancelled.')
      return response.redirect().toRoute('portal.enquiries.index')
    }

    await BookingService.cancelEnquiry(booking, { ipAddress: request.ip() })

    session.flash('success', `${booking.reference} has been cancelled.`)
    return response.redirect().toRoute('portal.enquiries.index')
  }
}
