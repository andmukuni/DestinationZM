import RecoveryReportItem from '#models/recovery_report_item'
import Document from '#models/document'
import app from '@adonisjs/core/services/app'
import type { RecoveryItemDocumentsContext } from '#services/recovery_reporting_service'
import PortalContextService from '#services/portal_context_service'
import PortalPrivilegeService from '#services/portal_privilege_service'
import RecoveryReportingService from '#services/recovery_reporting_service'
import {
  recoveryClientQueryValidator,
  recoveryClientRejectValidator,
  recoveryItemQueryValidator,
} from '#validators/recovery_reporting_validator'
import { RECOVERY_ITEM_STATUS_LABELS } from '#types/recovery_reporting'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

/** Internal-only statuses; client-visible items include pre-send workflow states. */
const PORTAL_HIDDEN_STATUSES = ['DRAFT', 'VOID'] as const

function serializePortalItem(item: RecoveryReportItem) {
  return {
    id: item.id,
    recoveryReference: item.recoveryReference,
    bookingId: item.bookingId,
    bookingReference: item.booking?.reference ?? '—',
    productType: item.productType,
    travelerName: item.travelerName,
    pnr: item.pnr ?? '—',
    itineraryService: item.itineraryService ?? '—',
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

function serializePortalItemWithDocuments(
  item: RecoveryReportItem,
  documents: RecoveryItemDocumentsContext | undefined
) {
  return {
    ...serializePortalItem(item),
    invoice: documents?.invoice ?? null,
    quotation: documents?.quotation ?? null,
    lineItemCount:
      documents && item.booking
        ? RecoveryReportingService.travelLineItemCount(item, item.booking, documents)
        : 0,
  }
}

function applyPortalSearchFilter(
  query: ReturnType<typeof RecoveryReportItem.query>,
  search: string | undefined
) {
  if (!search) {
    return
  }

  query.where((builder) => {
    builder
      .whereILike('recovery_reference', `%${search}%`)
      .orWhereILike('traveler_name', `%${search}%`)
      .orWhereILike('pnr', `%${search}%`)
      .orWhereILike('invoice_receipt_number', `%${search}%`)
  })
}

function portalRecoveryQuery(customerId: number) {
  return RecoveryReportItem.query()
    .where('customer_id', customerId)
    .whereNotIn('recovery_status', [...PORTAL_HIDDEN_STATUSES])
}

async function queryPortalItems(
  customerId: number,
  payload: Awaited<ReturnType<typeof recoveryItemQueryValidator.validate>>,
  options: { forExport?: boolean } = {}
) {
  const query = portalRecoveryQuery(customerId)

  if (!options.forExport) {
    query.preload('booking')
  }

  if (payload.status) {
    query.where('recovery_status', payload.status)
  }

  applyPortalSearchFilter(query, payload.search)

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

  query.orderBy(
    options.forExport ? 'created_at' : 'sent_to_client_at',
    options.forExport ? 'asc' : 'desc'
  )

  const items = await query

  return { items, startDate, endDate }
}

function itemBelongsToCustomer(item: RecoveryReportItem, customerId: number) {
  return item.customerId === customerId
}

export default class PortalRecoveryReportsController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'view_recovery_reports')) {
      return response.forbidden()
    }

    const context = await PortalContextService.fromAccount(account)
    const payload = await request.validateUsing(recoveryItemQueryValidator)

    const { items } = await queryPortalItems(context.organizationCustomerId, payload)
    const documentsByItemId = await RecoveryReportingService.documentsContextByItemId(items)

    return inertia.render('portal/recovery_reports/index', {
      pageTitle: 'Recovery Reports',
      pageDescription: context.organization.name,
      filters: {
        search: payload.search ?? '',
        status: payload.status ?? null,
      },
      canExport: PortalPrivilegeService.has(account, 'export_recovery_reports'),
      reports: items.map((item) =>
        serializePortalItemWithDocuments(item, documentsByItemId.get(item.id))
      ),
    })
  }

  async show({ auth, inertia, params, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'view_recovery_reports')) {
      return response.forbidden()
    }

    const context = await PortalContextService.fromAccount(account)

    const item = await RecoveryReportItem.query()
      .where('id', params.id)
      .preload('booking')
      .preload('supplierInvoiceDocument')
      .preload('auditLogs', (q) => q.orderBy('performed_at', 'desc'))
      .firstOrFail()

    if (!itemBelongsToCustomer(item, context.organizationCustomerId)) {
      return response.forbidden()
    }

    if (
      PORTAL_HIDDEN_STATUSES.includes(
        item.recoveryStatus as (typeof PORTAL_HIDDEN_STATUSES)[number]
      )
    ) {
      return response.notFound()
    }

    if (item.recoveryStatus === 'SENT_TO_CLIENT') {
      item.recoveryStatus = 'UNDER_CLIENT_REVIEW'
      item.clientReviewedAt = DateTime.now()
      await item.save()
    }

    const tableItems = item.recoveryReportId
      ? await RecoveryReportItem.query()
          .where('recovery_report_id', item.recoveryReportId)
          .where('customer_id', context.organizationCustomerId)
          .preload('booking')
          .orderBy('id', 'asc')
      : [item]

    const documentsByItemId = await RecoveryReportingService.documentsContextByItemId(tableItems)
    const travelItemsTable = RecoveryReportingService.buildTravelItemsTableForRecoveryItems(
      tableItems,
      documentsByItemId
    )
    const documents = documentsByItemId.get(item.id)

    return inertia.render('portal/recovery_reports/show', {
      item: {
        ...serializePortalItem(item),
        tripName: item.tripName ?? '—',
        tripReason: item.tripReason ?? '—',
        generalLedgerAccount: item.generalLedgerAccount ?? '—',
        dateRequested: item.dateRequested?.toFormat('dd LLL yyyy') ?? '—',
        travelStart: item.travelStart?.toFormat('dd LLL yyyy') ?? '—',
        travelEnd: item.travelEnd?.toFormat('dd LLL yyyy') ?? '—',
        clientQuery: item.clientQuery,
        rejectionReason: item.rejectionReason,
        invoiceDocumentId: item.supplierInvoiceDocumentId,
      },
      invoice: documents?.invoice ?? null,
      quotation: documents?.quotation ?? null,
      auditLogs: item.auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        description: log.description,
        performedAt: log.performedAt.toFormat('dd LLL yyyy HH:mm'),
      })),
      canApprove: PortalPrivilegeService.has(account, 'approve_recovery_reports'),
      canQuery: PortalPrivilegeService.has(account, 'query_recovery_reports'),
      canReject: PortalPrivilegeService.has(account, 'reject_recovery_reports'),
      travelItemsTable: {
        ...travelItemsTable,
        currentItemId: item.id,
      },
    })
  }

  async downloadDocument({ auth, params, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'view_recovery_reports')) {
      return response.forbidden()
    }

    const context = await PortalContextService.fromAccount(account)
    const item = await RecoveryReportItem.findOrFail(params.id)

    if (
      !itemBelongsToCustomer(item, context.organizationCustomerId) ||
      !item.supplierInvoiceDocumentId
    ) {
      return response.notFound()
    }

    const document = await Document.findOrFail(item.supplierInvoiceDocumentId)
    const absolutePath = app.makePath('storage/app', document.filePath)

    return response.download(absolutePath)
  }

  async approve({ auth, params, response, session }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'approve_recovery_reports')) {
      return response.forbidden()
    }

    const context = await PortalContextService.fromAccount(account)
    const item = await RecoveryReportItem.query().where('id', params.id).firstOrFail()

    if (!itemBelongsToCustomer(item, context.organizationCustomerId)) {
      return response.forbidden()
    }

    await RecoveryReportingService.clientApprove(item, { clientAccountId: account.id })
    session.flash('success', 'Recovery item approved.')
    return response.redirect().back()
  }

  async query({ auth, params, request, response, session }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'query_recovery_reports')) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(recoveryClientQueryValidator)
    const context = await PortalContextService.fromAccount(account)
    const item = await RecoveryReportItem.query().where('id', params.id).firstOrFail()

    if (!itemBelongsToCustomer(item, context.organizationCustomerId)) {
      return response.forbidden()
    }

    await RecoveryReportingService.clientQuery(item, payload.query, { clientAccountId: account.id })
    session.flash('success', 'Query submitted.')
    return response.redirect().back()
  }

  async reject({ auth, params, request, response, session }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'reject_recovery_reports')) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(recoveryClientRejectValidator)
    const context = await PortalContextService.fromAccount(account)
    const item = await RecoveryReportItem.query().where('id', params.id).firstOrFail()

    if (!itemBelongsToCustomer(item, context.organizationCustomerId)) {
      return response.forbidden()
    }

    await RecoveryReportingService.clientReject(item, payload.reason, {
      clientAccountId: account.id,
    })
    session.flash('success', 'Recovery item rejected.')
    return response.redirect().back()
  }

  async export({ auth, request, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'export_recovery_reports')) {
      return response.forbidden()
    }

    const context = await PortalContextService.fromAccount(account)
    const payload = await request.validateUsing(recoveryItemQueryValidator)
    const { items, startDate, endDate } = await queryPortalItems(
      context.organizationCustomerId,
      payload,
      {
        forExport: true,
      }
    )
    const exportResult = await RecoveryReportingService.exportItemsToExcel(items, {
      startDate,
      endDate,
    })

    response.header('Content-Type', exportResult.mimeType)
    response.header('Content-Disposition', `attachment; filename="${exportResult.fileName}"`)
    return response.send(exportResult.buffer)
  }

  async exportPdf({ auth, request, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'export_recovery_reports')) {
      return response.forbidden()
    }

    const context = await PortalContextService.fromAccount(account)
    const payload = await request.validateUsing(recoveryItemQueryValidator)
    const { items, startDate, endDate } = await queryPortalItems(
      context.organizationCustomerId,
      payload,
      {
        forExport: true,
      }
    )
    const exportResult = await RecoveryReportingService.exportItemsToPdf(items, {
      startDate,
      endDate,
    })

    response.header('Content-Type', exportResult.mimeType)
    response.header('Content-Disposition', `attachment; filename="${exportResult.fileName}"`)
    return response.send(exportResult.buffer)
  }
}
