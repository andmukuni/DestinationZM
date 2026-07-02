import { test } from '@japa/runner'
import {
  mapQuickbooksAccountRow,
  mapQuickbooksItemRow,
} from '#services/quickbooks/quickbooks_catalog_sync'

test.group('Quickbooks catalog sync mapping', () => {
  test('maps a QBO account entity to a local row', ({ assert }) => {
    const row = mapQuickbooksAccountRow(
      {
        Id: '35',
        Name: 'Checking',
        FullyQualifiedName: 'Checking',
        AccountType: 'Bank',
        AccountSubType: 'Checking',
        Classification: 'Asset',
        CurrencyRef: { value: 'ZMW' },
        Active: true,
        CurrentBalance: 1201.0,
      },
      '9341455307021048'
    )

    assert.equal(row.quickbooksId, '35')
    assert.equal(row.realmId, '9341455307021048')
    assert.equal(row.name, 'Checking')
    assert.equal(row.accountType, 'Bank')
    assert.equal(row.classification, 'Asset')
    assert.equal(row.currency, 'ZMW')
    assert.isTrue(row.active)
    assert.equal(row.currentBalance, 1201.0)
  })

  test('marks CDC-deleted account as inactive', ({ assert }) => {
    const row = mapQuickbooksAccountRow(
      { Id: '36', Name: 'Old account', status: 'Deleted' },
      'realm'
    )

    assert.isFalse(row.active)
  })

  test('maps a QBO item entity to a local row', ({ assert }) => {
    const row = mapQuickbooksItemRow(
      {
        Id: '19',
        Name: 'Web Services',
        Sku: 'WS-01',
        Type: 'NonInventory',
        Description: 'Demo Demo',
        UnitPrice: 125.5,
        IncomeAccountRef: { value: '79', name: 'Sales of Product Income' },
        Active: true,
      },
      'realm'
    )

    assert.equal(row.quickbooksId, '19')
    assert.equal(row.name, 'Web Services')
    assert.equal(row.sku, 'WS-01')
    assert.equal(row.type, 'NonInventory')
    assert.equal(row.unitPrice, 125.5)
    assert.equal(row.incomeAccountName, 'Sales of Product Income')
    assert.isTrue(row.active)
  })

  test('defaults missing optional fields to null and inactive flag from Active=false', ({
    assert,
  }) => {
    const row = mapQuickbooksItemRow({ Id: '20', Name: 'Archived', Active: false }, 'realm')

    assert.isNull(row.sku)
    assert.isNull(row.type)
    assert.isNull(row.description)
    assert.isNull(row.unitPrice)
    assert.isNull(row.incomeAccountName)
    assert.isFalse(row.active)
  })
})
