import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Branch from '#models/branch'
import Customer from '#models/customer'
import RecoveryReportItem from '#models/recovery_report_item'
import BookingService from '#services/booking_service'
import User from '#models/user'
import {
  issueClientInvoiceForBooking,
  recordSupplierPaymentOnBooking,
} from '../helpers/middleman_workflow.js'

type TravelSeed = {
  productType: string
  currency: string
  price: number
  pnr: string | null
  travelerName: string | null
  travelStart: string | null
  travelEnd: string | null
  itineraryService: string | null
  invoiceReceiptNumber: string | null
  tripName: string | null
  tripReason: string | null
  costCenter: string | null
  dateRequested: string | null
  approvedBy: string | null
  generalLedgerAccount: string | null
}

export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    const existingItems = await RecoveryReportItem.query().first()
    if (existingItems) {
      return
    }

    const branch = await Branch.findBy('code', 'LUS-HQ')
    const customer = await Customer.findBy('email', 'chanda.banda@example.com')
    const admin = await User.findBy('email', 'admin@destinationzm.local')
    if (!branch || !customer) {
      return
    }

    const dataPath = join(fileURLToPath(new URL('.', import.meta.url)), '../data/travel_recovery_items.json')
    const rows = JSON.parse(readFileSync(dataPath, 'utf-8')) as TravelSeed[]

    for (const [index, row] of rows.entries()) {
      const booking = await BookingService.create({
        customerId: customer.id,
        branchId: branch.id,
        destination: row.itineraryService ?? row.tripName ?? 'Corporate travel',
        departDate: row.travelStart ? DateTime.fromISO(row.travelStart) : DateTime.now().plus({ days: 14 }),
        returnDate: row.travelEnd && row.travelEnd !== '2099-12-31' ? DateTime.fromISO(row.travelEnd) : null,
        pax: 1,
        totalAmount: row.price,
        currency: row.currency,
        notes: row.tripName,
        userId: admin?.id ?? null,
      })

      booking.merge({
        status: 'quotation_approved',
        productType: row.productType,
        pnr: row.pnr,
        travelerName: row.travelerName,
        itineraryService: row.itineraryService,
        tripName: row.tripName,
        tripReason: row.tripReason,
        costCenter: row.costCenter,
        dateRequested: row.dateRequested ? DateTime.fromISO(row.dateRequested) : null,
        approvedBy: row.approvedBy,
        generalLedgerAccount: row.generalLedgerAccount,
        supplierId: null,
      })
      await booking.save()

      await BookingService.confirm(booking, { userId: admin?.id ?? null })
      await booking.refresh()

      const suffix = booking.reference.split('-').pop() ?? String(index)
      await recordSupplierPaymentOnBooking(
        booking,
        row.invoiceReceiptNumber?.replace(/\W/g, '') ?? suffix,
        admin?.id ?? null
      )

      if (index % 3 === 0) {
        await issueClientInvoiceForBooking(booking, admin?.id ?? null)
      }
    }
  }
}
