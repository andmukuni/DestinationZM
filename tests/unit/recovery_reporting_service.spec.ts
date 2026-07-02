import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import RecoveryReportingService from '#services/recovery_reporting_service'
import InvoiceService from '#services/invoice_service'
import Booking from '#models/booking'
import Invoice from '#models/invoice'
import Quotation from '#models/quotation'
import RecoveryReportItem from '#models/recovery_report_item'
import { DateTime } from 'luxon'
import { RECOVERY_INDEX_TABLE_COLUMNS } from '#types/recovery_reporting'
import {
  issueClientInvoiceForBooking,
  recordSupplierPaymentOnBooking,
} from '../../database/helpers/middleman_workflow.js'

test.group('RecoveryReportingService', () => {
  test('determineRecoveryStatus returns PENDING_INVOICE without invoice', ({ assert }) => {
    const booking = new Booking()
    booking.merge({
      invoiceReceiptNumber: null,
      travelerName: 'Jane Doe',
      productType: 'flight',
      totalAmount: 1000,
      costCenter: 'CC-1',
      approvedBy: 'Manager',
      generalLedgerAccount: 'GL-1',
    })

    assert.equal(RecoveryReportingService.determineRecoveryStatus(booking, false), 'PENDING_INVOICE')
  })

  test('determineRecoveryStatus returns DRAFT when required fields missing', ({ assert }) => {
    const booking = new Booking()
    booking.merge({
      invoiceReceiptNumber: 'INV-1',
      travelerName: null,
      productType: 'flight',
      totalAmount: 1000,
      costCenter: 'CC-1',
      approvedBy: 'Manager',
      generalLedgerAccount: 'GL-1',
    })

    assert.equal(RecoveryReportingService.determineRecoveryStatus(booking, true), 'DRAFT')
  })

  test('determineRecoveryStatus returns READY_FOR_CLIENT when complete', ({ assert }) => {
    const booking = new Booking()
    booking.merge({
      invoiceReceiptNumber: 'INV-1',
      travelerName: 'Jane Doe',
      productType: 'flight',
      totalAmount: 1000,
      costCenter: 'CC-1',
      approvedBy: 'Manager',
      generalLedgerAccount: 'GL-1',
      departDate: DateTime.now(),
    })

    assert.equal(RecoveryReportingService.determineRecoveryStatus(booking, true), 'READY_FOR_CLIENT')
  })

  test('export uses travel items template layout', async ({ assert }) => {
    const { default: ExcelJS } = await import('exceljs')
    const item = new RecoveryReportItem()
    item.merge({
      id: 1,
      bookingId: 99,
      recoveryReference: 'RRI-TEST-0001',
      productType: 'flight',
      currency: 'ZMW',
      price: 1500,
      pnr: 'ABC123',
      travelerName: 'Jane Doe',
      travelStart: DateTime.fromISO('2026-01-10'),
      travelEnd: DateTime.fromISO('2026-01-15'),
      itineraryService: 'Lusaka to Dubai',
      invoiceReceiptNumber: 'INV-001',
      tripName: 'Executive travel',
      tripReason: 'Conference',
      costCenter: 'CC-1',
      dateRequested: DateTime.fromISO('2026-01-01'),
      approvedBy: 'Manager',
      generalLedgerAccount: 'GL-6100',
    })
    item.$setRelated('booking', new Booking())

    const { buffer, fileName } = await RecoveryReportingService.exportItemsToExcel([item], {
      startDate: DateTime.fromISO('2026-01-01'),
      endDate: DateTime.fromISO('2026-01-31'),
    })

    assert.match(fileName, /^FNB_Recovery_Report_/)
    assert.isTrue(buffer.byteLength > 0)
    assert.equal(buffer.subarray(0, 2).toString(), 'PK')
    assert.deepEqual(RECOVERY_INDEX_TABLE_COLUMNS.length, 17)

    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const sheet = workbook.getWorksheet('Sheet1')
    assert.isNotNull(sheet)
    assert.deepEqual(sheet!.getCell('E1').value, { formula: 'SUM(E3:E3)' })
    assert.equal(sheet!.getRow(2).getCell(1).value, 'Enquiry item')
    assert.equal(sheet!.getRow(2).getCell(3).value, 'Product Type')
    assert.equal(sheet!.getRow(3).getCell(5).value, 1500)
    assert.equal(sheet!.getRow(3).getCell(8).value, RecoveryReportingService.dateToExcelSerial(item.travelStart))
  })

  test('exportItemsToPdf returns a valid PDF buffer', async ({ assert }) => {
    const item = new RecoveryReportItem()
    item.merge({
      id: 2,
      bookingId: 100,
      recoveryReference: 'RRI-202607-0002',
      productType: 'accommodation',
      currency: 'ZMW',
      price: 1500,
      pnr: 'ABC123',
      travelerName: 'Jane Doe',
      travelStart: DateTime.fromISO('2026-01-10'),
      travelEnd: DateTime.fromISO('2026-01-15'),
      itineraryService: 'Hotels — Livingstone',
      invoiceReceiptNumber: 'INV-001',
      tripName: 'Executive travel',
      tripReason: 'Conference',
      costCenter: 'CC-1',
      dateRequested: DateTime.fromISO('2026-01-01'),
      approvedBy: 'Manager',
      generalLedgerAccount: 'GL-6100',
    })
    item.$setRelated('booking', new Booking())

    const { buffer, fileName, mimeType } = await RecoveryReportingService.exportItemsToPdf([item], {
      startDate: DateTime.fromISO('2026-01-01'),
      endDate: DateTime.fromISO('2026-01-31'),
    })

    assert.match(fileName, /^FNB_Recovery_Report_.+\.pdf$/)
    assert.equal(mimeType, 'application/pdf')
    assert.isTrue(buffer.byteLength > 0)
    assert.equal(buffer.subarray(0, 4).toString(), '%PDF')
  })

  test('buildTravelItemsTableForRecoveryItem pairs enquiry lines with invoice lines', ({ assert }) => {
    const booking = new Booking()
    booking.merge({
      pnr: 'BOOK-PNR',
      travelerName: 'Jane Doe',
      destination: 'Lusaka',
      departDate: DateTime.fromISO('2026-03-01'),
      returnDate: DateTime.fromISO('2026-03-05'),
      enquiryData: {
        version: 1,
        items: [
          {
            bookingTypeId: 1,
            typeName: 'Flight',
            tabLabel: 'Flights',
            slug: 'flight',
            destination: 'Lusaka to Dubai',
            departDate: '2026-03-01',
            returnDate: '2026-03-05',
            pax: 1,
            productType: 'flight',
            notes: null,
            estimatedBudget: 800,
            summaryLines: [
              { label: 'Trip type', value: 'Round-trip' },
              { label: 'Class', value: 'Economy' },
            ],
            fields: { pnr: 'ABC123', traveler_names: 'Jane Banda, John Banda' },
          },
          {
            bookingTypeId: 2,
            typeName: 'Hotel',
            tabLabel: 'Hotels',
            slug: 'hotel',
            destination: 'Dubai Marina',
            departDate: '2026-03-02',
            returnDate: '2026-03-04',
            pax: 1,
            productType: 'hotel',
            notes: null,
            estimatedBudget: 400,
            summaryLines: [],
            fields: {},
          },
        ],
      },
    })

    const item = new RecoveryReportItem()
    item.merge({
      id: 42,
      recoveryReference: 'RRI-TEST-0001',
      productType: 'flight',
      currency: 'ZMW',
      price: 1200,
      pnr: null,
      travelerName: 'Jane Doe',
      travelStart: DateTime.fromISO('2026-03-01'),
      travelEnd: DateTime.fromISO('2026-03-05'),
      itineraryService: 'Lusaka to Dubai',
      invoiceReceiptNumber: 'INV-001',
      tripName: 'Executive travel',
      tripReason: 'Conference',
      costCenter: 'CC-1',
      dateRequested: DateTime.fromISO('2026-02-20'),
      approvedBy: 'Manager',
      generalLedgerAccount: 'GL-6100',
    })

    const table = RecoveryReportingService.buildTravelItemsTableForRecoveryItem(item, booking, {
      invoice: { id: 1, invoiceNumber: 'INV-2026-001', status: 'issued' },
      quotation: { id: 2, reference: 'QT-001' },
      lineItems: [
        { quantity: 1, title: 'Flight', description: 'Lusaka to Dubai', amount: 800 },
        { quantity: 1, title: 'Hotel', description: 'Dubai Marina', amount: 400 },
      ],
      currency: 'ZMW',
      subtotal: 1200,
      taxAmount: 0,
      totalAmount: 1200,
    })

    assert.equal(table.rows.length, 2)
    assert.equal(table.totalPrice, 1200)
    assert.equal(table.displayColumns.length, 17)
    assert.equal(table.rows[0].enquiryItemLabel, 'Flight — Lusaka to Dubai')
    assert.equal(table.rows[0].invoiceItemLabel, 'Flight')
    assert.equal(table.rows[0].price, 800)
    assert.equal(table.rows[0].pnr, 'RRI-TEST-0001-001')
    assert.include(table.rows[0].itineraryService, 'Flight — Lusaka to Dubai')
    assert.include(table.rows[0].itineraryService, 'Trip type: Round-trip')
    assert.equal(table.rows[0].dateRequested, '2026-02-20')
    assert.equal(table.rows[0].travelerName, 'Jane Banda, John Banda')
    assert.equal(table.rows[1].productType, 'hotel')
    assert.equal(table.rows[1].price, 400)
    assert.equal(table.rows[1].travelerName, '')
    assert.include(table.rows[1].itineraryService, 'Dubai Marina')
  })

  test('buildTravelItemsTableForRecoveryItems aggregates batch rows', ({ assert }) => {
    const booking = new Booking()
    booking.merge({
      enquiryData: {
        version: 1,
        items: [
          {
            bookingTypeId: 1,
            typeName: 'Flight',
            tabLabel: 'Flights',
            slug: 'flight',
            destination: 'Lusaka to Dubai',
            departDate: '2026-03-01',
            returnDate: '2026-03-05',
            pax: 1,
            productType: 'flight',
            notes: null,
            estimatedBudget: 800,
            summaryLines: [],
            fields: {},
          },
        ],
      },
    })

    const item = new RecoveryReportItem()
    item.merge({ id: 7, currency: 'ZMW', price: 800, travelerName: 'Jane Doe' })
    item.$setRelated('booking', booking)

    const table = RecoveryReportingService.buildTravelItemsTableForRecoveryItems(
      [item],
      new Map([
        [
          7,
          {
            invoice: null,
            quotation: null,
            lineItems: [{ quantity: 1, title: 'Flight', description: 'Route', amount: 800 }],
            currency: 'ZMW',
            subtotal: 800,
            taxAmount: 0,
            totalAmount: 800,
          },
        ],
      ])
    )

    assert.equal(table.rows.length, 1)
    assert.equal(table.rows[0].price, 800)
    assert.equal(table.rows[0].invoiceItemLabel, 'Flight')
  })

  test('wednesdayWindow returns seven-day span ending on Wednesday', ({ assert }) => {
    const reference = DateTime.fromISO('2026-06-25') as DateTime<true>
    const { periodStart, periodEnd } = RecoveryReportingService.wednesdayWindow(reference)
    assert.equal(periodEnd.weekday, 3)
    assert.equal(periodEnd.diff(periodStart, 'days').days, 7)
  })
})

