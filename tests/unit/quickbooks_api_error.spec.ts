import { test } from '@japa/runner'
import { QuickbooksApiError, readIntuitTid } from '#services/quickbooks/quickbooks_api_error'

test.group('QuickbooksApiError', () => {
  test('readIntuitTid reads response header', ({ assert }) => {
    const headers = new Headers({ intuit_tid: 'abc-123' })
    assert.equal(readIntuitTid(headers), 'abc-123')
  })

  test('QuickbooksApiError stores intuit tid', ({ assert }) => {
    const error = new QuickbooksApiError('failed', {
      status: 400,
      intuitTid: 'tid-999',
    })

    assert.equal(error.intuitTid, 'tid-999')
    assert.equal(error.status, 400)
  })
})
