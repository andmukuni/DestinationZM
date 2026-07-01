import { BaseSeeder } from '@adonisjs/lucid/seeders';
import PermissionService from '#services/permission_service';
export default class extends BaseSeeder {
    async run() {
        await PermissionService.seedDefaults(true);
    }
}
