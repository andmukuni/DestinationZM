import type { QuotationDocumentData } from '#services/quotation_document_service'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderEnquirySummaries(summaries: QuotationDocumentData['enquirySummaries']) {
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

function renderNotesSection(document: QuotationDocumentData) {
  if (document.enquirySummaries.length > 0) {
    return renderEnquirySummaries(document.enquirySummaries)
  }

  if (!document.notes) {
    return ''
  }

  return `<div style="margin-top:24px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;"><strong>Notes</strong><p style="margin:8px 0 0;">${escapeHtml(document.notes)}</p></div>`
}

function renderLineItemDescription(description: string) {
  if (!description.trim()) {
    return '—'
  }

  return description
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(':')
      if (colon === -1) {
        return `<span style="display:inline-block;margin:2px 6px 2px 0;padding:2px 8px;border-radius:6px;background:#f1f5f9;font-size:11px;color:#334155;">${escapeHtml(line)}</span>`
      }

      const label = line.slice(0, colon).trim()
      const value = line.slice(colon + 1).trim()
      return `<span style="display:inline-block;margin:2px 6px 2px 0;padding:2px 8px;border-radius:6px;background:#f1f5f9;font-size:11px;color:#334155;"><span style="font-weight:600;color:#64748b;">${escapeHtml(label)}:</span> ${escapeHtml(value)}</span>`
    })
    .join('')
}

export default class QuotationDocumentHtmlService {
  static render(document: QuotationDocumentData) {
    const lineRows = document.lineItems.length
      ? document.lineItems
          .map(
            (item) => `
          <tr>
            <td style="border:1px solid #cbd5e1;padding:12px;text-align:center;">${item.quantity}</td>
            <td style="border:1px solid #cbd5e1;padding:12px;font-weight:600;">${escapeHtml(item.title)}</td>
            <td style="border:1px solid #cbd5e1;padding:12px;white-space:pre-line;font-size:12px;">${item.description ? renderLineItemDescription(item.description) : '—'}</td>
            <td style="border:1px solid #cbd5e1;padding:12px;text-align:right;font-weight:600;">${item.amount > 0 ? escapeHtml(formatMoney(item.amount, document.currency)) : '—'}</td>
          </tr>`
          )
          .join('')
      : `<tr><td colspan="4" style="border:1px solid #cbd5e1;padding:24px;text-align:center;color:#64748b;">No line items on this quotation.</td></tr>`

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(document.reference)}</title>
  </head>
  <body style="font-family:Arial,sans-serif;color:#0f172a;margin:32px;">
    <div style="display:flex;justify-content:space-between;gap:24px;border-bottom:1px solid #e2e8f0;padding-bottom:24px;">
      <div>
        <div style="font-size:18px;font-weight:700;">${escapeHtml(document.footer.companyName)}</div>
        ${document.footer.branchName ? `<div style="margin-top:4px;color:#64748b;">${escapeHtml(document.footer.branchName)}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <h1 style="margin:0;font-size:28px;color:#334155;">QUOTATION</h1>
        <p style="margin:8px 0 0;"><strong>Quotation No:</strong> ${escapeHtml(document.reference)}</p>
        <p style="margin:4px 0 0;"><strong>Date:</strong> ${escapeHtml(document.issueDate)}</p>
        ${document.validUntil ? `<p style="margin:4px 0 0;"><strong>Valid until:</strong> ${escapeHtml(document.validUntil)}</p>` : ''}
        <p style="margin:4px 0 0;"><strong>Status:</strong> ${escapeHtml(document.statusLabel)}</p>
        ${document.enquiryReference ? `<p style="margin:4px 0 0;"><strong>Enquiry:</strong> ${escapeHtml(document.enquiryReference)}</p>` : ''}
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
      </tfoot>
    </table>
    ${renderNotesSection(document)}
    <p style="margin-top:32px;text-align:center;color:#64748b;font-size:14px;">${escapeHtml(document.footer.contactLine)}</p>
  </body>
</html>`
  }
}
