# QuickBooks Online Integration

Reference for syncing DestinationZM invoices with QuickBooks Online (QBO).

**Status:** Implemented  
**Last updated:** July 2026

---

## Behavior

| Event | Local trigger | QBO result |
|-------|---------------|------------|
| Invoice created (draft or issued) | All create paths + issue safety net | Create **open/unpaid** QBO invoice |
| Invoice marked paid | `updatePaymentStatus()` → `paid` | Create QBO **Receive Payment** |
| Single QBO company | One connection for the whole app | One `realm_id` |

### Sync triggers in code

- `InvoiceService.createFromQuotationDraft()`
- `InvoiceService.createDraftFromBooking()`
- `InvoiceService.createFromBooking()`
- `InvoiceService.issue()` (safety net if not yet synced)
- `InvoicesController.store()` (manual create)
- `InvoiceService.updatePaymentStatus()` when status becomes `paid`

---

## Setup

### 1. Intuit developer app

1. Create an app at [developer.intuit.com](https://developer.intuit.com)
2. Use **Development** credentials for sandbox testing
3. Register redirect URI: `http://localhost:3333/settings/quickbooks/callback`
4. **Rotate the client secret** if it was ever exposed outside `.env`

### 2. API credentials (system settings)

Admins configure QuickBooks credentials in **Settings** (`/settings`). Values are stored in the database; the client secret is encrypted at rest.

| Field | Description |
|-------|-------------|
| Client ID | From your Intuit developer app |
| Client secret | Encrypted in `quickbooks_app_settings` |
| Redirect URI | Must match Intuit app settings (default: `{APP_URL}/settings/quickbooks/callback`) |
| Environment | `sandbox` or `production` |

Optional **environment variable fallback** (useful for CI or local bootstrap):

```env
QUICKBOOKS_CLIENT_ID=
QUICKBOOKS_CLIENT_SECRET=
QUICKBOOKS_REDIRECT_URI=http://localhost:3333/settings/quickbooks/callback
QUICKBOOKS_ENVIRONMENT=sandbox
QUICKBOOKS_SCOPES=com.intuit.quickbooks.accounting
```

Database settings take precedence when both are present.

### 3. Connect in admin

1. Open **Settings → QuickBooks** in the admin sidebar (`/settings/quickbooks`)
2. Save **API credentials** (admin only)
3. Click **Connect QuickBooks**
3. Sign in to Intuit sandbox and select a company
4. Choose a **default service item** for invoice lines
5. Ensure **Enable automatic QuickBooks sync** is checked

### Test connection

On **Settings → QuickBooks**, use **Test API connection** to verify credentials and live API access.

```bash
POST /settings/quickbooks/test
Accept: application/json
```

Returns JSON with `ok`, `stage` (`credentials` | `oauth` | `api`), `message`, and optional `details` (company name, realm ID, service item count).

---

## Architecture

```
Invoice created locally
       ↓
QuickbooksSyncService.enqueueInvoice()
       ↓
Background process (fire-and-forget)
       ↓
Sync customer → create QBO invoice (unpaid)
       ↓
Store mapping in quickbooks_sync_records

Invoice marked paid locally
       ↓
QuickbooksSyncService.enqueuePayment()
       ↓
Create QBO Receive Payment linked to invoice
```

Retry failed/pending syncs:

```bash
node ace quickbooks:process-pending
```

---

## Key files

| Area | Path |
|------|------|
| Config (static defaults) | `config/quickbooks.ts` |
| App credentials (DB) | `app/services/quickbooks/quickbooks_app_settings_service.ts` |
| OAuth + tokens | `app/services/quickbooks/quickbooks_oauth_service.ts` |
| API client | `app/services/quickbooks/quickbooks_client.ts` |
| Invoice sync | `app/services/quickbooks/quickbooks_invoice_sync.ts` |
| Payment sync | `app/services/quickbooks/quickbooks_payment_sync.ts` |
| Orchestrator | `app/services/quickbooks/quickbooks_sync_service.ts` |
| Payload builders | `app/services/quickbooks/quickbooks_payload_builder.ts` |
| Settings UI | `inertia/pages/settings/quickbooks.tsx` |
| Settings controller | `app/controllers/quickbooks_settings_controller.ts` |
| Invoice sync UI | `inertia/pages/invoices/show.tsx` |
| Ace retry command | `commands/process_quickbooks_sync.ts` |

---

## Database tables

- `quickbooks_app_settings` — OAuth app credentials (client secret encrypted)
- `quickbooks_connections` — OAuth tokens (encrypted), realm ID, default service item
- `quickbooks_sync_records` — Maps local customers/invoices/payments to QBO IDs
- `invoices.quickbooks_invoice_id` / `quickbooks_sync_status` — Fast lookup on invoice show page

---

## Manual testing checklist

1. Connect sandbox company in Settings
2. Create invoice from quotation → verify open invoice in QBO sandbox
3. Create manual draft invoice → verify QBO invoice
4. Mark paid in admin → verify QBO payment and zero balance
5. Portal payment on issued invoice → verify QBO payment
6. Retry failed sync from invoice show page
7. Run `node ace quickbooks:process-pending` for queued failures

---

## API references

- [Intuit Developer Portal](https://developer.intuit.com)
- [QBO Invoice API](https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/invoice)
- [QBO Payment API](https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/payment)
