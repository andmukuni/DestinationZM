import { DateTime } from 'luxon'
import RecoveryReportItem from '#models/recovery_report_item'
import AuthorizationService from '#services/authorization_service'
import type { RecoveryItemDocumentsContext } from '#services/recovery_reporting_service'
import RecoveryReportingService from '#services/recovery_reporting_service'
import {
  recoveryItemQueryValidator,
} from '#validators/recovery_reporting_validator'
import { RECOVERY_ITEM_STATUS_LABELS } from '#types/recovery_reporting'
import type { HttpContext } from '@adonisjs/core/http'

const TAB_STATUS_MAP: Record<string, string | null> = {
  all: null,
  pending_invoice: 'PENDING_INVOICE',
  ready: 'READY_FOR_CLIENT',
  sent: 'SENT_TO_CLIENT',
  queried: 'QUERY_RAISED',
  approved: 'APPROVED_BY_CLIENT',
  recovered: 'RECOVERED',
  rejected: 'REJECTED',
}

function canViewRecovery(user: Parameters<typeof AuthorizationService.can>[0]) {
  return (
    AuthorizationService.can(user, 'recovery_reports.view') ||
    AuthorizationService.can(user, 'invoices.manage')
  )
}

function canManageRecovery(user: Parameters<typeof AuthorizationService.can>[0]) {
  return (
    AuthorizationService.can(user, 'recovery_reports.manage') ||
    AuthorizationService.can(user, 'invoices.manage')
  )
}

function serializeItem(item: RecoveryReportItem) {
  return {
    id: item.id,
    recoveryReference: item.recoveryReference,
    bookingId: item.bookingId,
    bookingReference: item.booking?.reference ?? '—',
    customerName: item.customer?.fullName ?? '—',
    productType: item.productType,
    travelerName: item.travelerName,
    pnr: item.pnr ?? '—',
    supplierName: item.supplierName ?? item.supplier?.name ?? '—',
    invoiceReceiptNumber: item.invoiceReceiptNumber ?? '—',
    price: Number(item.price),
    currency: item.currency,
    costCenter: item.costCenter ?? '—',
    approvedBy: item.approvedBy ?? '—',
    recoveryStatus: item.recoveryStatus,
    recoveryStatusLabel: RECOVERY_ITEM_STATUS_LABELS[item.recoveryStatus],
    sentToClientAt: item.sentToClientAt?.toFormat('dd LLL yyyy HH:mm') ?? '—',
    hasInvoiceDocument: Boolean(item.supplierInvoiceDocumentId),
  }
}

function serializeItemWithDocuments(
  item: RecoveryReportItem,
  documents: RecoveryItemDocumentsContext | undefined
) {
  return {
    ...serializeItem(item),
    invoice: documents?.invoice ?? null,
    quotation: documents?.quotation ?? null,
    lineItemCount:
      documents && item.booking
        ? RecoveryReportingService.travelLineItemCount(item, item.booking, documents)
        : 0,
  }
}

function emptyDocumentsContext(item: RecoveryReportItem): RecoveryItemDocumentsContext {
  return {
    invoice: null,
    quotation: null,
    lineItems: [],
    currency: item.currency,
    subtotal: 0,
    taxAmount: 0,
    totalAmount: Number(item.price),
  }
}

async function queryExportItems(
  user: Parameters<typeof AuthorizationService.branchIdFor>[0],
  payload: Awaited<ReturnType<typeof recoveryItemQueryValidator.validate>>
) {
  const userBranchId = AuthorizationService.branchIdFor(user)
  const status = payload.status ?? TAB_STATUS_MAP[payload.tab ?? 'all'] ?? null

  const query = RecoveryReportItem.query().orderBy('created_at', 'asc')
  if (userBranchId) {
    query.where('branch_id', userBranchId)
  }

  if (status) {
    query.where('recovery_status', status)
  }

  if (payload.search) {
    query.where((builder) => {
      builder
        .whereILike('recovery_reference', `%${payload.search}%`)
        .orWhereILike('traveler_name', `%${payload.search}%`)
        .orWhereILike('pnr', `%${payload.search}%`)
        .orWhereILike('invoice_receipt_number', `%${payload.search}%`)
    })
  }

  if (payload.recoveryItemId) {
    query.where('id', payload.recoveryItemId)
  }

  const startDate = payload.startDate ? DateTime.fromISO(payload.startDate) : null
  const endDate = payload.endDate ? DateTime.fromISO(payload.endDate) : null
  if (startDate) {
    query.where('created_at', '>=', startDate.toSQL()!)
  }
  if (endDate) {
    query.where('created_at', '<', endDate.plus({ days: 1 }).toSQL()!)
  }

  const items = await query

  return { items, startDate, endDate }
}

function sendExportResponse(
  response: HttpContext['response'],
  exportResult: { buffer: Buffer; fileName: string; mimeType: string }
) {
  response.header('Content-Type', exportResult.mimeType)
  response.header('Content-Disposition', `attachment; filename="${exportResult.fileName}"`)
  return response.send(exportResult.buffer)
}


