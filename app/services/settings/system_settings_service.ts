import SystemSetting, { type SystemSettingGroup } from '#models/system_setting'
import SecretCipher from '#services/settings/secret_cipher'

export type GeneralSettingsView = {
  appDisplayName: string
  supportEmail: string
  supportPhone: string
  defaultCurrency: string
  defaultTimezone: string
}

export type PortalSettingsView = {
  portalWelcomeMessage: string
  maintenanceMode: boolean
  allowPortalRegistration: boolean
  enableClientNotifications: boolean
}

export type OtherSettingsView = {
  defaultInvoiceDueDays: number
  auditRetentionDays: number
}

const GENERAL_DEFAULTS: GeneralSettingsView = {
  appDisplayName: 'DestinationZM',
  supportEmail: '',
  supportPhone: '',
  defaultCurrency: 'ZMW',
  defaultTimezone: 'Africa/Lusaka',
}

const PORTAL_DEFAULTS: PortalSettingsView = {
  portalWelcomeMessage: '',
  maintenanceMode: false,
  allowPortalRegistration: false,
  enableClientNotifications: true,
}

const OTHER_DEFAULTS: OtherSettingsView = {
  defaultInvoiceDueDays: 30,
  auditRetentionDays: 365,
}

function parseBoolean(value: string | null | undefined, fallback: boolean) {
  if (value === undefined || value === null || value === '') {
    return fallback
  }

  return value === '1' || value === 'true' || value === 'on'
}

function parseNumber(value: string | null | undefined, fallback: number) {
  if (value === undefined || value === null || value === '') {
    return fallback
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export default class SystemSettingsService {
  static async getGroupMap(group: SystemSettingGroup) {
    const rows = await SystemSetting.query().where('group', group)
    const map = new Map<string, string>()

    for (const row of rows) {
      map.set(row.key, row.value ?? '')
    }

    return map
  }

  static async generalToView(): Promise<GeneralSettingsView> {
    const map = await this.getGroupMap('general')

    return {
      appDisplayName: map.get('app_display_name') ?? GENERAL_DEFAULTS.appDisplayName,
      supportEmail: map.get('support_email') ?? GENERAL_DEFAULTS.supportEmail,
      supportPhone: map.get('support_phone') ?? GENERAL_DEFAULTS.supportPhone,
      defaultCurrency: map.get('default_currency') ?? GENERAL_DEFAULTS.defaultCurrency,
      defaultTimezone: map.get('default_timezone') ?? GENERAL_DEFAULTS.defaultTimezone,
    }
  }

  static async portalToView(): Promise<PortalSettingsView> {
    const [generalMap, otherMap] = await Promise.all([
      this.getGroupMap('general'),
      this.getGroupMap('other'),
    ])

    return {
      portalWelcomeMessage:
        generalMap.get('portal_welcome_message') ?? PORTAL_DEFAULTS.portalWelcomeMessage,
      maintenanceMode: parseBoolean(otherMap.get('maintenance_mode'), PORTAL_DEFAULTS.maintenanceMode),
      allowPortalRegistration: parseBoolean(
        otherMap.get('allow_portal_registration'),
        PORTAL_DEFAULTS.allowPortalRegistration
      ),
      enableClientNotifications: parseBoolean(
        otherMap.get('enable_client_notifications'),
        PORTAL_DEFAULTS.enableClientNotifications
      ),
    }
  }

  static async isMaintenanceMode() {
    const map = await this.getGroupMap('other')
    return parseBoolean(map.get('maintenance_mode'), PORTAL_DEFAULTS.maintenanceMode)
  }

  static async isPortalRegistrationAllowed() {
    const map = await this.getGroupMap('other')
    return parseBoolean(
      map.get('allow_portal_registration'),
      PORTAL_DEFAULTS.allowPortalRegistration
    )
  }

  static async getPortalWelcomeMessage() {
    const map = await this.getGroupMap('general')
    return map.get('portal_welcome_message') ?? PORTAL_DEFAULTS.portalWelcomeMessage
  }

  static async otherToView(): Promise<OtherSettingsView> {
    const map = await this.getGroupMap('other')

    return {
      defaultInvoiceDueDays: parseNumber(
        map.get('default_invoice_due_days'),
        OTHER_DEFAULTS.defaultInvoiceDueDays
      ),
      auditRetentionDays: parseNumber(
        map.get('audit_retention_days'),
        OTHER_DEFAULTS.auditRetentionDays
      ),
    }
  }

  static async saveGroup(
    group: SystemSettingGroup,
    values: Record<string, { value: string | boolean | number; isSecret?: boolean }>,
    userId: number
  ) {
    for (const [key, entry] of Object.entries(values)) {
      const normalized =
        typeof entry.value === 'boolean'
          ? entry.value
            ? 'true'
            : 'false'
          : String(entry.value ?? '')

      let row = await SystemSetting.query().where('group', group).where('key', key).first()

      if (!row) {
        row = new SystemSetting()
        row.group = group
        row.key = key
      }

      if (entry.isSecret && normalized) {
        row.value = SecretCipher.encrypt(normalized)
        row.isSecret = true
      } else {
        row.value = normalized
        row.isSecret = entry.isSecret ?? false
      }

      row.updatedByUserId = userId
      await row.save()
    }
  }

  static async saveGeneral(input: GeneralSettingsView, userId: number) {
    await this.saveGroup(
      'general',
      {
        app_display_name: { value: input.appDisplayName },
        support_email: { value: input.supportEmail },
        support_phone: { value: input.supportPhone },
        default_currency: { value: input.defaultCurrency },
        default_timezone: { value: input.defaultTimezone },
      },
      userId
    )
  }

  static async savePortal(input: PortalSettingsView, userId: number) {
    await this.saveGroup(
      'general',
      {
        portal_welcome_message: { value: input.portalWelcomeMessage },
      },
      userId
    )

    await this.saveGroup(
      'other',
      {
        maintenance_mode: { value: input.maintenanceMode },
        allow_portal_registration: { value: input.allowPortalRegistration },
        enable_client_notifications: { value: input.enableClientNotifications },
      },
      userId
    )
  }

  static async saveOther(input: OtherSettingsView, userId: number) {
    await this.saveGroup(
      'other',
      {
        default_invoice_due_days: { value: input.defaultInvoiceDueDays },
        audit_retention_days: { value: input.auditRetentionDays },
      },
      userId
    )
  }
}
