# System Settings

Admin configuration for organization defaults, email, accounting, messaging, and operational preferences.

**Last updated:** July 2026

---

## Access

| Section | Route | Who can access |
|---------|-------|----------------|
| General | `/settings/general` | Admin |
| Email (SMTP) | `/settings/smtp` | Admin |
| QuickBooks | `/settings/quickbooks` | Admin or `invoices.manage` |
| SMS | `/settings/sms` | Admin |
| WhatsApp | `/settings/whatsapp` | Admin |
| Other | `/settings/other` | Admin |

Visit `/settings` to land on the first section you can access.

---

## Storage

| Section | Table | Notes |
|---------|-------|-------|
| General | `system_settings` (group: `general`) | Key-value settings |
| Other | `system_settings` (group: `other`) | Toggles and retention |
| SMTP | `smtp_settings` | Singleton row; password encrypted |
| SMS | `sms_settings` | Singleton row; auth token encrypted |
| WhatsApp | `whatsapp_settings` | Singleton row; API key encrypted |
| QuickBooks | `quickbooks_app_settings` + `quickbooks_connections` | See [QuickBooks integration](./quickbooks-online-integration.md) |

All integration tables support **optional environment variable fallback** for CI and local bootstrap. Database values take precedence.

---

## General settings

- Application display name
- Support email and phone
- Default currency (ISO 4217, e.g. `ZMW`)
- Default timezone (e.g. `Africa/Lusaka`)
- Portal welcome message

---

## Email (SMTP)

Configure outbound mail used by `NotificationMailService` for quotations, invoices, recovery reports, and payments.

- Host, port, TLS, credentials, from address/name
- Enable/disable outbound email
- **Send test email** action on the settings page

Env fallback: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`, `MAIL_FROM_NAME`

---

## SMS & WhatsApp

Credential storage and enable toggles are implemented. Message delivery to workflows will be wired in a future release.

Env fallback: `SMS_*` and `WHATSAPP_*` variables (see `.env.example`).

---

## Other settings

- Maintenance mode (future enforcement)
- Portal self-registration (future enforcement)
- Client notifications toggle
- Default invoice due days
- Audit log retention days

---

## Key files

| Area | Path |
|------|------|
| Settings shell UI | `inertia/components/settings/settings_shell.tsx` |
| System settings controller | `app/controllers/system_settings_controller.ts` |
| QuickBooks settings controller | `app/controllers/quickbooks_settings_controller.ts` |
| Access control | `app/services/settings/settings_access.ts` |
| General/other KV service | `app/services/settings/system_settings_service.ts` |
| SMTP service | `app/services/settings/smtp_settings_service.ts` |
| Mail sender | `app/services/notification_mail_service.ts` |
| Migration | `database/migrations/1773000000001_create_system_settings_tables.ts` |

---

## Setup

```bash
nvm use 24
node ace migration:run
```

Then open **Settings** in the admin sidebar.