export default class RecoveryReportsController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewRecovery(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(recoveryItemQueryValidator)
    const userBranchId = AuthorizationService.branchIdFor(user)
    const status = payload.status ?? TAB_STATUS_MAP[payload.tab ?? 'all'] ?? null

    const query = RecoveryReportItem.query()
      .preload('booking')
      .preload('customer')
      .preload('supplier')
      .orderBy('created_at', 'desc')

    if (userBranchId) {
      query.where('branch_id', userBranchId)
    }

    if (status) {
      query.where('recovery_status', status)
    }

    if (payload.search) {
      query.where((builder) => {
        builder
          .whereILike('recovery_reference', `%${payload.search}%`)
          .orWhereILike('traveler_name', `%${payload.search}%`)
          .orWhereILike('pnr', `%${payload.search}%`)
          .orWhereILike('invoice_receipt_number', `%${payload.search}%`)
      })
    }

    const items = await query
    const documentsByItemId = await RecoveryReportingService.documentsContextByItemId(items)

    return inertia.render('recovery_reports/index', {
      pageTitle: 'Recovery Reporting',
      pageDescription: 'Recover supplier payments made on behalf of clients',
      filters: {
        search: payload.search ?? '',
        status,
      },
      canManage: canManageRecovery(user),
      reports: items.map((item) => serializeItemWithDocuments(item, documentsByItemId.get(item.id))),
    })
  }

  async showItem({ auth, inertia, params, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewRecovery(user)) {
      return response.forbidden()
    }

    const item = await RecoveryReportItem.query()
      .where('id', params.id)
      .preload('booking')
      .preload('customer')
      .preload('supplier')
      .preload('supplierInvoiceDocument')
      .preload('auditLogs', (q) => q.orderBy('performed_at', 'desc'))
      .firstOrFail()

    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && item.branchId !== userBranchId) {
      return response.forbidden()
    }

    const documentsByItemId = await RecoveryReportingService.documentsContextByItemId([item])
    const documents = documentsByItemId.get(item.id)

    return inertia.render('recovery_reports/show_item', {
      item: {
        ...serializeItem(item),
        itineraryService: item.itineraryService ?? '—',
        tripName: item.tripName ?? '—',
        tripReason: item.tripReason ?? '—',
        generalLedgerAccount: item.generalLedgerAccount ?? '—',
        dateRequested: item.dateRequested?.toFormat('dd LLL yyyy') ?? '—',
        travelStart: item.travelStart?.toFormat('dd LLL yyyy') ?? '—',
        travelEnd: item.travelEnd?.toFormat('dd LLL yyyy') ?? '—',
        dzPaymentStatus: item.dzPaymentStatus,
        dzPaymentDate: item.dzPaymentDate?.toFormat('dd LLL yyyy') ?? '—',
        dzPaymentReference: item.dzPaymentReference ?? '—',
        amountPaidByDz: Number(item.amountPaidByDz),
        clientQuery: item.clientQuery,
        rejectionReason: item.rejectionReason,
        invoiceDocumentId: item.supplierInvoiceDocumentId,
      },
      invoice: documents?.invoice ?? null,
      quotation: documents?.quotation ?? null,
      travelItemsTable: RecoveryReportingService.buildTravelItemsTableForRecoveryItem(
        item,
        item.booking,
        documents ?? emptyDocumentsContext(item)
      ),
      auditLogs: item.auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        oldStatus: log.oldStatus,
        newStatus: log.newStatus,
        description: log.description,
        performedAt: log.performedAt.toFormat('dd LLL yyyy HH:mm'),
      })),
      canManage: canManageRecovery(user),
    })
  }

  async sendToClient({ auth, params, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canManageRecovery(user)) {
      return response.forbidden()
    }

    const item = await RecoveryReportItem.findOrFail(params.id)
    await RecoveryReportingService.sendToClient(item, { userId: user.id })
    session.flash('success', 'Recovery item sent to client.')
    return response.redirect().back()
  }

  async markRecovered({ auth, params, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canManageRecovery(user)) {
      return response.forbidden()
    }

    const item = await RecoveryReportItem.findOrFail(params.id)
    await RecoveryReportingService.markRecovered(item, { userId: user.id })
    session.flash('success', 'Recovery item marked as recovered.')
    return response.redirect().back()
  }

  async export({ auth, request, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewRecovery(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(recoveryItemQueryValidator)
    const { items, startDate, endDate } = await queryExportItems(user, payload)
    const exportResult = await RecoveryReportingService.exportItemsToExcel(items, {
      startDate,
      endDate,
    })

    return sendExportResponse(response, exportResult)
  }

  async exportPdf({ auth, request, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewRecovery(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(recoveryItemQueryValidator)
    const { items, startDate, endDate } = await queryExportItems(user, payload)
    const exportResult = await RecoveryReportingService.exportItemsToPdf(items, {
      startDate,
      endDate,
    })

    return sendExportResponse(response, exportResult)
  }

  async weeklyExport({ auth, request, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewRecovery(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(recoveryItemQueryValidator)
    const customerId = payload.customerId
    if (!customerId) {
      return response.badRequest('customerId is required for weekly export.')
    }

    const userBranchId = AuthorizationService.branchIdFor(user) ?? (await RecoveryReportItem.query().first())?.branchId
    if (!userBranchId) {
      return response.badRequest('No branch available for export.')
    }

    const { batch, items } = await RecoveryReportingService.createWeeklyBatch(
      customerId,
      userBranchId,
      user.id
    )

    const { buffer, fileName, mimeType } = await RecoveryReportingService.exportItemsToExcel(items, {
      startDate: batch.reportPeriodStart,
      endDate: batch.reportPeriodEnd,
    })

    response.header('Content-Type', mimeType)
    response.header('Content-Disposition', `attachment; filename="${fileName}"`)
    return response.send(buffer)
  }
}
