import Branch from '#models/branch'
import Booking from '#models/booking'
import Customer from '#models/customer'
import Document from '#models/document'
import Invoice from '#models/invoice'
import Quotation from '#models/quotation'
import RecoveryReportItem from '#models/recovery_report_item'
import Supplier from '#models/supplier'
import User from '#models/user'
import AuthorizationService from '#services/authorization_service'
import BookingService from '#services/booking_service'
import DocumentService from '#services/document_service'
import PortalBookingTypeService from '#services/portal_booking_type_service'
import WorkflowService from '#services/workflow_service'
import { bookingConfirmValidator, bookingSupplierPaymentValidator } from '#validators/recovery_reporting_validator'
import { DateTime } from 'luxon'
import { readFile } from 'node:fs/promises'
import { BOOKING_STATUS_LABELS } from '#types/booking_status'
import { bookingStoreValidator } from '#validators/booking_validator'
import type { HttpContext } from '@adonisjs/core/http'

function canViewBookings(user: Parameters<typeof AuthorizationService.can>[0]) {
  return (
    AuthorizationService.can(user, 'bookings.view') ||
    AuthorizationService.can(user, 'bookings.manage')
  )
}

export default class BookingsController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!canViewBookings(user)) {
      return response.forbidden()
    }

    const search = String(request.qs().search ?? '').trim()
    const statusFilter = request.qs().status ? String(request.qs().status) : null
    const userBranchId = AuthorizationService.branchIdFor(user)
    const filterBranchId = request.qs().branchId ? Number(request.qs().branchId) : null
    const branchId = userBranchId ?? filterBranchId ?? null

    const query = Booking.query()
      .preload('customer')
      .preload('branch')
      .preload('assignedUser')
      .orderBy('depart_date', 'desc')

    if (userBranchId) {
      query.where('branch_id', userBranchId)
    } else if (branchId) {
      query.where('branch_id', branchId)
    }

    if (statusFilter && statusFilter in BOOKING_STATUS_LABELS) {
      query.where('status', statusFilter)
    }

    if (search) {
      query.where((bookingQuery) => {
        bookingQuery
          .whereILike('reference', `%${search}%`)
          .orWhereILike('destination', `%${search}%`)
      })
    }

    const bookings = await query
    const branches = userBranchId
      ? []
      : await Branch.query().orderBy('name', 'asc').select('id', 'name')

    return inertia.render('bookings/index', {
      filters: { search, status: statusFilter, branchId: branchId ?? null },
      branches: branches.map((b) => ({ id: b.id, name: b.name })),
      bookings: bookings.map((b) => ({
        id: b.id,
        reference: b.reference,
        customer: b.customer?.fullName ?? 'Unknown',
        destination: b.destination,
        departDate: b.departDate.toFormat('dd LLL yyyy'),
        returnDate: b.returnDate?.toFormat('dd LLL yyyy') ?? '—',
        status: b.status,
        statusLabel: BOOKING_STATUS_LABELS[b.status],
        totalAmount: b.totalAmount,
        currency: b.currency,
        branch: b.branch?.name ?? '—',
        agent: b.assignedUser?.fullName ?? 'Unassigned',
      })),
    })
  }

  async show({ auth, inertia, params, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!canViewBookings(user)) {
      return response.forbidden()
    }

    const booking = await Booking.query()
      .where('id', params.id)
      .preload('customer')
      .preload('branch')
      .preload('assignedUser')
      .preload('items', (q) => q.preload('supplier'))
      .preload('quotations')
      .preload('invoices')
      .firstOrFail()

    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && booking.branchId !== userBranchId) {
      return response.forbidden()
    }

    const latestQuotation = await Quotation.query()
      .where('booking_id', booking.id)
      .orderBy('id', 'desc')
      .first()
    const latestRecoveryItem = await RecoveryReportItem.findBy('booking_id', booking.id)
    const latestInvoice = await Invoice.query()
      .where('booking_id', booking.id)
      .orderBy('id', 'desc')
      .first()
    const steps = await WorkflowService.stepsForBooking(booking)
    const documentCount = await Document.query()
      .where('reference_type', 'booking')
      .where('reference_id', booking.id)
      .count('* as total')

    const canManageBookings = AuthorizationService.can(user, 'bookings.manage')
    const canManageQuotations = AuthorizationService.can(user, 'quotations.manage')
    const canManageInvoices = AuthorizationService.can(user, 'invoices.manage')
    const suppliers = canManageBookings
      ? await Supplier.query()
          .if(Boolean(booking.branchId), (q) => q.where('branch_id', booking.branchId!))
          .orderBy('name', 'asc')
          .select('id', 'name')
      : []

    const supplierPaid = await WorkflowService.hasSupplierPayment(booking)
    const enquiryDetails = await PortalBookingTypeService.enquiryDetailsForBooking(booking)

    return inertia.render('bookings/show', {
      booking: {
        id: booking.id,
        reference: booking.reference,
        customer: booking.customer
          ? { id: booking.customer.id, fullName: booking.customer.fullName }
          : null,
        destination: booking.destination,
        departDate: booking.departDate.toFormat('dd LLL yyyy'),
        returnDate: booking.returnDate?.toFormat('dd LLL yyyy') ?? null,
        pax: booking.pax,
        status: booking.status,
        statusLabel:
          BOOKING_STATUS_LABELS[booking.status as keyof typeof BOOKING_STATUS_LABELS] ??
          booking.status,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        notes: booking.notes,
        branch: booking.branch?.name ?? '—',
        agent: booking.assignedUser?.fullName ?? 'Unassigned',
        confirmedAt: booking.confirmedAt?.toFormat('dd LLL yyyy HH:mm') ?? null,
        productType: booking.productType,
        pnr: booking.pnr,
        travelerName: booking.travelerName,
        itineraryService: booking.itineraryService,
        tripName: booking.tripName,
        tripReason: booking.tripReason,
        costCenter: booking.costCenter,
        dateRequested: booking.dateRequested?.toISODate() ?? '',
        approvedBy: booking.approvedBy,
        generalLedgerAccount: booking.generalLedgerAccount,
        supplierId: booking.supplierId,
        invoiceReceiptNumber: booking.invoiceReceiptNumber,
        dzPaymentStatus: booking.dzPaymentStatus ?? 'NOT_PAID',
        dzPaymentDate: booking.dzPaymentDate?.toISODate() ?? '',
        dzPaymentReference: booking.dzPaymentReference,
        amountPaidByDz: booking.amountPaidByDz,
        items: booking.items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          supplier: item.supplier?.name ?? null,
        })),
        quotations: booking.quotations.map((q) => ({
          id: q.id,
          reference: q.reference,
          status: q.status,
          totalAmount: q.totalAmount,
        })),
        invoices: booking.invoices.map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          status: inv.status,
          totalAmount: inv.totalAmount,
        })),
      },
      steps,
      latestQuotation: latestQuotation
        ? {
            id: latestQuotation.id,
            reference: latestQuotation.reference,
            status: latestQuotation.status,
          }
        : null,
      latestRecoveryItem: latestRecoveryItem
        ? {
            id: latestRecoveryItem.id,
            reference: latestRecoveryItem.recoveryReference,
            status: latestRecoveryItem.recoveryStatus,
          }
        : null,
      suppliers: suppliers.map((s) => ({ id: s.id, name: s.name })),
      latestInvoice: latestInvoice
        ? {
            id: latestInvoice.id,
            invoiceNumber: latestInvoice.invoiceNumber,
            status: latestInvoice.status,
          }
        : null,
      hasWorkflowCycle: booking.quotations.some((q) => q.status === 'client_approved'),
      enquiryDetails,
      backOffice: {
        documentCount: Number(documentCount[0].$extras.total),
        recoveryItemCount: latestRecoveryItem ? 1 : 0,
        supplierItemCount: booking.items.length,
        showPanel: ['paid', 'closed', 'invoiced'].includes(booking.status),
      },
      actions: {
        canCreateQuotation:
          canManageQuotations && WorkflowService.canCreateQuotation(booking.status as never),
        canSendQuotation:
          canManageQuotations &&
          latestQuotation?.status === 'draft' &&
          WorkflowService.canSendQuotation(booking.status as never),
        canConfirmBooking:
          canManageBookings && WorkflowService.canConfirmBooking(booking.status as never),
        canRecordSupplierPayment:
          canManageBookings &&
          WorkflowService.canRecordSupplierPayment(booking.status as never) &&
          !supplierPaid,
        canSendRecoveryItem:
          canManageInvoices && latestRecoveryItem?.recoveryStatus === 'READY_FOR_CLIENT',
        canCreateInvoice:
          canManageInvoices &&
          (await WorkflowService.canCreateInvoiceForBooking(booking.id)) &&
          !latestInvoice,
        canIssueInvoice: canManageInvoices && latestInvoice?.status === 'draft',
        canManageBookings,
      },
    })
  }

  async create({ auth, inertia, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.can(user, 'bookings.manage')) {
      return response.forbidden()
    }

    const branchId = AuthorizationService.branchIdFor(user)
    const branches = await Branch.query().orderBy('name', 'asc')
    const scopedBranches = branchId ? branches.filter((b) => b.id === branchId) : branches

    const customerQuery = Customer.query().orderBy('full_name', 'asc')
    if (branchId) {
      customerQuery.where('branch_id', branchId)
    }
    const customers = await customerQuery

    const agentQuery = User.query().orderBy('full_name', 'asc')
    if (branchId) {
      agentQuery.where('branch_id', branchId)
    }
    const agents = await agentQuery

    return inertia.render('bookings/create', {
      branches: scopedBranches.map((b) => ({ id: b.id, name: b.name })),
      customers: customers.map((c) => ({ id: c.id, fullName: c.fullName })),
      agents: agents.map((a) => ({ id: a.id, fullName: a.fullName ?? a.email })),
      defaultBranchId: branchId,
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.can(user, 'bookings.manage')) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(bookingStoreValidator)
    const userBranchId = AuthorizationService.branchIdFor(user)
    const branchId = userBranchId ?? payload.branchId ?? null

    if (!branchId) {
      session.flash('error', 'Office is required')
      return response.redirect().back()
    }

    const customer = await Customer.findOrFail(payload.customerId)
    if (userBranchId && customer.branchId !== userBranchId) {
      return response.forbidden()
    }

    const booking = await BookingService.create({
      customerId: payload.customerId,
      branchId,
      assignedUserId: payload.assignedUserId ?? user.id,
      destination: payload.destination,
      departDate: payload.departDate,
      returnDate: payload.returnDate ?? null,
      pax: payload.pax,
      totalAmount: payload.totalAmount,
      currency: payload.currency,
      notes: payload.notes ?? null,
      userId: user.id,
      ipAddress: request.ip(),
    })

    session.flash('success', 'Enquiry created successfully')
    return response.redirect().toRoute('bookings.show', { id: booking.id })
  }

  async confirm({ auth, params, request, response, session }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.can(user, 'bookings.manage')) {
      return response.forbidden()
    }

    const booking = await Booking.findOrFail(params.id)
    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && booking.branchId !== userBranchId) {
      return response.forbidden()
    }

    if (!WorkflowService.canConfirmBooking(booking.status)) {
      session.flash('error', 'Enquiry must have client-approved quotation before confirmation.')
      return response.redirect().back()
    }

    const payload = await request.validateUsing(bookingConfirmValidator)
    booking.merge({
      productType: payload.productType ?? booking.productType,
      pnr: payload.pnr ?? booking.pnr,
      travelerName: payload.travelerName ?? booking.travelerName,
      itineraryService: payload.itineraryService ?? booking.itineraryService ?? booking.destination,
      tripName: payload.tripName ?? booking.tripName,
      tripReason: payload.tripReason ?? booking.tripReason,
      costCenter: payload.costCenter ?? booking.costCenter,
      dateRequested: payload.dateRequested ? DateTime.fromISO(payload.dateRequested) : booking.dateRequested,
      approvedBy: payload.approvedBy ?? booking.approvedBy,
      generalLedgerAccount: payload.generalLedgerAccount ?? booking.generalLedgerAccount,
      supplierId: payload.supplierId ?? booking.supplierId,
    })
    await booking.save()

    await BookingService.confirm(booking, { userId: user.id, ipAddress: request.ip() })

    session.flash('success', 'Enquiry confirmed successfully')
    return response.redirect().toRoute('bookings.show', { id: booking.id })
  }

  async recordSupplierPayment({ auth, params, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.can(user, 'bookings.manage')) {
      return response.forbidden()
    }

    const booking = await Booking.findOrFail(params.id)
    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && booking.branchId !== userBranchId) {
      return response.forbidden()
    }

    if (!WorkflowService.canRecordSupplierPayment(booking.status)) {
      session.flash('error', 'Supplier payment can only be recorded after the enquiry is confirmed.')
      return response.redirect().back()
    }

    const payload = await request.validateUsing(bookingSupplierPaymentValidator)
    const supplierInvoice = request.file('supplierInvoice', {
      size: '10mb',
      extnames: ['pdf', 'jpg', 'jpeg', 'png', 'xlsx', 'xls'],
    })

    booking.merge({
      invoiceReceiptNumber: payload.invoiceReceiptNumber,
      dzPaymentStatus: 'PAID',
      dzPaymentDate: payload.dzPaymentDate
        ? DateTime.fromISO(payload.dzPaymentDate)
        : DateTime.now(),
      dzPaymentReference: payload.dzPaymentReference ?? null,
      amountPaidByDz: payload.amountPaidByDz ?? booking.totalAmount,
    })
    await booking.save()

    if (supplierInvoice?.tmpPath) {
      const contents = await readFile(supplierInvoice.tmpPath)
      await DocumentService.store({
        documentType: 'supplier_document',
        title: `Supplier invoice — ${booking.reference}`,
        fileName: supplierInvoice.clientName,
        contents,
        mimeType: supplierInvoice.headers['content-type'] ?? 'application/octet-stream',
        referenceType: 'booking',
        referenceId: booking.id,
        uploadedById: user.id,
        branchId: booking.branchId,
      })
    }

    session.flash('success', 'Supplier payment recorded. You can now create the client invoice.')
    return response.redirect().toRoute('bookings.show', { id: booking.id })
  }
}
