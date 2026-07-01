import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'auth/login.d': ExtractProps<(typeof import('../../inertia/pages/auth/login.d.ts'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'bookings/create.d': ExtractProps<(typeof import('../../inertia/pages/bookings/create.d.ts'))['default']>
    'bookings/create': ExtractProps<(typeof import('../../inertia/pages/bookings/create.tsx'))['default']>
    'bookings/index.d': ExtractProps<(typeof import('../../inertia/pages/bookings/index.d.ts'))['default']>
    'bookings/index': ExtractProps<(typeof import('../../inertia/pages/bookings/index.tsx'))['default']>
    'bookings/show': ExtractProps<(typeof import('../../inertia/pages/bookings/show.tsx'))['default']>
    'coming_soon.d': ExtractProps<(typeof import('../../inertia/pages/coming_soon.d.ts'))['default']>
    'coming_soon': ExtractProps<(typeof import('../../inertia/pages/coming_soon.tsx'))['default']>
    'customers/create.d': ExtractProps<(typeof import('../../inertia/pages/customers/create.d.ts'))['default']>
    'customers/create': ExtractProps<(typeof import('../../inertia/pages/customers/create.tsx'))['default']>
    'customers/index.d': ExtractProps<(typeof import('../../inertia/pages/customers/index.d.ts'))['default']>
    'customers/index': ExtractProps<(typeof import('../../inertia/pages/customers/index.tsx'))['default']>
    'customers/show.d': ExtractProps<(typeof import('../../inertia/pages/customers/show.d.ts'))['default']>
    'customers/show': ExtractProps<(typeof import('../../inertia/pages/customers/show.tsx'))['default']>
    'dashboard.d': ExtractProps<(typeof import('../../inertia/pages/dashboard.d.ts'))['default']>
    'dashboard': ExtractProps<(typeof import('../../inertia/pages/dashboard.tsx'))['default']>
    'documents/index.d': ExtractProps<(typeof import('../../inertia/pages/documents/index.d.ts'))['default']>
    'documents/index': ExtractProps<(typeof import('../../inertia/pages/documents/index.tsx'))['default']>
    'enquiries/index': ExtractProps<(typeof import('../../inertia/pages/enquiries/index.tsx'))['default']>
    'enquiries/show': ExtractProps<(typeof import('../../inertia/pages/enquiries/show.tsx'))['default']>
    'errors/forbidden.d': ExtractProps<(typeof import('../../inertia/pages/errors/forbidden.d.ts'))['default']>
    'errors/forbidden': ExtractProps<(typeof import('../../inertia/pages/errors/forbidden.tsx'))['default']>
    'errors/not_found.d': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.d.ts'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error.d': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.d.ts'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'invoices/create': ExtractProps<(typeof import('../../inertia/pages/invoices/create.tsx'))['default']>
    'invoices/index.d': ExtractProps<(typeof import('../../inertia/pages/invoices/index.d.ts'))['default']>
    'invoices/index': ExtractProps<(typeof import('../../inertia/pages/invoices/index.tsx'))['default']>
    'invoices/show': ExtractProps<(typeof import('../../inertia/pages/invoices/show.tsx'))['default']>
    'payments/create.d': ExtractProps<(typeof import('../../inertia/pages/payments/create.d.ts'))['default']>
    'payments/create': ExtractProps<(typeof import('../../inertia/pages/payments/create.tsx'))['default']>
    'payments/index.d': ExtractProps<(typeof import('../../inertia/pages/payments/index.d.ts'))['default']>
    'payments/index': ExtractProps<(typeof import('../../inertia/pages/payments/index.tsx'))['default']>
    'portal_booking_types/form': ExtractProps<(typeof import('../../inertia/pages/portal_booking_types/form.tsx'))['default']>
    'portal_booking_types/index': ExtractProps<(typeof import('../../inertia/pages/portal_booking_types/index.tsx'))['default']>
    'portal/bookings/create': ExtractProps<(typeof import('../../inertia/pages/portal/bookings/create.tsx'))['default']>
    'portal/bookings/index': ExtractProps<(typeof import('../../inertia/pages/portal/bookings/index.tsx'))['default']>
    'portal/bookings/show': ExtractProps<(typeof import('../../inertia/pages/portal/bookings/show.tsx'))['default']>
    'portal/dashboard': ExtractProps<(typeof import('../../inertia/pages/portal/dashboard.tsx'))['default']>
    'portal/enquiries/index': ExtractProps<(typeof import('../../inertia/pages/portal/enquiries/index.tsx'))['default']>
    'portal/enquiries/show': ExtractProps<(typeof import('../../inertia/pages/portal/enquiries/show.tsx'))['default']>
    'portal/invoices/index.d': ExtractProps<(typeof import('../../inertia/pages/portal/invoices/index.d.ts'))['default']>
    'portal/invoices/index': ExtractProps<(typeof import('../../inertia/pages/portal/invoices/index.tsx'))['default']>
    'portal/invoices/show': ExtractProps<(typeof import('../../inertia/pages/portal/invoices/show.tsx'))['default']>
    'portal/login.d': ExtractProps<(typeof import('../../inertia/pages/portal/login.d.ts'))['default']>
    'portal/login': ExtractProps<(typeof import('../../inertia/pages/portal/login.tsx'))['default']>
    'portal/quotations/index': ExtractProps<(typeof import('../../inertia/pages/portal/quotations/index.tsx'))['default']>
    'portal/quotations/show': ExtractProps<(typeof import('../../inertia/pages/portal/quotations/show.tsx'))['default']>
    'portal/recovery_reports/index': ExtractProps<(typeof import('../../inertia/pages/portal/recovery_reports/index.tsx'))['default']>
    'portal/recovery_reports/show': ExtractProps<(typeof import('../../inertia/pages/portal/recovery_reports/show.tsx'))['default']>
    'portal/users/create': ExtractProps<(typeof import('../../inertia/pages/portal/users/create.tsx'))['default']>
    'portal/users/edit': ExtractProps<(typeof import('../../inertia/pages/portal/users/edit.tsx'))['default']>
    'portal/users/index': ExtractProps<(typeof import('../../inertia/pages/portal/users/index.tsx'))['default']>
    'profile/index.d': ExtractProps<(typeof import('../../inertia/pages/profile/index.d.ts'))['default']>
    'profile/index': ExtractProps<(typeof import('../../inertia/pages/profile/index.tsx'))['default']>
    'quotations/create.d': ExtractProps<(typeof import('../../inertia/pages/quotations/create.d.ts'))['default']>
    'quotations/create': ExtractProps<(typeof import('../../inertia/pages/quotations/create.tsx'))['default']>
    'quotations/index.d': ExtractProps<(typeof import('../../inertia/pages/quotations/index.d.ts'))['default']>
    'quotations/index': ExtractProps<(typeof import('../../inertia/pages/quotations/index.tsx'))['default']>
    'quotations/show': ExtractProps<(typeof import('../../inertia/pages/quotations/show.tsx'))['default']>
    'receipts/create.d': ExtractProps<(typeof import('../../inertia/pages/receipts/create.d.ts'))['default']>
    'receipts/create': ExtractProps<(typeof import('../../inertia/pages/receipts/create.tsx'))['default']>
    'receipts/index.d': ExtractProps<(typeof import('../../inertia/pages/receipts/index.d.ts'))['default']>
    'receipts/index': ExtractProps<(typeof import('../../inertia/pages/receipts/index.tsx'))['default']>
    'recovery_reports/index': ExtractProps<(typeof import('../../inertia/pages/recovery_reports/index.tsx'))['default']>
    'recovery_reports/show_item': ExtractProps<(typeof import('../../inertia/pages/recovery_reports/show_item.tsx'))['default']>
    'reports/index.d': ExtractProps<(typeof import('../../inertia/pages/reports/index.d.ts'))['default']>
    'reports/index': ExtractProps<(typeof import('../../inertia/pages/reports/index.tsx'))['default']>
    'reports/templates.d': ExtractProps<(typeof import('../../inertia/pages/reports/templates.d.ts'))['default']>
    'reports/templates': ExtractProps<(typeof import('../../inertia/pages/reports/templates.tsx'))['default']>
    'roles/index.d': ExtractProps<(typeof import('../../inertia/pages/roles/index.d.ts'))['default']>
    'roles/index': ExtractProps<(typeof import('../../inertia/pages/roles/index.tsx'))['default']>
    'suppliers/create.d': ExtractProps<(typeof import('../../inertia/pages/suppliers/create.d.ts'))['default']>
    'suppliers/create': ExtractProps<(typeof import('../../inertia/pages/suppliers/create.tsx'))['default']>
    'suppliers/index.d': ExtractProps<(typeof import('../../inertia/pages/suppliers/index.d.ts'))['default']>
    'suppliers/index': ExtractProps<(typeof import('../../inertia/pages/suppliers/index.tsx'))['default']>
    'suppliers/show.d': ExtractProps<(typeof import('../../inertia/pages/suppliers/show.d.ts'))['default']>
    'suppliers/show': ExtractProps<(typeof import('../../inertia/pages/suppliers/show.tsx'))['default']>
    'user_settings/index.d': ExtractProps<(typeof import('../../inertia/pages/user_settings/index.d.ts'))['default']>
    'user_settings/index': ExtractProps<(typeof import('../../inertia/pages/user_settings/index.tsx'))['default']>
    'users/create.d': ExtractProps<(typeof import('../../inertia/pages/users/create.d.ts'))['default']>
    'users/create': ExtractProps<(typeof import('../../inertia/pages/users/create.tsx'))['default']>
    'users/index.d': ExtractProps<(typeof import('../../inertia/pages/users/index.d.ts'))['default']>
    'users/index': ExtractProps<(typeof import('../../inertia/pages/users/index.tsx'))['default']>
    'workflow_cycles/index.d': ExtractProps<(typeof import('../../inertia/pages/workflow_cycles/index.d.ts'))['default']>
    'workflow_cycles/index': ExtractProps<(typeof import('../../inertia/pages/workflow_cycles/index.tsx'))['default']>
    'workflow_cycles/show': ExtractProps<(typeof import('../../inertia/pages/workflow_cycles/show.tsx'))['default']>
    'settings/quickbooks': ExtractProps<(typeof import('../../inertia/pages/settings/quickbooks.tsx'))['default']>
    'settings/general': ExtractProps<(typeof import('../../inertia/pages/settings/general.tsx'))['default']>
    'settings/smtp': ExtractProps<(typeof import('../../inertia/pages/settings/smtp.tsx'))['default']>
    'settings/sms': ExtractProps<(typeof import('../../inertia/pages/settings/sms.tsx'))['default']>
    'settings/whatsapp': ExtractProps<(typeof import('../../inertia/pages/settings/whatsapp.tsx'))['default']>
    'settings/other': ExtractProps<(typeof import('../../inertia/pages/settings/other.tsx'))['default']>
    'portal/maintenance': ExtractProps<(typeof import('../../inertia/pages/portal/maintenance.tsx'))['default']>
    'portal/register': ExtractProps<(typeof import('../../inertia/pages/portal/register.tsx'))['default']>
    'legal/eula': ExtractProps<(typeof import('../../inertia/pages/legal/eula.tsx'))['default']>
    'legal/privacy': ExtractProps<(typeof import('../../inertia/pages/legal/privacy.tsx'))['default']>
  }
}
