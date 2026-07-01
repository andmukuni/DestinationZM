/**
 * Seeds one user per department role for development QA.
 * All passwords: password123
 */ import { BaseSeeder } from '@adonisjs/lucid/seeders';
import Branch from '#models/branch';
import User from '#models/user';
import { requiresBranch } from '#types/user_roles';
const DEPARTMENT_USERS = [
    {
        role: 'finance',
        fullName: 'Finance User',
        email: 'finance@destinationzm.local'
    },
    {
        role: 'reservations',
        fullName: 'Reservations User',
        email: 'reservations@destinationzm.local'
    },
    {
        role: 'operations',
        fullName: 'Operations User',
        email: 'operations@destinationzm.local'
    },
    {
        role: 'recovery',
        fullName: 'Recovery User',
        email: 'recovery@destinationzm.local'
    },
    {
        role: 'management',
        fullName: 'Management User',
        email: 'management@destinationzm.local'
    },
    {
        role: 'executive',
        fullName: 'Executive User',
        email: 'executive@destinationzm.local'
    }
];
export default class extends BaseSeeder {
    static environment = [
        'development'
    ];
    async run() {
        const branch = await Branch.findBy('code', 'LUS-HQ') ?? await Branch.findBy('name', 'Lusaka HQ') ?? await Branch.query().first();
        if (!branch) {
            throw new Error('No offices found. Run branch_seeder first.');
        }
        for (const entry of DEPARTMENT_USERS){
            const existing = await User.findBy('email', entry.email);
            if (existing) {
                existing.role = entry.role;
                existing.fullName = entry.fullName;
                existing.branchId = requiresBranch(entry.role) ? branch.id : null;
                await existing.save();
                continue;
            }
            await User.create({
                fullName: entry.fullName,
                email: entry.email,
                password: 'password123',
                role: entry.role,
                branchId: requiresBranch(entry.role) ? branch.id : null
            });
        }
    }
}
