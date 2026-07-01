import { BaseSeeder } from '@adonisjs/lucid/seeders';
import Branch from '#models/branch';
const OFFICES = [
    {
        code: 'LUS-HQ',
        name: 'Lusaka HQ'
    },
    {
        code: 'LIV-VF',
        name: 'Livingstone'
    },
    {
        code: 'NDL-OF',
        name: 'Ndola'
    }
];
export default class extends BaseSeeder {
    async run() {
        for (const office of OFFICES){
            await Branch.updateOrCreate({
                code: office.code
            }, office);
        }
        console.log(`Seeded ${OFFICES.length} offices`);
    }
}
