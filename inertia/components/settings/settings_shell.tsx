import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import type { ReactNode } from 'react'
import { urlFor } from '~/client'
import { brandTabActiveClass } from '~/lib/brand_theme'

export type SettingsSectionId =
  | 'general'
  | 'smtp'
  | 'quickbooks'
  | 'sms'
  | 'whatsapp'
  | 'other'

type SettingsSectionLink = {
  id: SettingsSectionId
  label: string
  href: string
}

const SECTION_HREFS: Record<SettingsSectionId, string> = {
  general: urlFor('settings.general'),
  smtp: urlFor('settings.smtp'),
  quickbooks: urlFor('settings.quickbooks'),
  sms: urlFor('settings.sms'),
  whatsapp: urlFor('settings.whatsapp'),
  other: urlFor('settings.other'),
}

const ALL_SECTIONS: SettingsSectionLink[] = [
  { id: 'general', label: 'General', href: SECTION_HREFS.general },
  { id: 'smtp', label: 'Email (SMTP)', href: SECTION_HREFS.smtp },
  { id: 'quickbooks', label: 'QuickBooks', href: SECTION_HREFS.quickbooks },
  { id: 'sms', label: 'SMS', href: SECTION_HREFS.sms },
  { id: 'whatsapp', label: 'WhatsApp', href: SECTION_HREFS.whatsapp },
  { id: 'other', label: 'Other', href: SECTION_HREFS.other },
]

type SettingsShellProps = {
  activeSection: SettingsSectionId
  migrationRequired?: boolean
  children: ReactNode
}

export function SettingsShell({ activeSection, migrationRequired, children }: SettingsShellProps) {
  const { props } = usePage<{ settingsSections?: Array<{ id: SettingsSectionId; label: string; route: string }> }>()
  const sections: SettingsSectionLink[] = props.settingsSections
    ? props.settingsSections.map((section) => ({
        id: section.id,
        label: section.label,
        href: SECTION_HREFS[section.id],
      }))
    : ALL_SECTIONS

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">System settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Configure organization defaults, email delivery, accounting, messaging, and operational
          preferences.
        </p>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1"
        aria-label="Settings sections"
      >
        {sections.map((section) => {
          const active = section.id === activeSection
          return (
            <Link
              key={section.id}
              href={section.href}
              className={`shrink-0 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                active
                  ? brandTabActiveClass
                  : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
              }`}
            >
              {section.label}
            </Link>
          )
        })}
      </nav>

      {migrationRequired ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Database tables missing</p>
          <p className="mt-1">
            Run <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs">node ace migration:run</code>{' '}
            (Node 24), then reload this page.
          </p>
        </div>
      ) : null}

      {children}
    </div>
  )
}

export function SettingsSourceBadge({ source }: { source: 'database' | 'environment' | 'none' }) {
  const label =
    source === 'database'
      ? 'Saved in system settings'
      : source === 'environment'
        ? 'Loaded from environment'
        : 'Not configured'

  const tone =
    source === 'none'
      ? 'rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600'
      : 'rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800'

  return <span className={tone}>{label}</span>
}
