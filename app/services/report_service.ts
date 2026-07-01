/**
 * Requires `exceljs` in package.json dependencies:
 *   pnpm add exceljs
 */
import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'
import Booking from '#models/booking'
import Invoice from '#models/invoice'
import ReportRun from '#models/report_run'
import ReportTemplate from '#models/report_template'
import DocumentService from '#services/document_service'

type ReportParameters = Record<string, unknown>

export default class ReportService {
  static listTemplates() {
    return ReportTemplate.query().where('is_active', true).orderBy('name', 'asc')
  }

  static async runSystemReport(
    template: ReportTemplate,
    generatedById: number | null,
    parameters: ReportParameters = {}
  ) {
    const run = await ReportRun.create({
      templateId: template.id,
      generatedById,
      parameters,
      outputDocumentId: null,
      status: 'pending',
      errorMessage: null,
    })

    try {
      const rows = await this.fetchSystemRows(template.slug, parameters)
      const buffer = await this.exportToExcel(template.name, rows)
      const document = await DocumentService.store({
        documentType: 'excel_report',
        title: `${template.name} ${DateTime.now().toFormat('yyyy-MM-dd HHmm')}`,
        fileName: `${template.slug}-${DateTime.now().toFormat('yyyyMMdd-HHmmss')}.xlsx`,
        contents: buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        uploadedById: generatedById,
      })

      run.merge({
        status: 'completed',
        outputDocumentId: document.id,
      })
      await run.save()
    } catch (error) {
      run.merge({
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Report generation failed',
      })
      await run.save()
    }

    return run
  }

  private static async fetchSystemRows(slug: string, parameters: ReportParameters) {
    switch (slug) {
      case 'bookings-summary': {
        const query = Booking.query().preload('customer').preload('assignedUser')
        if (typeof parameters.branchId === 'number') {
          query.where('branch_id', parameters.branchId)
        }
        const bookings = await query.orderBy('depart_date', 'desc')
        return bookings.map((booking) => ({
          Reference: booking.reference,
          Customer: booking.customer?.fullName ?? '',
          Destination: booking.destination,
          DepartDate: booking.departDate.toISODate(),
          Status: booking.status,
          Total: booking.totalAmount,
          Currency: booking.currency,
          Agent: booking.assignedUser?.fullName ?? '',
        }))
      }
      case 'invoices-aging': {
        const query = Invoice.query().preload('customer')
        if (typeof parameters.branchId === 'number') {
          query.where('branch_id', parameters.branchId)
        }
        const invoices = await query.orderBy('due_date', 'asc')
        return invoices.map((invoice) => ({
          InvoiceNumber: invoice.invoiceNumber,
          Customer: invoice.customer?.fullName ?? '',
          Status: invoice.status,
          Total: invoice.totalAmount,
          Paid: invoice.amountPaid,
          DueDate: invoice.dueDate.toISODate(),
        }))
      }
      default:
        throw new Error(`Unknown system report template: ${slug}`)
    }
  }

  static async exportToExcel(sheetName: string, rows: Record<string, unknown>[]) {
    const { default: ExcelJS } = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(sheetName.slice(0, 31))

    if (rows.length === 0) {
      worksheet.addRow(['No data'])
    } else {
      const headers = Object.keys(rows[0]!)
      worksheet.addRow(headers)
      for (const row of rows) {
        worksheet.addRow(headers.map((header) => row[header] ?? ''))
      }
    }

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  static templateFilePath(template: ReportTemplate) {
    if (!template.filePath) {
      throw new Error(`Template ${template.slug} has no file path`)
    }

    return app.makePath('storage/app', template.filePath)
  }
}
