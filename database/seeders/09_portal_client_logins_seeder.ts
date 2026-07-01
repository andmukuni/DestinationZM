/**
 * Portal client logins only (no bookings or demo workflow data).
 *
 * Chanda Banda (owner):  chanda.banda@example.com  / password123
 * Mutale Zulu (finance): finance@zambiatours.co.zm / password123
 */
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Branch from '#models/branch'
import ClientAccount from '#models/client_account'
import Customer from '#models/customer'
import { PORTAL_PRIVILEGE_PRESETS } from '#types/portal_privileges'

export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    const branch = await Branch.findBy('code', 'LUS-HQ')
    if (!branch) {
      throw new Error('Run branch_seeder first.')
    }

    const customer =
      (await Customer.findBy('email', 'chanda.banda@example.com')) ??
      (await Customer.create({
        fullName: 'Chanda Banda',
        company: 'Zambia Tours Ltd',
        email: 'chanda.banda@example.com',
        phone: '+260 97 123 4567',
        branchId: branch.id,
      }))

    if (!customer.company) {
      customer.company = 'Zambia Tours Ltd'
      await customer.save()
    }

    let ownerAccount = await ClientAccount.findBy('email', 'chanda.banda@example.com')
    if (!ownerAccount) {
      ownerAccount = await ClientAccount.create({
        customerId: customer.id,
        fullName: 'Chanda Banda',
        email: 'chanda.banda@example.com',
        role: 'owner',
        password: 'password123',
        isActive: true,
      })
    } else {
      ownerAccount.merge({
        customerId: customer.id,
        fullName: ownerAccount.fullName ?? 'Chanda Banda',
        role: 'owner',
        isActive: true,
      })
      await ownerAccount.save()
    }

    let financeAccount = await ClientAccount.findBy('email', 'finance@zambiatours.co.zm')
    if (!financeAccount) {
      financeAccount = await ClientAccount.create({
        customerId: customer.id,
        fullName: 'Mutale Zulu',
        email: 'finance@zambiatours.co.zm',
        role: 'member',
        privileges: PORTAL_PRIVILEGE_PRESETS.finance.privileges,
        password: 'password123',
        isActive: true,
      })
    } else {
      financeAccount.merge({
        customerId: customer.id,
        fullName: financeAccount.fullName ?? 'Mutale Zulu',
        role: 'member',
        isActive: true,
        privileges:
          financeAccount.privileges?.length
            ? financeAccount.privileges
            : PORTAL_PRIVILEGE_PRESETS.finance.privileges,
      })
      await financeAccount.save()
    }
  }
}
