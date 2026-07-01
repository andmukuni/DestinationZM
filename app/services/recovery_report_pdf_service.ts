import type PDFDocument from 'pdfkit'
import {
  RECOVERY_TABLE_COLUMN_KEY_MAP,
  type RecoveryTravelItemRow,
} from '#types/recovery_reporting'

const COLUMN_KEY_MAP = RECOVERY_TABLE_COLUMN_KEY_MAP

const COLUMN_WEIGHTS: Record<string, number> = {
  'Enquiry item': 1.15,
  'Invoice item': 1.15,
  'Product Type': 0.85,
  Currency: 0.55,
  Price: 0.65,
  PNR: 0.85,
  'Traveler Name': 1,
  'Travel Start': 0.75,
  'Travel End': 0.75,
  'Itinerary / Service': 2.1,
  'Invoice / Receipt#': 0.85,
  'Trip Name': 0.85,
  'Trip Reason': 0.85,
  'Cost Center': 0.75,
  'Date Requested': 0.75,
  'Approved by': 0.85,
  'General Ledger Account': 1,
}

const PAGE_LAYOUT = { size: 'A4' as const, layout: 'landscape' as const }
const MARGIN = 18
const FONT_SIZE = 6.5
const HEADER_FONT_SIZE = 6.5
const CELL_PADDING = 2.5
const HEADER_BG = '#f1f5f9'
const BORDER_COLOR = '#cbd5e1'
const TEXT_COLOR = '#0f172a'

function formatTablePrice(value: number) {
  return value.toLocaleString('en-ZM', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function formatCellValue(key: keyof RecoveryTravelItemRow, value: string | number) {
  if (key === 'price') {
    return formatTablePrice(Number(value))
  }
  return String(value ?? '')
}

function rowCellValues(row: RecoveryTravelItemRow, columns: readonly string[]) {
  return columns.map((column) => {
    const key = COLUMN_KEY_MAP[column]
    return key ? formatCellValue(key, row[key]) : ''
  })
}

type PdfTableContext = {
  doc: PDFDocument
  columns: readonly string[]
  colWidths: number[]
  priceColumnIndex: number
  tableWidth: number
  pageBottom: number
  y: number
}

export default class RecoveryReportPdfService {
  static renderTravelItemsTable(
    doc: PDFDocument,
    columns: readonly string[],
    rows: RecoveryTravelItemRow[],
    totalPrice: number
  ) {
    const tableWidth = doc.page.width - MARGIN * 2
    const weights = columns.map((column) => COLUMN_WEIGHTS[column] ?? 1)
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    const colWidths = weights.map((weight) => (weight / totalWeight) * tableWidth)
    const priceColumnIndex = Math.max(columns.findIndex((column) => column === 'Price'), 0)

    const context: PdfTableContext = {
      doc,
      columns,
      colWidths,
      priceColumnIndex,
      tableWidth,
      pageBottom: doc.page.height - MARGIN,
      y: MARGIN,
    }

    const totalCells = columns.map((_, index) =>
      index === priceColumnIndex ? formatTablePrice(totalPrice) : ''
    )
    this.drawRow(context, totalCells, { boldPrice: true })
    this.drawRow(context, [...columns], { header: true })

    for (const row of rows) {
      this.drawRow(context, rowCellValues(row, columns))
    }
  }

  private static drawRow(
    context: PdfTableContext,
    cells: string[],
    options: { header?: boolean; boldPrice?: boolean } = {}
  ) {
    const rowHeight = this.measureRowHeight(context, cells, options.header)
    this.ensureSpace(context, rowHeight, options.header)

    let x = MARGIN
    for (let index = 0; index < cells.length; index += 1) {
      const width = context.colWidths[index] ?? 0
      const cell = cells[index] ?? ''

      if (options.header) {
        context.doc.rect(x, context.y, width, rowHeight).fill(HEADER_BG)
      }

      context.doc
        .rect(x, context.y, width, rowHeight)
        .strokeColor(BORDER_COLOR)
        .lineWidth(0.5)
        .stroke()

      context.doc.fillColor(TEXT_COLOR)
      if (options.header) {
        context.doc.font('Helvetica-Bold').fontSize(HEADER_FONT_SIZE)
      } else if (options.boldPrice && index === context.priceColumnIndex) {
        context.doc.font('Helvetica-Bold').fontSize(FONT_SIZE)
      } else {
        context.doc.font('Helvetica').fontSize(FONT_SIZE)
      }

      context.doc.text(cell, x + CELL_PADDING, context.y + CELL_PADDING, {
        width: width - CELL_PADDING * 2,
        align: index === context.priceColumnIndex ? 'right' : 'left',
        lineBreak: true,
      })

      x += width
    }

    context.y += rowHeight
  }

  private static measureRowHeight(
    context: PdfTableContext,
    cells: string[],
    isHeader = false
  ) {
    const fontSize = isHeader ? HEADER_FONT_SIZE : FONT_SIZE
    let maxHeight = fontSize + CELL_PADDING * 2

    context.doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(fontSize)

    cells.forEach((cell, index) => {
      const width = (context.colWidths[index] ?? 0) - CELL_PADDING * 2
      const height = context.doc.heightOfString(cell || ' ', { width })
      maxHeight = Math.max(maxHeight, height + CELL_PADDING * 2)
    })

    return maxHeight
  }

  private static ensureSpace(context: PdfTableContext, rowHeight: number, isHeader: boolean | undefined) {
    if (context.y + rowHeight <= context.pageBottom) {
      return
    }

    context.doc.addPage(PAGE_LAYOUT)
    context.pageBottom = context.doc.page.height - MARGIN
    context.y = MARGIN

    if (!isHeader) {
      this.drawRow(context, [...context.columns], { header: true })
    }
  }
}
