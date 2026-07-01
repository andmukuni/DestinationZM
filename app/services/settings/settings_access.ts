import type User from '#models/user'
import AuthorizationService from '#services/authorization_service'

export type SettingsSection =
  | 'general'
  | 'smtp'
  | 'quickbooks'
  | 'sms'
  | 'whatsapp'
  | 'other'

export type SettingsSectionMeta = {
  id: SettingsSection
  label: string
  description: string
  route: string
  adminOnly: boolean
}

export const SETTINGS_SECTIONS: SettingsSectionMeta[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Organization profile and defaults',
    route: 'settings.general',
    adminOnly: true,
  },
  {
    id: 'smtp',
    label: 'Email (SMTP)',
    description: 'Outbound email delivery',
    route: 'settings.smtp',
    adminOnly: true,
  },
  {
    id: 'quickbooks',
    label: 'QuickBooks',
    description: 'QuickBooks Online integration',
    route: 'settings.quickbooks',
    adminOnly: false,
  },
  {
    id: 'sms',
    label: 'SMS',
    description: 'Text message notifications',
    route: 'settings.sms',
    adminOnly: true,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'WhatsApp Business messaging',
    route: 'settings.whatsapp',
    adminOnly: true,
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Operational toggles and retention',
    route: 'settings.other',
    adminOnly: true,
  },
]

export function canManageQuickbooks(user: User) {
  return AuthorizationService.isAdmin(user) || AuthorizationService.can(user, 'invoices.manage')
}

export function canConfigureQuickbooksCredentials(user: User) {
  return AuthorizationService.isAdmin(user)
}

export function canAccessSettingsSection(user: User, section: SettingsSection) {
  if (section === 'quickbooks') {
    return canManageQuickbooks(user)
  }

  return AuthorizationService.isAdmin(user)
}

export function visibleSettingsSections(user: User) {
  return SETTINGS_SECTIONS.filter((section) => canAccessSettingsSection(user, section.id))
}

export function canAccessAnySettings(user: User) {
  return visibleSettingsSections(user).length > 0
}

export function settingsNavFor(user: User) {
  return visibleSettingsSections(user).map(({ id, label, route }) => ({ id, label, route }))
}

export function buildSettingsPageProps(
  user: User,
  section: SettingsSection,
  extra: Record<string, unknown> = {}
) {
  return {
    pageTitle: 'System settings',
    pageDescription: 'Configure application-wide integrations and preferences',
    activeSection: section,
    settingsSections: settingsNavFor(user),
    ...extra,
  }
}

export function isMissingSettingsTable(error: unknown) {
  if (!(error instanceof Error)) {
    return false
  }

  const code = (error as Error & { code?: string; errno?: number }).code
  const errno = (error as Error & { errno?: number }).errno

  return code === 'ER_NO_SUCH_TABLE' || errno === 1146
}
