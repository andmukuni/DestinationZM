import { test } from '@japa/runner'
import EnquiryDocumentHtmlService from '#services/enquiry_document_html_service'

test.group('EnquiryDocumentHtmlService', () => {
  test('renders downloadable enquiry html', async ({ assert }) => {
    const html = EnquiryDocumentHtmlService.render({
      reference: 'DZM-20260629-0001',
      submittedDate: '29 Jun 2026',
      statusLabel: 'Pending',
      client: {
        company: 'Zambia Tours Ltd',
        contactName: 'Chanda Banda',
        email: 'chanda.banda@example.com',
        phone: '+260 211 000 000',
      },
      lineItems: [
        {
          quantity: 2,
          title: 'Flights — Lusaka',
          description: 'Round-trip\nEconomy',
          amount: 5000,
        },
      ],
      totalEstimated: 5000,
      currency: 'ZMW',
      itemCount: 1,
      footer: {
        companyName: 'DestinationZM',
        branchName: 'Lusaka HQ',
        contactLine: 'info@destinationzm.com',
      },
    })

    assert.include(html, '<!DOCTYPE html>')
    assert.include(html, 'DZM-20260629-0001')
    assert.include(html, 'Flights — Lusaka')
    assert.include(html, 'ZMW 5,000')
  })
})
