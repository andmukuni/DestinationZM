type EnquiryDocumentHtmlInput = {
  reference: string
  submittedDate: string
  statusLabel: string
  client: {
    company: string
    contactName: string | null
    email: string | null
    phone: string | null
  }
  lineItems: Array<{
    quantity: number
    title: string
    description: string
    amount: number
  }>
  totalEstimated: number
  currency: string
  itemCount: number
  footer: {
    companyName: string
    branchName: string | null
    contactLine: string
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatMoney(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString('en-ZM', { minimumFractionDigits: 0 })}`
}

export default class EnquiryDocumentHtmlService {
  static render(document: EnquiryDocumentHtmlInput) {
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
      : `
          <tr>
            <td colspan="4" style="border:1px solid #e2e8f0;padding:24px;text-align:center;color:#64748b;">
              No service details recorded for this enquiry.
            </td>
          </tr>`

    const totalRow =
      document.lineItems.length > 0
        ? `
          <tr style="background:#f8fafc;">
            <td colspan="3" style="border:1px solid #e2e8f0;padding:12px;text-align:right;font-weight:600;">
              Estimated total (${document.itemCount} ${document.itemCount === 1 ? 'service' : 'services'})
            </td>
            <td style="border:1px solid #e2e8f0;padding:12px;text-align:right;font-weight:700;">
              ${document.totalEstimated > 0 ? escapeHtml(formatMoney(document.totalEstimated, document.currency)) : '—'}
            </td>
          </tr>`
        : ''

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(document.reference)} — Enquiry</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 32px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #475569; color: #fff; border: 1px solid #64748b; padding: 10px 12px; text-align: left; }
    </style>
  </head>
  <body>
    <div style="display:flex;justify-content:space-between;gap:24px;border-bottom:1px solid #e2e8f0;padding-bottom:24px;margin-bottom:24px;">
      <div>
        <div style="font-size:18px;font-weight:700;">${escapeHtml(document.footer.companyName)}</div>
        ${document.footer.branchName ? `<div style="margin-top:4px;color:#64748b;">${escapeHtml(document.footer.branchName)}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <h1 style="margin:0;font-size:28px;color:#334155;">ENQUIRY</h1>
        <p style="margin:8px 0 0;"><strong>Enquiry No:</strong> ${escapeHtml(document.reference)}</p>
        <p style="margin:4px 0 0;"><strong>Date:</strong> ${escapeHtml(document.submittedDate)}</p>
        <p style="margin:4px 0 0;"><strong>Status:</strong> ${escapeHtml(document.statusLabel)}</p>
      </div>
    </div>
    <div style="border-bottom:1px solid #e2e8f0;padding-bottom:20px;margin-bottom:24px;">
      <p style="margin:0;font-weight:600;">${escapeHtml(document.client.company)}</p>
      ${document.client.contactName ? `<p style="margin:4px 0 0;">Attn: ${escapeHtml(document.client.contactName)}</p>` : ''}
      ${document.client.email ? `<p style="margin:4px 0 0;">${escapeHtml(document.client.email)}</p>` : ''}
      ${document.client.phone ? `<p style="margin:0;">${escapeHtml(document.client.phone)}</p>` : ''}
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:64px;text-align:center;">Qty</th>
          <th style="width:192px;">Item</th>
          <th>Description</th>
          <th style="width:144px;text-align:right;">Est. amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineRows}
        ${totalRow}
      </tbody>
    </table>
    <p style="margin-top:24px;text-align:center;color:#475569;">${escapeHtml(document.footer.contactLine)}</p>
  </body>
</html>`
  }
}
