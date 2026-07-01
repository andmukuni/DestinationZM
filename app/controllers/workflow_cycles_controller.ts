import RecoveryReportItem from '#models/recovery_report_item'
import Booking from '#models/booking'
import AuthorizationService from '#services/authorization_service'
import RecoveryReportingService from '#services/recovery_reporting_service'
import WorkflowCycleService from '#services/workflow_cycle_service'
import WorkflowService from '#services/workflow_service'
import type { HttpContext } from '@adonisjs/core/http'

const WORKFLOW_STAGE_IDS = new Set([
  'enquiry',
  'quotation',
  'confirmed',
  'supplier',
  'invoice',
  'recovery',
  'paid',
])

function canView(user: Parameters<typeof AuthorizationService.can>[0]) {
  return (
    AuthorizationService.can(user, 'bookings.view') ||
    AuthorizationService.can(user, 'bookings.manage')
  )
}

export default class WorkflowCyclesController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canView(user)) {
      return response.forbidden()
    }

    const search = String(request.qs().search ?? '').trim()
    const tab = request.qs().tab === 'completed' ? 'completed' : 'in_progress'
    const cycles =
      tab === 'completed'
        ? await WorkflowCycleService.list(user, { search: search || undefined })
        : await WorkflowCycleService.listIncomplete(user, { search: search || undefined })

    const incompleteCount = await WorkflowCycleService.incompleteCount(user)

    return inertia.render(
      'workflow_cycles/index',
      {
        pageTitle: 'Full workflow cycles',
        pageDescription:
          tab === 'completed'
            ? 'Enquiries that completed enquiry through quotation, supplier payment, client invoice, recovery report, and client payment'
            : 'Enquiries with an approved quotation still moving through the middleman workflow',
        filters: { search },
        incompleteCount,
        cycles,
      } as never
    )
  }

  async show({ auth, inertia, params, request, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canView(user)) {
      return response.forbidden()
    }

    const cycle = await WorkflowCycleService.findForUser(user, Number(params.id))
    if (!cycle) {
      return response.notFound()
    }

    const booking = await Booking.findOrFail(cycle.id)
    const steps = await WorkflowService.stepsForBooking(booking)
    const listTab = request.qs().tab === 'completed' ? 'completed' : 'in_progress'
    const stageParam = String(request.qs().stage ?? '').trim()
    const initialStage = WORKFLOW_STAGE_IDS.has(stageParam) ? stageParam : null

    const recoveryItem = await RecoveryReportItem.findBy('booking_id', booking.id)
    let travelItemsTable: {
      displayColumns: string[]
      rows: ReturnType<typeof RecoveryReportingService.serializeItemForTable>[]
      totalPrice: number
      currentItemId: number
    } | null = null

    if (recoveryItem) {
      await recoveryItem.load('booking')
      const documentsByItemId = await RecoveryReportingService.documentsContextByItemId([recoveryItem])
      const documents = documentsByItemId.get(recoveryItem.id)
      if (recoveryItem.booking && documents) {
        const table = RecoveryReportingService.buildTravelItemsTableForRecoveryItem(
          recoveryItem,
          recoveryItem.booking,
          documents
        )
        travelItemsTable = {
          displayColumns: table.displayColumns,
          rows: table.rows,
          totalPrice: table.totalPrice,
          currentItemId: recoveryItem.id,
        }
      }
    }

    return inertia.render(
      'workflow_cycles/show',
      {
        pageTitle: cycle.bookingReference,
        pageDescription: `${cycle.destination} · ${cycle.customer}`,
        cycle,
        steps,
        listTab,
        initialStage,
        travelDetails: WorkflowCycleService.mapTravelDetails(booking),
        travelItemsTable,
        canManageBookings: AuthorizationService.can(user, 'bookings.manage'),
      } as never
    )
  }
}
