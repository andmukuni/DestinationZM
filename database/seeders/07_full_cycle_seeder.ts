import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Booking from '#models/booking'
import Branch from '#models/branch'
import ClientAccount from '#models/client_account'
import Customer from '#models/customer'
import Invoice from '#models/invoice'
import RecoveryReportItem from '#models/recovery_report_item'
import Supplier from '#models/supplier'
import User from '#models/user'
import BookingService from '#services/booking_service'
import InvoiceService from '#services/invoice_service'
import QuotationService from '#services/quotation_service'
import RecoveryReportingService from '#services/recovery_reporting_service'
import type { PortalEnquiryCartItem } from '#services/portal_enquiry_cart_service'
import Quotation from '#models/quotation'
import {
  issueClientInvoiceForBooking,
  recordSupplierPaymentOnBooking,
} from '../helpers/middleman_workflow.js'

const SEED_MARKER = '[SEED:FULL-CYCLE]'

type SeedActors = {
  branchId: number
  customerId: number
  clientAccountId: number
  supplierId: number
  adminId: number | null
  reservationsId: number | null
  financeId: number | null
}

function travelPayload(suffix: string, supplierId: number, complete = true) {
  return {
    productType: 'flight' as const,
    pnr: `PNR-${suffix}`,
    travelerName: 'BANDA/CHANDA MS',
    itineraryService: 'LUN JNB LUN',
    tripName: `Corporate travel — ${suffix}`,
    tripReason: 'Business travel regional or international',
    costCenter: complete ? '3063 - CIB (CORPORATE HEAD OFFICE)' : null,
    dateRequested: DateTime.now().minus({ days: 3 }),
    approvedBy: complete ? 'Joseph Mudondo' : null,
    generalLedgerAccount: complete
      ? 'Travel Accom International (International Travel) 6322134'
      : null,
    supplierId,
  }
}

async function confirmBookingWithTravelDetails(
  booking: Booking,
  payload: ReturnType<typeof travelPayload>,
  userId: number | null
) {
  booking.merge({ ...payload, status: 'quotation_approved' as const })
  await booking.save()
  await BookingService.confirm(booking, { userId })
  await booking.refresh()

  if (!payload.costCenter) {
    booking.merge({
      costCenter: '3063 - CIB (CORPORATE HEAD OFFICE)',
      approvedBy: 'Joseph Mudondo',
      generalLedgerAccount: 'Travel Accom International (International Travel) 6322134',
    })
    await booking.save()
    await booking.refresh()
  }

  return booking
}

async function advanceThroughIssuedInvoice(booking: Booking, suffix: string, userId: number | null) {
  await recordSupplierPaymentOnBooking(booking, suffix, userId)
  return issueClientInvoiceForBooking(booking, userId)
}

async function seedQuotationFlow(booking: Booking, actors: SeedActors) {
  const quotation = await QuotationService.createFromBooking(booking, {
    createdById: actors.reservationsId ?? actors.adminId,
    userId: actors.adminId,
  })
  await QuotationService.send(quotation, { userId: actors.reservationsId ?? actors.adminId })
  await QuotationService.clientApprove(quotation, { clientAccountId: actors.clientAccountId })
  return quotation
}

