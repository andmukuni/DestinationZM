import Booking from '#models/booking'
import AuthorizationService from '#services/authorization_service'
import EnquiryDocumentHtmlService from '#services/enquiry_document_html_service'
import { enquiryStatusBadge } from '#services/enquiry_status_service'
import PortalBookingTypeService from '#services/portal_booking_type_service'
import type { BookingStatus } from '#types/booking_status'
import type { HttpContext } from '@adonisjs/core/http'

const ENQUIRY_STATUSES = ['enquiry_submitted', 'quotation_preparing'] as const

function canViewBookings(user: Parameters<typeof AuthorizationService.can>[0]) {
  return (
    AuthorizationService.can(user, 'bookings.view') ||
    AuthorizationService.can(user, 'bookings.manage')
  )
}

function canCreateQuotations(user: Parameters<typeof AuthorizationService.can>[0]) {
  return AuthorizationService.can(user, 'quotations.manage')
}

function canViewQuotations(user: Parameters<typeof AuthorizationService.can>[0]) {
  return (
    AuthorizationService.can(user, 'quotations.view') ||
    AuthorizationService.can(user, 'quotations.manage') ||
    AuthorizationService.can(user, 'quotations.approve')
  )
}

async function loadAdminEnquiry(user: Parameters<typeof AuthorizationService.can>[0], enquiryId: string | number) {
  const userBranchId = AuthorizationService.branchIdFor(user)

  const query = Booking.query()
    .where('id', enquiryId)
    .whereIn('status', [...ENQUIRY_STATUSES])
    .preload('customer')
    .preload('branch')
    .preload('assignedUser')
    .preload('quotations', (quotationQuery) => quotationQuery.orderBy('created_at', 'desc'))

  if (userBranchId) {
    query.where('branch_id', userBranchId)
  }

  const booking = await query.first()
  if (!booking) {
    return null
  }

  const badge = enquiryStatusBadge(booking.status as BookingStatus)
  const latestQuotation = booking.quotations?.[0] ?? null

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
      company: booking.customer?.company ?? null,
      name: booking.customer?.fullName ?? '—',
      contactName: booking.customer?.fullName ?? null,
      email: booking.customer?.email ?? null,
      phone: booking.customer?.phone ?? null,
    },
    booking.branch
  )

  return { booking, badge, document, latestQuotation }
}

function formatTravelDates(departDate: string, returnDate: string | null) {
  if (!returnDate || returnDate === departDate) {
    return departDate
  }
  return `${departDate} – ${returnDate}`
}

function serializeEnquiryRow(booking: Booking) {
  const itemCount = PortalBookingTypeService.enquiryItemCountForBooking(booking)
  const servicesLabel = PortalBookingTypeService.servicesLabelForBooking(booking)

  return {
    id: booking.id,
    reference: booking.reference,
    customer: {
      id: booking.customer?.id ?? null,
      name: booking.customer?.fullName ?? '—',
      email: booking.customer?.email ?? null,
    },
    branch: booking.branch?.name ?? '—',
    destination: booking.destination,
    departDate: booking.departDate.toFormat('dd LLL yyyy'),
    returnDate: booking.returnDate?.toFormat('dd LLL yyyy') ?? null,
    travelDates: formatTravelDates(
      booking.departDate.toFormat('dd LLL yyyy'),
      booking.returnDate?.toFormat('dd LLL yyyy') ?? null
    ),
    pax: booking.pax,
    productType: booking.productType ?? '—',
    amount: Number(booking.totalAmount ?? 0),
    currency: booking.currency,
    status: booking.status,
    statusLabel: enquiryStatusBadge(booking.status as BookingStatus).label,
    createdAt: booking.createdAt.toFormat('dd LLL yyyy'),
    assignedAgent: booking.assignedUser?.fullName ?? null,
    itemCount,
    servicesLabel,
  }
}

export default class EnquiriesController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewBookings(user)) {
      return response.forbidden()
    }

    const search = String(request.qs().search ?? '').trim()
    const userBranchId = AuthorizationService.branchIdFor(user)

    const query = Booking.query()
      .preload('customer')
      .preload('branch')
      .preload('assignedUser')
      .whereIn('status', [...ENQUIRY_STATUSES])
      .orderBy('created_at', 'desc')

    if (userBranchId) {
      query.where('branch_id', userBranchId)
    }

    if (search) {
      query.where((bookingQuery) => {
        bookingQuery
          .where('reference', 'like', `%${search}%`)
          .orWhere('destination', 'like', `%${search}%`)
          .orWhereHas('customer', (customerQuery) => {
            customerQuery
              .where('full_name', 'like', `%${search}%`)
              .orWhere('email', 'like', `%${search}%`)
          })
      })
    }

    const bookings = await query

    return inertia.render('enquiries/index', {
      pageTitle: 'Enquiries',
      pageDescription: 'New enquiries awaiting quotation',
      canCreateQuotation: canCreateQuotations(user),
      filters: { search },
      enquiries: bookings.map(serializeEnquiryRow),
    })
  }

  async show({ auth, inertia, params, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewBookings(user)) {
      return response.forbidden()
    }

    const loaded = await loadAdminEnquiry(user, params.id)
    if (!loaded) {
      return response.notFound()
    }

    const { booking, badge, document, latestQuotation } = loaded

    return inertia.render('enquiries/show', {
      pageTitle: booking.reference,
      pageDescription: 'Enquiry details',
      canCreateQuotation: canCreateQuotations(user),
      enquiryId: booking.id,
      document,
      statusTone: badge.tone,
      quotation: latestQuotation
        ? {
            id: latestQuotation.id,
            reference: latestQuotation.reference,
            canView: canViewQuotations(user),
          }
        : null,
    })
  }

  async download({ auth, params, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewBookings(user)) {
      return response.forbidden()
    }

    const loaded = await loadAdminEnquiry(user, params.id)
    if (!loaded) {
      return response.notFound()
    }

    const html = EnquiryDocumentHtmlService.render(loaded.document)
    const fileName = `${loaded.booking.reference}.html`

    response.header('Content-Type', 'text/html; charset=utf-8')
    response.header('Content-Disposition', `attachment; filename="${fileName}"`)
    return response.send(html)
  }
}
