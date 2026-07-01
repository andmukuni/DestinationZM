import { BaseCommand } from '@adonisjs/core/ace'
import Booking from '#models/booking'
import Customer from '#models/customer'
import BookingService from '#services/booking_service'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class RestoreMergedEnquiries extends BaseCommand {
  static commandName = 'enquiries:restore-merged'
  static description = 'Restore enquiries that were previously merged by consolidation'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const email = String(this.parsed.args[0] ?? 'chanda.banda@example.com')
    const customer = await Customer.findBy('email', email)
    if (!customer) {
      this.logger.error(`No customer for ${email}`)
      return
    }

    const restored = await BookingService.restoreConsolidatedEnquiries(customer.id)
    if (!restored.length) {
      this.logger.warning('No merged enquiries found to restore.')
      return
    }

    this.logger.success(`Restored ${restored.length} enquiry record(s).`)

    const openEnquiries = await Booking.query()
      .where('customer_id', customer.id)
      .whereIn('status', ['enquiry_submitted', 'quotation_preparing'])
      .orderBy('id', 'asc')

    for (const booking of openEnquiries) {
      const itemCount = booking.enquiryData?.items?.length ?? 0
      this.logger.info(
        `#${booking.id} ${booking.reference} | ${booking.status} | ${booking.destination} | items=${itemCount}`
      )
    }
  }
}
