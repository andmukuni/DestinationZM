import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import QuickbooksCatalogSync from '#services/quickbooks/quickbooks_catalog_sync'

export default class RefreshQuickbooksCatalog extends BaseCommand {
  static commandName = 'quickbooks:refresh-catalog'
  static description = 'Refresh the local QuickBooks chart of accounts and products & services'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.boolean({ description: 'Force a full pull instead of change data capture' })
  declare full: boolean

  async run() {
    const result = await QuickbooksCatalogSync.refresh({ full: this.full })

    if (!result) {
      this.logger.warning('QuickBooks is not connected; nothing to refresh.')
      return
    }

    this.logger.info(
      `QuickBooks catalog refresh complete (${result.mode}). accounts=${result.accounts} items=${result.items}`
    )
  }
}
