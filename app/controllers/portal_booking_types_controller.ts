import PortalBookingField from '#models/portal_booking_field'
import PortalBookingType from '#models/portal_booking_type'
import AuthorizationService from '#services/authorization_service'
import PortalBookingTypeService from '#services/portal_booking_type_service'
import {
  portalBookingFieldStoreValidator,
  portalBookingFieldUpdateValidator,
  portalBookingTypeStoreValidator,
  portalBookingTypeUpdateValidator,
} from '#validators/portal_booking_type_validator'
import type { HttpContext } from '@adonisjs/core/http'

function canManage(user: Parameters<typeof AuthorizationService.can>[0]) {
  return AuthorizationService.can(user, 'bookings.manage')
}

function parseOptions(raw: string | undefined) {
  if (!raw?.trim()) return null
  return raw
    .split(',')
    .map((option) => option.trim())
    .filter(Boolean)
}

export default class PortalBookingTypesController {
  async index({ auth, inertia, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canManage(user)) {
      return response.forbidden()
    }

    const types = await PortalBookingTypeService.listAllForAdmin()

    return inertia.render('portal_booking_types/index', {
      pageTitle: 'Portal enquiry types',
      pageDescription: 'Configure enquiry forms shown to client portal users',
      types,
    })
  }

  async create({ auth, inertia, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canManage(user)) {
      return response.forbidden()
    }

    return inertia.render('portal_booking_types/form', {
      pageTitle: 'New portal enquiry type',
      pageDescription: 'Create a tab and field set for client enquiries',
      bookingType: null,
      fieldMaps: [
        'destination',
        'depart_date',
        'return_date',
        'pax',
        'product_type',
        'notes_line',
        'custom',
      ],
      fieldTypes: ['text', 'number', 'date', 'textarea', 'select', 'checkbox', 'time', 'radio'],
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canManage(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(portalBookingTypeStoreValidator)

    const bookingType = await PortalBookingType.create({
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? null,
      sortOrder: payload.sortOrder ?? 0,
      isActive: payload.isActive ?? true,
    })

    session.flash('success', 'Portal enquiry type created')
    return response.redirect().toRoute('portal_booking_types.edit', { id: bookingType.id })
  }

  async edit({ auth, inertia, params, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canManage(user)) {
      return response.forbidden()
    }

    const bookingType = await PortalBookingTypeService.findForAdmin(Number(params.id))

    return inertia.render('portal_booking_types/form', {
      pageTitle: bookingType.name,
      pageDescription: 'Edit type details and enquiry fields',
      bookingType,
      fieldMaps: [
        'destination',
        'depart_date',
        'return_date',
        'pax',
        'product_type',
        'notes_line',
        'custom',
      ],
      fieldTypes: ['text', 'number', 'date', 'textarea', 'select', 'checkbox', 'time', 'radio'],
    })
  }

  async update({ auth, request, params, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canManage(user)) {
      return response.forbidden()
    }

    const bookingType = await PortalBookingType.findOrFail(params.id)
    const payload = await request.validateUsing(portalBookingTypeUpdateValidator)

    bookingType.merge({
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? null,
      sortOrder: payload.sortOrder ?? bookingType.sortOrder,
      isActive: payload.isActive ?? bookingType.isActive,
    })
    await bookingType.save()

    session.flash('success', 'Portal enquiry type updated')
    return response.redirect().toRoute('portal_booking_types.edit', { id: bookingType.id })
  }

  async storeField({ auth, request, params, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canManage(user)) {
      return response.forbidden()
    }

    await PortalBookingType.findOrFail(params.id)
    const payload = await request.validateUsing(portalBookingFieldStoreValidator)

    await PortalBookingField.create({
      portalBookingTypeId: Number(params.id),
      fieldKey: payload.fieldKey,
      label: payload.label,
      fieldType: payload.fieldType,
      placeholder: payload.placeholder ?? null,
      required: payload.required ?? false,
      options: parseOptions(payload.options),
      sortOrder: payload.sortOrder ?? 0,
      mapsTo: payload.mapsTo,
    })

    session.flash('success', 'Field added')
    return response.redirect().toRoute('portal_booking_types.edit', { id: params.id })
  }

  async updateField({ auth, request, params, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canManage(user)) {
      return response.forbidden()
    }

    const field = await PortalBookingField.query()
      .where('id', params.fieldId)
      .where('portal_booking_type_id', params.id)
      .firstOrFail()

    const payload = await request.validateUsing(portalBookingFieldUpdateValidator)

    field.merge({
      fieldKey: payload.fieldKey,
      label: payload.label,
      fieldType: payload.fieldType,
      placeholder: payload.placeholder ?? null,
      required: payload.required ?? false,
      options: parseOptions(payload.options),
      sortOrder: payload.sortOrder ?? field.sortOrder,
      mapsTo: payload.mapsTo,
    })
    await field.save()

    session.flash('success', 'Field updated')
    return response.redirect().toRoute('portal_booking_types.edit', { id: params.id })
  }

  async destroyField({ auth, params, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canManage(user)) {
      return response.forbidden()
    }

    const field = await PortalBookingField.query()
      .where('id', params.fieldId)
      .where('portal_booking_type_id', params.id)
      .firstOrFail()

    await field.delete()

    session.flash('success', 'Field removed')
    return response.redirect().toRoute('portal_booking_types.edit', { id: params.id })
  }
}
