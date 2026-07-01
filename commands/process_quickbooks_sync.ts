import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import QuickbooksSyncService from '#services/quickbooks/quickbooks_sync_service'

export default class ProcessQuickbooksSync extends BaseCommand {
  static commandName = 'quickbooks:process-pending'
  static description = 'Process pending or failed QuickBooks sync records'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const result = await QuickbooksSyncService.processPending()
    this.logger.info(
      `QuickBooks sync complete. processed=${result.processed} failures=${result.failures}`
    )
  }
}
