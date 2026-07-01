import { DateTime } from 'luxon'
import type Booking from '#models/booking'
import RecoveryReportItem from '#models/recovery_report_item'
import DocumentService from '#services/document_service'
import InvoiceService from '#services/invoice_service'

export async function recordSupplierPaymentOnBooking(
  booking: Booking,
  suffix: string,
  userId: number | null
) {
  booking.merge({
    invoiceReceiptNumber: `INV-SEED-${suffix}`,
    dzPaymentStatus: 'PAID',
    dzPaymentDate: DateTime.now(),
    dzPaymentReference: `DZ-PAY-${suffix}`,
    amountPaidByDz: Number(booking.totalAmount),
  })
  await booking.save()

  await DocumentService.store({
    documentType: 'supplier_document',
    title: `Supplier invoice — ${booking.reference}`,
    fileName: `${booking.reference}-supplier.txt`,
    contents: Buffer.from(`Supplier invoice for ${booking.reference}`, 'utf-8'),
    mimeType: 'text/plain',
    referenceType: 'booking',
    referenceId: booking.id,
    uploadedById: userId,
    branchId: booking.branchId,
  })

  await booking.refresh()
}

export async function issueClientInvoiceForBooking(booking: Booking, userId: number | null) {
  const invoice = await InvoiceService.createDraftFromBooking(booking, { userId })
  await InvoiceService.issue(invoice, { userId })
  const recoveryItem = await RecoveryReportItem.findByOrFail('booking_id', booking.id)
  await recoveryItem.refresh()
  return { invoice, recoveryItem }
}
