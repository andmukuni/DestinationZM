import type { InvoiceDocumentData } from '#services/invoice_document_service'
import type { EnquiryServiceSummary } from '#services/quotation_document_service'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatMoney(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function renderEnquirySummaries(summaries: EnquiryServiceSummary[]) {
  if (!summaries.length) {
    return ''
  }

  const cards = summaries
    .map((service) => {
      const meta = [service.dateRange, service.pax ? `${service.pax} pax` : null]
        .filter(Boolean)
        .join(' · ')

      const details = service.details
        .map(
          (row) =>
            `<div style="margin-top:4px;font-size:11px;color:#334155;"><span style="color:#64748b;font-weight:600;">${escapeHtml(row.label)}:</span> ${escapeHtml(row.value)}</div>`
        )
        .join('')

      return `<div style="border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;padding:10px 12px;">
        <div style="font-size:12px;font-weight:700;color:#0f172a;">${escapeHtml(service.typeName)}${service.destination ? ` · ${escapeHtml(service.destination)}` : ''}</div>
        ${meta ? `<div style="margin-top:4px;font-size:11px;color:#64748b;">${escapeHtml(meta)}</div>` : ''}
        ${details}
      </div>`
    })
    .join('')

  return `<div style="margin-top:24px;padding:16px;border:1px solid #e2e8f0;border-radius:8px;">
    <strong>Enquiry details</strong>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:12px;">${cards}</div>
  </div>`
}

function renderNotesSection(document: InvoiceDocumentData) {
  if (document.enquirySummaries.length > 0) {
    return renderEnquirySummaries(document.enquirySummaries)
  }

  if (!document.notes) {
    return ''
  }

  return `<div style="margin-top:24px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;"><strong>Notes</strong><p style="margin:8px 0 0;white-space:pre-line;">${escapeHtml(document.notes)}</p></div>`
}

export default class InvoiceDocumentHtmlService {
  static render(document: InvoiceDocumentData) {
    const lineRows = document.lineItems.length
      ? document.lineItems
          .map(
            (item) => `
          <tr>
            <td style="border:1px solid #cbd5e1;padding:12px;text-align:center;">${item.quantity}</td>
            <td style="border:1px solid #cbd5e1;padding:12px;font-weight:600;">${escapeHtml(item.title)}</td>
            <td style="border:1px solid #cbd5e1;padding:12px;white-space:pre-line;font-size:12px;">${item.description ? escapeHtml(item.description) : '—'}</td>
            <td style="border:1px solid #cbd5e1;padding:12px;text-align:right;font-weight:600;">${item.amount > 0 ? escapeHtml(formatMoney(item.amount, document.currency)) : '—'}</td>
          </tr>`
          )
          .join('')
      : `<tr><td colspan="4" style="border:1px solid #cbd5e1;padding:24px;text-align:center;color:#64748b;">No line items on this invoice.</td></tr>`

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(document.invoiceNumber)}</title>
  </head>
  <body style="font-family:Arial,sans-serif;color:#0f172a;margin:32px;">
    <div style="display:flex;justify-content:space-between;gap:24px;border-bottom:1px solid #e2e8f0;padding-bottom:24px;">
      <div>
        <div style="font-size:18px;font-weight:700;">${escapeHtml(document.footer.companyName)}</div>
        ${document.footer.branchName ? `<div style="margin-top:4px;color:#64748b;">${escapeHtml(document.footer.branchName)}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <h1 style="margin:0;font-size:28px;color:#334155;">INVOICE</h1>
        <p style="margin:8px 0 0;"><strong>Invoice No:</strong> ${escapeHtml(document.invoiceNumber)}</p>
        <p style="margin:4px 0 0;"><strong>Issue date:</strong> ${escapeHtml(document.issueDate)}</p>
        <p style="margin:4px 0 0;"><strong>Due date:</strong> ${escapeHtml(document.dueDate)}</p>
        <p style="margin:4px 0 0;"><strong>Status:</strong> ${escapeHtml(document.statusLabel)}</p>
        ${document.bookingReference ? `<p style="margin:4px 0 0;"><strong>Booking:</strong> ${escapeHtml(document.bookingReference)}</p>` : ''}
        ${document.quotationReference ? `<p style="margin:4px 0 0;"><strong>Quotation:</strong> ${escapeHtml(document.quotationReference)}</p>` : ''}
      </div>
    </div>
    <div style="padding:24px 0;border-bottom:1px solid #e2e8f0;">
      <p style="margin:0;font-weight:600;">${escapeHtml(document.client.company)}</p>
      ${document.client.contactName ? `<p style="margin:8px 0 0;color:#475569;">Attn: ${escapeHtml(document.client.contactName)}</p>` : ''}
      ${document.client.email ? `<p style="margin:4px 0 0;color:#475569;">${escapeHtml(document.client.email)}</p>` : ''}
      ${document.client.phone ? `<p style="margin:4px 0 0;color:#475569;">${escapeHtml(document.client.phone)}</p>` : ''}
    </div>
    <table style="width:100%;border-collapse:collapse;margin-top:24px;font-size:14px;">
      <thead>
        <tr style="background:#475569;color:#fff;">
          <th style="border:1px solid #64748b;padding:10px;width:64px;">Qty</th>
          <th style="border:1px solid #64748b;padding:10px;width:180px;">Item</th>
          <th style="border:1px solid #64748b;padding:10px;">Description</th>
          <th style="border:1px solid #64748b;padding:10px;width:140px;text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>${lineRows}</tbody>
      <tfoot>
        <tr style="background:#f8fafc;">
          <td colspan="3" style="border:1px solid #e2e8f0;padding:12px;text-align:right;font-weight:600;">Subtotal</td>
          <td style="border:1px solid #e2e8f0;padding:12px;text-align:right;font-weight:600;">${escapeHtml(formatMoney(document.subtotal, document.currency))}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td colspan="3" style="border:1px solid #e2e8f0;padding:12px;text-align:right;font-weight:600;">Tax</td>
          <td style="border:1px solid #e2e8f0;padding:12px;text-align:right;font-weight:600;">${escapeHtml(formatMoney(document.taxAmount, document.currency))}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td colspan="3" style="border:1px solid #e2e8f0;padding:12px;text-align:right;font-weight:700;">Total (${document.itemCount} ${document.itemCount === 1 ? 'service' : 'services'})</td>
          <td style="border:1px solid #e2e8f0;padding:12px;text-align:right;font-weight:700;">${escapeHtml(formatMoney(document.totalAmount, document.currency))}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td colspan="3" style="border:1px solid #e2e8f0;padding:12px;text-align:right;font-weight:600;">Amount paid</td>
          <td style="border:1px solid #e2e8f0;padding:12px;text-align:right;font-weight:600;">${escapeHtml(formatMoney(document.amountPaid, document.currency))}</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td colspan="3" style="border:1px solid #e2e8f0;padding:12px;text-align:right;font-weight:700;">Balance due</td>
          <td style="border:1px solid #e2e8f0;padding:12px;text-align:right;font-weight:700;">${escapeHtml(formatMoney(document.balanceDue, document.currency))}</td>
        </tr>
      </tfoot>
    </table>
    ${renderNotesSection(document)}
    <p style="margin-top:32px;text-align:center;color:#64748b;font-size:14px;">${escapeHtml(document.footer.contactLine)}</p>
  </body>
</html>`
  }
}