export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    const branch = await Branch.findBy('code', 'LUS-HQ')
    const customer = await Customer.findBy('email', 'chanda.banda@example.com')
    const clientAccount = await ClientAccount.findBy('email', 'chanda.banda@example.com')
    const admin = await User.findBy('email', 'admin@destinationzm.local')
    const reservations = await User.findBy('email', 'reservations@destinationzm.local')
    const finance = await User.findBy('email', 'finance@destinationzm.local')

    if (!branch || !customer || !clientAccount) {
      return
    }

    const supplier =
      (await Supplier.findBy('code', 'SAF-LUA')) ??
      (await Supplier.create({
        name: 'Safari Lodge Luangwa',
        code: 'SAF-LUA',
        contactName: 'John Muleya',
        email: 'bookings@safari-luangwa.co.zm',
        phone: '+260 21 123 456',
        branchId: branch.id,
      }))

    const actors: SeedActors = {
      branchId: branch.id,
      customerId: customer.id,
      clientAccountId: clientAccount.id,
      supplierId: supplier.id,
      adminId: admin?.id ?? null,
      reservationsId: reservations?.id ?? null,
      financeId: finance?.id ?? null,
    }

    await this.seedMultiItemRecoverySentToClient(actors)
    await this.backfillQuotationLineItems()
    await this.ensureRecoveryItemsSentToClient(actors)
  }

  private async backfillQuotationLineItems() {
    const quotations = await Quotation.query().preload('booking').whereNotNull('booking_id')

    for (const quotation of quotations) {
      if ((quotation.lineItems?.items?.length ?? 0) > 0 || !quotation.booking) {
        continue
      }

      const draft = await QuotationService.buildDraftFromEnquiry(quotation.booking)
      quotation.merge({
        lineItems: { version: 1, items: draft.lineItems },
        subtotal: draft.subtotal,
        taxAmount: draft.taxAmount,
        totalAmount: draft.totalAmount,
      })
      await quotation.save()
    }
  }

  private async ensureRecoveryItemsSentToClient(actors: SeedActors) {
    const items = await RecoveryReportItem.query().where('recovery_status', 'READY_FOR_CLIENT')

    for (const item of items) {
      try {
        await RecoveryReportingService.sendToClient(item, { userId: actors.adminId })
      } catch {
        // Incomplete seed data stays ready for manual send from admin.
      }
    }
  }

  private buildMultiItemCart(): PortalEnquiryCartItem[] {
    return [
      {
        id: 'seed-flight',
        bookingTypeId: 1,
        typeName: 'Flights',
        tabLabel: 'Flights',
        slug: 'flight',
        destination: 'Lusaka to Johannesburg',
        departDate: DateTime.now().plus({ days: 20 }).toISODate() ?? '',
        returnDate: DateTime.now().plus({ days: 22 }).toISODate() ?? '',
        pax: 1,
        productType: 'flight',
        notes: 'Direct flight preferred',
        enquiryData: { pnr: 'MULTI-FLT', origin: 'Lusaka', destination: 'Johannesburg' },
        estimatedBudget: 6200,
        summaryLines: [
          { label: 'Route', value: 'Lusaka → Johannesburg' },
          { label: 'PNR', value: 'MULTI-FLT' },
        ],
      },
      {
        id: 'seed-hotel',
        bookingTypeId: 2,
        typeName: 'Hotels',
        tabLabel: 'Hotels',
        slug: 'accommodation',
        destination: 'Sandton City Hotel',
        departDate: DateTime.now().plus({ days: 20 }).toISODate() ?? '',
        returnDate: DateTime.now().plus({ days: 22 }).toISODate() ?? '',
        pax: 1,
        productType: 'hotel',
        notes: 'Executive room',
        enquiryData: { hotel_name: 'Sandton City Hotel' },
        estimatedBudget: 3800,
        summaryLines: [{ label: 'Hotel', value: 'Sandton City Hotel' }],
      },
    ]
  }

  private async seedMultiItemRecoverySentToClient(actors: SeedActors) {
    const marker = `${SEED_MARKER} multi-item-recovery`
    const existing = await this.findByMarker(marker)
    if (existing) {
      const item = await RecoveryReportItem.findBy('booking_id', existing.id)
      if (item && !['DRAFT', 'PENDING_INVOICE', 'READY_FOR_CLIENT', 'VOID'].includes(item.recoveryStatus)) {
        return
      }
      await this.resumeThroughInvoice(existing, 'MULTI-RCV', actors)
      await this.ensureRecoveryItemsSentToClient(actors)
      return
    }

    const booking = await BookingService.createEnquiryFromCart(this.buildMultiItemCart(), {
      customerId: actors.customerId,
      branchId: actors.branchId,
      currency: 'ZMW',
      userId: actors.adminId,
    })
    booking.merge({ notes: [booking.notes, marker].filter(Boolean).join(' ') })
    await booking.save()

    await seedQuotationFlow(booking, actors)
    await confirmBookingWithTravelDetails(
      booking,
      {
        ...travelPayload('MULTI-RCV', actors.supplierId, true),
        pnr: 'MULTI-FLT',
        itineraryService: 'Lusaka to Johannesburg + Sandton hotel',
      },
      actors.financeId ?? actors.adminId
    )
    await advanceThroughIssuedInvoice(booking, 'MULTI-RCV', actors.financeId ?? actors.adminId)
    await this.ensureRecoveryItemsSentToClient(actors)
  }

  private async findByMarker(marker: string) {
    return Booking.query().where('notes', 'like', `%${marker}%`).first()
  }

  private async resumeThroughInvoice(booking: Booking, suffix: string, actors: SeedActors) {
    const actorId = actors.financeId ?? actors.adminId
    if (booking.status === 'quotation_approved') {
      await confirmBookingWithTravelDetails(
        booking,
        travelPayload(suffix, actors.supplierId, false),
        actorId
      )
    }

    const invoice = await Invoice.query().where('booking_id', booking.id).whereNot('status', 'draft').first()
    if (invoice) {
      const recoveryItem = await RecoveryReportItem.findBy('booking_id', booking.id)
      return { invoice, recoveryItem: recoveryItem! }
    }

    return advanceThroughIssuedInvoice(booking, suffix, actorId)
  }

  private async seedQuotationPending(actors: SeedActors) {
    const marker = `${SEED_MARKER} quotation-pending`
    if (await this.findByMarker(marker)) {
      return
    }

    const booking = await BookingService.createEnquiry({
      customerId: actors.customerId,
      branchId: actors.branchId,
      destination: 'Livingstone conference',
      departDate: DateTime.now().plus({ days: 18 }),
      returnDate: DateTime.now().plus({ days: 21 }),
      pax: 2,
      totalAmount: 14200,
      currency: 'ZMW',
      notes: marker,
      userId: actors.adminId,
    })

    const quotation = await QuotationService.createFromBooking(booking, {
      createdById: actors.reservationsId ?? actors.adminId,
      userId: actors.adminId,
    })
    await QuotationService.send(quotation, { userId: actors.reservationsId ?? actors.adminId })
  }

  private async seedRecoveryPendingClient(actors: SeedActors) {
    const marker = `${SEED_MARKER} recovery-pending`
    const existing = await this.findByMarker(marker)
    if (existing) {
      const item = await RecoveryReportItem.findBy('booking_id', existing.id)
      if (item && ['SENT_TO_CLIENT', 'UNDER_CLIENT_REVIEW'].includes(item.recoveryStatus)) {
        return
      }
      await this.resumeThroughInvoice(existing, 'RCV-PENDING', actors)
      return
    }

    const booking = await BookingService.createEnquiry({
      customerId: actors.customerId,
      branchId: actors.branchId,
      destination: 'Cape Town leadership summit',
      departDate: DateTime.now().plus({ days: 12 }),
      returnDate: DateTime.now().plus({ days: 16 }),
      pax: 1,
      totalAmount: 11804,
      currency: 'ZMW',
      notes: marker,
      userId: actors.adminId,
    })

    await seedQuotationFlow(booking, actors)
    await confirmBookingWithTravelDetails(
      booking,
      travelPayload('RCV-PENDING', actors.supplierId, false),
      actors.financeId ?? actors.adminId
    )
    await advanceThroughIssuedInvoice(booking, 'RCV-PENDING', actors.financeId ?? actors.adminId)
  }

  private async seedRecoveryQueryRaised(actors: SeedActors) {
    const marker = `${SEED_MARKER} recovery-query`
    const existing = await this.findByMarker(marker)
    if (existing) {
      const item = await RecoveryReportItem.findBy('booking_id', existing.id)
      if (item?.recoveryStatus === 'QUERY_RAISED') {
        return
      }
      const { recoveryItem: resumed } = await this.resumeThroughInvoice(existing, 'RCV-QUERY', actors)
      if (resumed && resumed.recoveryStatus !== 'QUERY_RAISED') {
        await RecoveryReportingService.clientQuery(
          resumed,
          'Please confirm the cost centre and GL account before we approve reimbursement.',
          { clientAccountId: actors.clientAccountId }
        )
      }
      return
    }

    const booking = await BookingService.createEnquiry({
      customerId: actors.customerId,
      branchId: actors.branchId,
      destination: 'Nairobi regional meeting',
      departDate: DateTime.now().plus({ days: 9 }),
      returnDate: DateTime.now().plus({ days: 13 }),
      pax: 1,
      totalAmount: 9727.8,
      currency: 'ZMW',
      notes: marker,
      userId: actors.adminId,
    })

    await seedQuotationFlow(booking, actors)
    await confirmBookingWithTravelDetails(
      booking,
      travelPayload('RCV-QUERY', actors.supplierId, false),
      actors.financeId ?? actors.adminId
    )
    const { recoveryItem } = await advanceThroughIssuedInvoice(
      booking,
      'RCV-QUERY',
      actors.financeId ?? actors.adminId
    )
    await RecoveryReportingService.clientQuery(
      recoveryItem,
      'Please confirm the cost centre and GL account before we approve reimbursement.',
      { clientAccountId: actors.clientAccountId }
    )
  }

  private async seedInvoiceAwaitingPayment(actors: SeedActors) {
    const marker = `${SEED_MARKER} invoice-unpaid`
    const existing = await this.findByMarker(marker)
    if (existing) {
      const invoice = await Invoice.query().where('booking_id', existing.id).whereNot('status', 'draft').first()
      if (invoice) {
        return
      }
      const { recoveryItem } = await this.resumeThroughInvoice(existing, 'INV-UNPAID', actors)
      if (recoveryItem && !['APPROVED_BY_CLIENT', 'RECOVERED'].includes(recoveryItem.recoveryStatus)) {
        await RecoveryReportingService.clientApprove(recoveryItem, {
          clientAccountId: actors.clientAccountId,
        })
      }
      return
    }

    const booking = await BookingService.createEnquiry({
      customerId: actors.customerId,
      branchId: actors.branchId,
      destination: 'Durban supplier visit',
      departDate: DateTime.now().plus({ days: 25 }),
      returnDate: DateTime.now().plus({ days: 28 }),
      pax: 1,
      totalAmount: 8450,
      currency: 'ZMW',
      notes: marker,
      userId: actors.adminId,
    })

    await seedQuotationFlow(booking, actors)
    await confirmBookingWithTravelDetails(
      booking,
      travelPayload('INV-UNPAID', actors.supplierId, false),
      actors.financeId ?? actors.adminId
    )
    const { recoveryItem } = await advanceThroughIssuedInvoice(
      booking,
      'INV-UNPAID',
      actors.financeId ?? actors.adminId
    )
    await RecoveryReportingService.clientApprove(recoveryItem, { clientAccountId: actors.clientAccountId })
  }

  private async ensureCompleteCycleHasQuotation(actors: SeedActors) {
    const marker = `${SEED_MARKER} complete`
    const booking = await this.findByMarker(marker)
    if (!booking) {
      return
    }

    const existing = await Quotation.query().where('booking_id', booking.id).first()
    if (existing) {
      return
    }

    const quotation = await QuotationService.createFromBooking(booking, {
      createdById: actors.reservationsId ?? actors.adminId,
      userId: actors.adminId,
    })
    await QuotationService.send(quotation, { userId: actors.reservationsId ?? actors.adminId })
    await QuotationService.clientApprove(quotation, { clientAccountId: actors.clientAccountId })

    if (booking.status !== 'paid' && booking.status !== 'closed') {
      booking.status = 'paid'
      await booking.save()
    }
  }

  private async seedCompletedCycle(actors: SeedActors) {
    const marker = `${SEED_MARKER} complete`
    if (await this.findByMarker(marker)) {
      return
    }

    const booking = await BookingService.createEnquiry({
      customerId: actors.customerId,
      branchId: actors.branchId,
      destination: 'Harare board meeting',
      departDate: DateTime.now().plus({ days: 35 }),
      returnDate: DateTime.now().plus({ days: 38 }),
      pax: 1,
      totalAmount: 6942.2,
      currency: 'ZMW',
      notes: marker,
      userId: actors.adminId,
    })

    await seedQuotationFlow(booking, actors)
    await confirmBookingWithTravelDetails(
      booking,
      travelPayload('COMPLETE', actors.supplierId, false),
      actors.financeId ?? actors.adminId
    )
    const { recoveryItem, invoice } = await advanceThroughIssuedInvoice(
      booking,
      'COMPLETE',
      actors.financeId ?? actors.adminId
    )
    await RecoveryReportingService.clientApprove(recoveryItem, { clientAccountId: actors.clientAccountId })
    await InvoiceService.recordClientPayment(invoice, Number(invoice.totalAmount), {
      userId: actors.financeId ?? actors.adminId,
      paymentMethod: 'bank_transfer',
      reference: `SEED-PAY-${invoice.invoiceNumber}`,
    })
    await RecoveryReportingService.markRecovered(recoveryItem, { userId: actors.financeId ?? actors.adminId })
    await booking.refresh()
  }
}