test.group('RecoveryReportingService database', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('clientApprove rejects items not sent for review', async ({ assert }) => {
    const item = new RecoveryReportItem()
    item.merge({ recoveryStatus: 'DRAFT' })

    await assert.rejects(
      () => RecoveryReportingService.clientApprove(item, { clientAccountId: 1 }),
      /cannot be approved/
    )
  })

  test('createFromQuotationDraft populates recovery with quotation and invoice', async ({ assert }) => {
    const booking = await Booking.query().where('status', 'confirmed').first()
    if (!booking) {
      return
    }

    const quotation = await Quotation.query().where('booking_id', booking.id).orderBy('id', 'desc').first()
    if (!quotation) {
      return
    }

    const existingInvoice = await Invoice.query().where('booking_id', booking.id).first()
    if (existingInvoice) {
      return
    }

    const invoice = await InvoiceService.createFromQuotationDraft(quotation, {
      subtotal: Number(quotation.subtotal),
      taxAmount: Number(quotation.taxAmount),
      totalAmount: Number(quotation.totalAmount),
      currency: quotation.currency,
      issueDate: DateTime.now(),
      dueDate: DateTime.now().plus({ days: 30 }),
    })

    await invoice.refresh()
    assert.isNotNull(invoice.recoveryReportItemId)

    const recoveryItem = await RecoveryReportItem.findByOrFail('booking_id', booking.id)
    assert.equal(invoice.recoveryReportItemId, recoveryItem.id)

    const documents = await RecoveryReportingService.documentsContextByItemId([recoveryItem])
    const context = documents.get(recoveryItem.id)
    assert.isNotNull(context?.invoice)
    assert.equal(context?.invoice?.id, invoice.id)
    assert.isNotNull(context?.quotation)
    assert.equal(context?.quotation?.id, quotation.id)
  })

  test('createOrPopulateFromIssuedInvoice links recovery to issued invoice', async ({ assert }) => {
    const booking = await Booking.query().where('status', 'confirmed').first()
    if (!booking) {
      return
    }

    const existingInvoice = await Invoice.query().where('booking_id', booking.id).first()
    if (existingInvoice) {
      return
    }

    await recordSupplierPaymentOnBooking(booking, `IDEM-${booking.id}`, null)
    const { invoice, recoveryItem } = await issueClientInvoiceForBooking(booking, null)

    assert.equal(invoice.recoveryReportItemId, recoveryItem.id)

    const repopulated = await RecoveryReportingService.createOrPopulateFromIssuedInvoice(invoice, {})
    assert.equal(repopulated?.id, recoveryItem.id)

    const count = await RecoveryReportItem.query().where('booking_id', booking.id).count('* as total')
    assert.equal(Number(count[0].$extras.total), 1)
  })
})
