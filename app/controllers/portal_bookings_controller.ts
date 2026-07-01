import Branch from '#models/branch'
import BookingService from '#services/booking_service'
import PortalBookingTypeService from '#services/portal_booking_type_service'
import PortalContextService from '#services/portal_context_service'
import PortalDashboardService from '#services/portal_dashboard_service'
import PortalEnquiryCartService from '#services/portal_enquiry_cart_service'
import PortalPrivilegeService from '#services/portal_privilege_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class PortalBookingsController {
  async index({ auth, inertia, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.hasAny(account, ['view_bookings', 'view_confirmed_bookings'])) {
      return response.forbidden()
    }

    const context = await PortalContextService.fromAccount(account)
    const bookings = await PortalDashboardService.listBookings(account, context.organizationCustomerId)
    const canCreateBooking = PortalPrivilegeService.has(account, 'create_booking')

    return inertia.render('portal/bookings/index', {
      pageTitle: 'My bookings',
      pageDescription: context.organization.name,
      canCreateBooking,
      bookings,
    })
  }

  async create({ auth, inertia, request, response, session }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'create_booking')) {
      return response.forbidden()
    }
    const context = await PortalContextService.fromAccount(account)

    const branch = await Branch.findBy('code', 'LUS-HQ')
    const branchId = branch?.id ?? context.organization.branchId
    if (!branchId) {
      throw new Error('Organization has no branch assigned for portal enquiries.')
    }

    const bookingTypes = await PortalBookingTypeService.listActiveForPortal()
    const typeParam = String(request.qs().type ?? '').trim()
    const initialType =
      bookingTypes.find((type) => type.slug === typeParam)?.slug ??
      bookingTypes[0]?.slug ??
      null

    const cartItems = PortalEnquiryCartService.serializeForPortal(
      PortalEnquiryCartService.list(session)
    )

    return inertia.render('portal/bookings/create', {
      pageTitle: 'Your enquiry',
      pageDescription: 'Add travel services and submit for a quotation',
      organization: { name: context.organization.name },
      submittedBy: { name: context.user.fullName, email: context.user.email },
      defaultBranchId: branchId,
      bookingTypes,
      initialType,
      cartItems,
    })
  }

  async addToCart({ auth, request, response, session }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'create_booking')) {
      return response.forbidden()
    }

    const bookingTypeId = Number(request.input('bookingTypeId'))
    const bookingType = Number.isFinite(bookingTypeId)
      ? await PortalBookingTypeService.findActiveById(bookingTypeId)
      : null

    if (!bookingType) {
      session.flash('error', 'Please choose a valid booking type.')
      response.status(303)
      return response.redirect().back()
    }

    const rawFields = (request.input('fields') ?? {}) as Record<string, unknown>
    const validationErrors = PortalBookingTypeService.validateSubmission(bookingType, rawFields)

    if (validationErrors.length) {
      session.flashAll()
      session.flash(
        'inputErrorsBag',
        Object.fromEntries(validationErrors.map((error) => [error.field, error.message]))
      )
      response.status(303)
      return response.redirect().back()
    }

    const mapped = PortalBookingTypeService.mapToBookingInput(bookingType, rawFields)
    const estimatedBudget = request.input('estimatedBudget')
    const budgetValue =
      estimatedBudget !== undefined && estimatedBudget !== null && String(estimatedBudget) !== ''
        ? Number(estimatedBudget)
        : 0

    PortalEnquiryCartService.addFromSubmission(
      session,
      bookingType,
      mapped,
      Number.isFinite(budgetValue) ? budgetValue : 0
    )

    session.flash(
      'success',
      `${bookingType.tabLabel ?? bookingType.name} added to your enquiry. Add more services or submit when ready.`
    )
    response.status(303)
    return response.redirect().withQs({ type: bookingType.slug }).toRoute('portal.bookings.create')
  }

  async removeFromCart({ auth, params, response, session }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'create_booking')) {
      return response.forbidden()
    }

    PortalEnquiryCartService.remove(session, String(params.itemId))
    session.flash('success', 'Item removed from your enquiry.')
    response.status(303)
    return response.redirect().toRoute('portal.bookings.create')
  }

  async updateCartBudget({ auth, params, request, response, session }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'create_booking')) {
      return response.forbidden()
    }

    const rawBudget = request.input('estimatedBudget')
    const budgetValue =
      rawBudget !== undefined && rawBudget !== null && String(rawBudget) !== ''
        ? Number(rawBudget)
        : 0

    if (!Number.isFinite(budgetValue) || budgetValue < 0) {
      session.flash('error', 'Enter a valid budget amount (0 or more).')
      response.status(303)
      return response.redirect().back()
    }

    const updated = PortalEnquiryCartService.updateBudget(
      session,
      String(params.itemId),
      budgetValue
    )

    if (!updated) {
      session.flash('error', 'Could not update budget for this item.')
      response.status(303)
      return response.redirect().back()
    }

    response.status(303)
    return response.redirect().toRoute('portal.bookings.create')
  }

  async submitCart({ auth, request, response, session }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'create_booking')) {
      return response.forbidden()
    }

    const context = await PortalContextService.fromAccount(account)
    const cartItems = PortalEnquiryCartService.list(session)

    if (!cartItems.length) {
      session.flash('error', 'Add at least one service to your enquiry before submitting.')
      return response.redirect().toRoute('portal.bookings.create')
    }

    const branchId = context.organization.branchId ?? Number(request.input('branchId'))
    if (!branchId) {
      session.flash('error', 'Unable to determine office for this enquiry.')
      return response.redirect().toRoute('portal.bookings.create')
    }

    const currency = String(request.input('currency') ?? 'ZMW')

    const booking = await BookingService.createEnquiryFromCart(cartItems, {
      customerId: context.organizationCustomerId,
      branchId,
      currency,
      ipAddress: request.ip(),
    })

    PortalEnquiryCartService.clear(session)

    const itemCount = PortalBookingTypeService.enquiryItemCountForBooking(booking)
    session.flash(
      'success',
      cartItems.length > 1
        ? `Your enquiry with ${itemCount} services has been submitted. We will prepare one quotation shortly.`
        : 'Your enquiry has been submitted. We will prepare a quotation shortly.'
    )

    return response.redirect().toRoute('portal.enquiries.show', { id: booking.id })
  }

  /** @deprecated Use addToCart — kept for backwards compatibility */
  async store(ctx: HttpContext) {
    return this.addToCart(ctx)
  }
}
