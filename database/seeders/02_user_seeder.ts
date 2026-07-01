/**
 * Default development admin user:
 *   Email: admin@destinationzm.local
 *   Password: password123
 *   Full name: Admin User
 */
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Branch from '#models/branch'
import User from '#models/user'

export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    const email = 'admin@destinationzm.local'
    const branch =
      (await Branch.findBy('code', 'LUS-HQ')) ??
      (await Branch.findBy('name', 'Lusaka HQ')) ??
      (await Branch.query().first())
    if (!branch) {
      throw new Error('No offices found. Run branch_seeder first.')
    }

    const existingUser = await User.findBy('email', email)
    if (existingUser) {
      existingUser.role = 'admin'
      existingUser.branchId = branch.id
      await existingUser.save()
      return
    }

    await User.create({
      fullName: 'Admin User',
      email,
      password: 'password123',
      role: 'admin',
      branchId: branch.id,
    })
  }
}
