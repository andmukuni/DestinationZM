import env from '#start/env'
import nodemailer from 'nodemailer'
import SmtpSettingsService from '#services/settings/smtp_settings_service'

export default class NotificationMailService {
  private static async createTransporter() {
    const config = await SmtpSettingsService.resolve()

    if (!config.enabled) {
      return null
    }

    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.username
        ? { user: config.username, pass: config.password ?? '' }
        : undefined,
    })
  }

  private static async fromAddress() {
    const config = await SmtpSettingsService.resolve()
    if (config.fromName) {
      return `"${config.fromName}" <${config.fromAddress}>`
    }

    return config.fromAddress
  }

  private static appUrl(path = '') {
    const base = env.get('APP_URL').replace(/\/$/, '')
    return `${base}${path}`
  }

  static async send(to: string, subject: string, text: string, html?: string) {
    try {
      const transporter = await this.createTransporter()
      if (!transporter) {
        return
      }

      await transporter.sendMail({
        from: await this.fromAddress(),
        to,
        subject,
        text,
        html: html ?? text.replace(/\n/g, '<br>'),
      })
    } catch {
      // Email is best-effort in development without SMTP.
    }
  }

  static async quotationSentToClient(params: {
    customerEmail: string
    customerName: string
    quotationReference: string
    bookingReference: string
    totalAmount: number
    currency: string
  }) {
    await this.send(
      params.customerEmail,
      `Quotation ${params.quotationReference} — DestinationZM`,
      `Dear ${params.customerName},\n\nYour quotation ${params.quotationReference} for enquiry ${params.bookingReference} is ready.\nTotal: ${params.currency} ${params.totalAmount}\n\nPlease review and approve in your client portal:\n${this.appUrl('/portal/login')}`
    )
  }

  static async quotationApprovedByClient(params: {
    staffEmail: string
    customerName: string
    quotationReference: string
    bookingReference: string
  }) {
    await this.send(
      params.staffEmail,
      `Client approved quotation ${params.quotationReference}`,
      `${params.customerName} approved quotation ${params.quotationReference} for enquiry ${params.bookingReference}.\n\nReview in admin: ${this.appUrl('/bookings')}`
    )
  }

  static async recoveryItemSentToClient(
    item: { recoveryReference: string; travelerName: string; currency: string; price: number },
    customerEmail: string,
    customerName: string
  ) {
    await this.send(
      customerEmail,
      `Recovery item ${item.recoveryReference} — please review`,
      `Dear ${customerName},\n\nA recovery item is ready for your review.\nReference: ${item.recoveryReference}\nTraveler: ${item.travelerName}\nAmount: ${item.currency} ${item.price}\n\nReview in client portal: ${this.appUrl('/portal/recovery-reports')}`
    )
  }

  static async recoveryReportSentToClient(params: {
    customerEmail: string
    customerName: string
    reportReference: string
    bookingReference: string
  }) {
    await this.send(
      params.customerEmail,
      `Recovery report ${params.reportReference} — please confirm`,
      `Dear ${params.customerName},\n\nPlease review and confirm recovery report ${params.reportReference} for enquiry ${params.bookingReference}.\n\nClient portal: ${this.appUrl('/portal/login')}`
    )
  }

  static async recoveryReportConfirmedByClient(params: {
    staffEmail: string
    customerName: string
    reportReference: string
    bookingReference: string
  }) {
    await this.send(
      params.staffEmail,
      `Client confirmed recovery report ${params.reportReference}`,
      `${params.customerName} confirmed recovery report ${params.reportReference} for enquiry ${params.bookingReference}. You may now create the invoice.`
    )
  }

  static async invoiceIssuedToClient(params: {
    customerEmail: string
    customerName: string
    invoiceNumber: string
    totalAmount: number
    currency: string
    dueDate: string
  }) {
    await this.send(
      params.customerEmail,
      `Invoice ${params.invoiceNumber} — DestinationZM`,
      `Dear ${params.customerName},\n\nInvoice ${params.invoiceNumber} has been issued.\nAmount due: ${params.currency} ${params.totalAmount}\nDue date: ${params.dueDate}\n\nPay via client portal: ${this.appUrl('/portal/login')}`
    )
  }

  static async paymentReceived(params: {
    customerEmail: string
    customerName: string
    invoiceNumber: string
    amount: number
    currency: string
  }) {
    await this.send(
      params.customerEmail,
      `Payment received — Invoice ${params.invoiceNumber}`,
      `Dear ${params.customerName},\n\nWe received your payment of ${params.currency} ${params.amount} for invoice ${params.invoiceNumber}. Thank you.`
    )
  }
}
