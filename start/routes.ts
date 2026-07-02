/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.get('/health', async ({ response }) => response.ok({ status: 'ok' }))

router.get('/', [controllers.Home, 'index']).as('home')

router.on('/legal/eula').renderInertia('legal/eula').as('legal.eula')
router.on('/legal/privacy').renderInertia('legal/privacy').as('legal.privacy')

router
  .group(() => {
    router
      .group(() => {
        router.get('login', [controllers.PortalSession, 'create']).as('portal.login')
        router
          .post('login', [controllers.PortalSession, 'store'])
          .as('portal.login.store')
          .use(middleware.loginRateLimit({ route: 'portal_login' }))
        router
          .get('register', [controllers.PortalRegistration, 'create'])
          .as('portal.register')
          .use(middleware.portalRegistration())
        router
          .post('register', [controllers.PortalRegistration, 'store'])
          .as('portal.register.store')
          .use(middleware.portalRegistration())
          .use(middleware.loginRateLimit({ route: 'portal_register' }))
      })
      .use(middleware.clientGuest())

    router
      .group(() => {
        router.get('dashboard', [controllers.PortalDashboard, 'index']).as('portal.dashboard')
        router.get('enquiries', [controllers.PortalEnquiries, 'index']).as('portal.enquiries.index')
        router
          .get('enquiries/:id', [controllers.PortalEnquiries, 'show'])
          .as('portal.enquiries.show')
        router
          .get('enquiries/:id/download', [controllers.PortalEnquiries, 'download'])
          .as('portal.enquiries.download')
        router
          .post('enquiries/:id/cancel', [controllers.PortalEnquiries, 'cancel'])
          .as('portal.enquiries.cancel')
        router.get('bookings', [controllers.PortalBookings, 'index']).as('portal.bookings.index')
        router
          .get('bookings/create', [controllers.PortalBookings, 'create'])
          .as('portal.bookings.create')
        router
          .post('bookings/cart', [controllers.PortalBookings, 'addToCart'])
          .as('portal.bookings.cart.add')
        router
          .post('bookings/cart/:itemId/remove', [controllers.PortalBookings, 'removeFromCart'])
          .as('portal.bookings.cart.remove')
        router
          .post('bookings/cart/:itemId/budget', [controllers.PortalBookings, 'updateCartBudget'])
          .as('portal.bookings.cart.budget')
        router
          .post('bookings/submit', [controllers.PortalBookings, 'submitCart'])
          .as('portal.bookings.submit')
        router.post('bookings', [controllers.PortalBookings, 'store']).as('portal.bookings.store')
        router
          .get('bookings/:id', [controllers.PortalDashboard, 'showBooking'])
          .as('portal.bookings.show')
        router
          .get('quotations', [controllers.PortalQuotations, 'index'])
          .as('portal.quotations.index')
        router
          .get('quotations/:id', [controllers.PortalQuotations, 'show'])
          .as('portal.quotations.show')
        router
          .get('quotations/:id/download', [controllers.PortalQuotations, 'download'])
          .as('portal.quotations.download')
        router
          .post('quotations/:id/approve', [controllers.PortalQuotations, 'approve'])
          .as('portal.quotations.approve')
        router
          .get('recovery-reports', [controllers.PortalRecoveryReports, 'index'])
          .as('portal.recovery_reports.index')
        router
          .get('recovery-reports/:id', [controllers.PortalRecoveryReports, 'show'])
          .as('portal.recovery_reports.show')
        router
          .post('recovery-reports/:id/approve', [controllers.PortalRecoveryReports, 'approve'])
          .as('portal.recovery_reports.approve')
        router
          .post('recovery-reports/:id/query', [controllers.PortalRecoveryReports, 'query'])
          .as('portal.recovery_reports.query')
        router
          .post('recovery-reports/:id/reject', [controllers.PortalRecoveryReports, 'reject'])
          .as('portal.recovery_reports.reject')
        router
          .get('recovery-reports/:id/document', [
            controllers.PortalRecoveryReports,
            'downloadDocument',
          ])
          .as('portal.recovery_reports.document')
        router
          .get('recovery-reports/export', [controllers.PortalRecoveryReports, 'export'])
          .as('portal.recovery_reports.export')
        router
          .get('recovery-reports/export-pdf', [controllers.PortalRecoveryReports, 'exportPdf'])
          .as('portal.recovery_reports.export_pdf')
        router.get('invoices', [controllers.PortalInvoices, 'index']).as('portal.invoices')
        router.get('invoices/:id', [controllers.PortalInvoices, 'show']).as('portal.invoices.show')
        router
          .get('invoices/:id/download', [controllers.PortalInvoices, 'download'])
          .as('portal.invoices.download')
        router
          .post('invoices/:id/pay', [controllers.PortalInvoices, 'pay'])
          .as('portal.invoices.pay')
        router.get('users', [controllers.PortalUsers, 'index']).as('portal.users')
        router.get('users/create', [controllers.PortalUsers, 'create']).as('portal.users.create')
        router.post('users', [controllers.PortalUsers, 'store']).as('portal.users.store')
        router.get('users/:id/edit', [controllers.PortalUsers, 'edit']).as('portal.users.edit')
        router.post('users/:id', [controllers.PortalUsers, 'update']).as('portal.users.update')
        router.post('logout', [controllers.PortalSession, 'destroy']).as('portal.logout')
      })
      .use(middleware.clientAuth())
  })
  .prefix('portal')
  .use(middleware.portalMaintenance())

router
  .group(() => {
    router.get('login', [controllers.Session, 'create']).as('session.create')
    router
      .post('login', [controllers.Session, 'store'])
      .as('session.store')
      .use(middleware.loginRateLimit({ route: 'staff_login' }))
    router.get('login/mfa', [controllers.Session, 'createMfa']).as('session.mfa')
    router.post('login/mfa', [controllers.Session, 'storeMfa']).as('session.mfa.store')
  })
  .use(middleware.guest())

// OAuth callback must stay outside auth middleware so Intuit redirects still complete
// if the staff session cookie is not sent on the cross-site return trip.
router
  .get('settings/quickbooks/callback', [controllers.QuickbooksSettings, 'callback'])
  .as('settings.quickbooks.callback')

router
  .group(() => {
    router.get('dashboard', [controllers.Dashboard, 'index']).as('dashboard')

    router.get('enquiries', [controllers.Enquiries, 'index']).as('enquiries')
    router.get('enquiries/:id', [controllers.Enquiries, 'show']).as('enquiries.show')
    router
      .get('enquiries/:id/download', [controllers.Enquiries, 'download'])
      .as('enquiries.download')
    router.get('bookings', [controllers.Bookings, 'index']).as('bookings')
    router.get('bookings/create', [controllers.Bookings, 'create']).as('bookings.create')
    router.post('bookings', [controllers.Bookings, 'store']).as('bookings.store')
    router.get('bookings/:id', [controllers.Bookings, 'show']).as('bookings.show')
    router.get('workflow-cycles', [controllers.WorkflowCycles, 'index']).as('workflow_cycles.index')
    router
      .get('workflow-cycles/:id', [controllers.WorkflowCycles, 'show'])
      .as('workflow_cycles.show')
    router
      .get('portal-booking-types', [controllers.PortalBookingTypes, 'index'])
      .as('portal_booking_types.index')
    router
      .get('portal-booking-types/create', [controllers.PortalBookingTypes, 'create'])
      .as('portal_booking_types.create')
    router
      .post('portal-booking-types', [controllers.PortalBookingTypes, 'store'])
      .as('portal_booking_types.store')
    router
      .get('portal-booking-types/:id/edit', [controllers.PortalBookingTypes, 'edit'])
      .as('portal_booking_types.edit')
    router
      .post('portal-booking-types/:id', [controllers.PortalBookingTypes, 'update'])
      .as('portal_booking_types.update')
    router
      .post('portal-booking-types/:id/fields', [controllers.PortalBookingTypes, 'storeField'])
      .as('portal_booking_types.fields.store')
    router
      .post('portal-booking-types/:id/fields/:fieldId', [
        controllers.PortalBookingTypes,
        'updateField',
      ])
      .as('portal_booking_types.fields.update')
    router
      .post('portal-booking-types/:id/fields/:fieldId/delete', [
        controllers.PortalBookingTypes,
        'destroyField',
      ])
      .as('portal_booking_types.fields.destroy')
    router.post('bookings/:id/confirm', [controllers.Bookings, 'confirm']).as('bookings.confirm')
    router
      .post('bookings/:id/record-supplier-payment', [controllers.Bookings, 'recordSupplierPayment'])
      .as('bookings.record_supplier_payment')
    router
      .post('bookings/:id/quotations', [controllers.Quotations, 'storeFromBooking'])
      .as('bookings.quotations.store')
    router
      .post('bookings/:id/create-invoice', [controllers.Invoices, 'createFromBooking'])
      .as('bookings.create_invoice')

    router
      .on('/packages')
      .renderInertia('coming_soon', {
        title: 'Tour packages',
        description: 'Create and manage safari packages, city tours, and custom itineraries.',
        pageTitle: 'Tour packages',
        pageDescription: 'Packages and itineraries',
      })
      .as('packages')

    router
      .on('/destinations')
      .renderInertia('coming_soon', {
        title: 'Destinations',
        description: 'Browse Zambia destinations, routes, and seasonal travel highlights.',
        pageTitle: 'Destinations',
        pageDescription: 'Destinations and routes',
      })
      .as('destinations')

    router.get('customers', [controllers.Customers, 'index']).as('customers')
    router.get('customers/create', [controllers.Customers, 'create']).as('customers.create')
    router.post('customers', [controllers.Customers, 'store']).as('customers.store')
    router.get('customers/:id', [controllers.Customers, 'show']).as('customers.show')

    router
      .on('/offices')
      .renderInertia('coming_soon', {
        title: 'Offices',
        description: 'Manage DestinationZM office locations across Zambia.',
        pageTitle: 'Offices',
        pageDescription: 'Office locations',
      })
      .as('offices')

    router
      .on('/agents')
      .renderInertia('coming_soon', {
        title: 'Travel agents',
        description: 'Manage travel agent profiles, assignments, and performance.',
        pageTitle: 'Travel agents',
        pageDescription: 'Agent management',
      })
      .as('agents')

    router.get('documents', [controllers.Documents, 'index']).as('documents')
    router.post('documents', [controllers.Documents, 'store']).as('documents.store')
    router
      .get('documents/:id/download', [controllers.Documents, 'download'])
      .as('documents.download')
    router.delete('documents/:id', [controllers.Documents, 'destroy']).as('documents.destroy')

    router.get('suppliers', [controllers.Suppliers, 'index']).as('suppliers')
    router.get('suppliers/create', [controllers.Suppliers, 'create']).as('suppliers.create')
    router.post('suppliers', [controllers.Suppliers, 'store']).as('suppliers.store')
    router.get('suppliers/:id', [controllers.Suppliers, 'show']).as('suppliers.show')

    router.get('quotations', [controllers.Quotations, 'index']).as('quotations')
    router.get('quotations/create', [controllers.Quotations, 'create']).as('quotations.create')
    router.post('quotations', [controllers.Quotations, 'store']).as('quotations.store')
    router.get('quotations/:id', [controllers.Quotations, 'show']).as('quotations.show')
    router
      .get('quotations/:id/download', [controllers.Quotations, 'download'])
      .as('quotations.download')
    router.post('quotations/:id/send', [controllers.Quotations, 'send']).as('quotations.send')

    router.get('invoices', [controllers.Invoices, 'index']).as('invoices')
    router.get('invoices/create', [controllers.Invoices, 'create']).as('invoices.create')
    router.post('invoices', [controllers.Invoices, 'store']).as('invoices.store')
    router.get('invoices/:id', [controllers.Invoices, 'show']).as('invoices.show')
    router.get('invoices/:id/download', [controllers.Invoices, 'download']).as('invoices.download')
    router.post('invoices/:id/issue', [controllers.Invoices, 'issue']).as('invoices.issue')
    router
      .post('invoices/:id/mark-paid', [controllers.Invoices, 'markPaid'])
      .as('invoices.mark_paid')

    router.get('receipts', [controllers.Receipts, 'index']).as('receipts')
    router.get('receipts/create', [controllers.Receipts, 'create']).as('receipts.create')
    router.post('receipts', [controllers.Receipts, 'store']).as('receipts.store')

    router.get('payments', [controllers.Payments, 'index']).as('payments')
    router.get('payments/create', [controllers.Payments, 'create']).as('payments.create')
    router.post('payments', [controllers.Payments, 'store']).as('payments.store')

    router
      .get('recovery-reports', [controllers.RecoveryReports, 'index'])
      .as('recovery_reports.index')
    router
      .get('recovery-reports/items/:id', [controllers.RecoveryReports, 'showItem'])
      .as('recovery_reports.items.show')
    router
      .post('recovery-reports/items/:id/send-to-client', [
        controllers.RecoveryReports,
        'sendToClient',
      ])
      .as('recovery_reports.items.send')
    router
      .post('recovery-reports/items/:id/mark-recovered', [
        controllers.RecoveryReports,
        'markRecovered',
      ])
      .as('recovery_reports.items.mark_recovered')
    router
      .get('recovery-reports/export', [controllers.RecoveryReports, 'export'])
      .as('recovery_reports.export')
    router
      .get('recovery-reports/export-pdf', [controllers.RecoveryReports, 'exportPdf'])
      .as('recovery_reports.export_pdf')
    router
      .post('recovery-reports/weekly-export', [controllers.RecoveryReports, 'weeklyExport'])
      .as('recovery_reports.weekly_export')

    router.get('reports', [controllers.Reports, 'index']).as('reports')
    router.get('reports/templates', [controllers.Reports, 'templates']).as('reports.templates')
    router
      .post('reports/templates', [controllers.Reports, 'storeTemplate'])
      .as('reports.templates.store')
    router.post('reports/run', [controllers.Reports, 'run']).as('reports.run')
    router
      .get('reports/runs/:id/download', [controllers.Reports, 'download'])
      .as('reports.download')

    router.get('users', [controllers.Users, 'index']).as('users')
    router.get('users/create', [controllers.Users, 'create']).as('users.create')
    router.post('users', [controllers.Users, 'store']).as('users.store')

    router.get('roles', [controllers.Roles, 'index']).as('roles')
    router.patch('roles', [controllers.Roles, 'update']).as('roles.update')

    router.get('settings', [controllers.SystemSettings, 'index']).as('settings')
    router.get('settings/general', [controllers.SystemSettings, 'general']).as('settings.general')
    router
      .patch('settings/general', [controllers.SystemSettings, 'updateGeneral'])
      .as('settings.general.update')
    router.get('settings/smtp', [controllers.SystemSettings, 'smtp']).as('settings.smtp')
    router
      .patch('settings/smtp', [controllers.SystemSettings, 'updateSmtp'])
      .as('settings.smtp.update')
    router
      .post('settings/smtp/test', [controllers.SystemSettings, 'testSmtp'])
      .as('settings.smtp.test')
    router.get('settings/sms', [controllers.SystemSettings, 'sms']).as('settings.sms')
    router
      .patch('settings/sms', [controllers.SystemSettings, 'updateSms'])
      .as('settings.sms.update')
    router
      .get('settings/whatsapp', [controllers.SystemSettings, 'whatsapp'])
      .as('settings.whatsapp')
    router
      .patch('settings/whatsapp', [controllers.SystemSettings, 'updateWhatsapp'])
      .as('settings.whatsapp.update')
    router.get('settings/other', [controllers.SystemSettings, 'other']).as('settings.other')
    router
      .patch('settings/other', [controllers.SystemSettings, 'updateOther'])
      .as('settings.other.update')
    router.get('settings/security', [controllers.SystemSettings, 'security']).as('settings.security')
    router
      .patch('settings/security', [controllers.SystemSettings, 'updateSecurity'])
      .as('settings.security.update')
    router
      .post('settings/security/mfa/start', [controllers.SystemSettings, 'startMfaSetup'])
      .as('settings.security.mfa.start')
    router
      .post('settings/security/mfa/confirm', [controllers.SystemSettings, 'confirmMfaSetup'])
      .as('settings.security.mfa.confirm')
    router
      .post('settings/security/mfa/disable', [controllers.SystemSettings, 'disableMfa'])
      .as('settings.security.mfa.disable')
    router
      .get('settings/quickbooks', [controllers.QuickbooksSettings, 'index'])
      .as('settings.quickbooks')
    router
      .get('settings/quickbooks/connect', [controllers.QuickbooksSettings, 'connect'])
      .as('settings.quickbooks.connect')
    router
      .post('settings/quickbooks/disconnect', [controllers.QuickbooksSettings, 'disconnect'])
      .as('settings.quickbooks.disconnect')
    router
      .patch('settings/quickbooks/credentials', [
        controllers.QuickbooksSettings,
        'updateCredentials',
      ])
      .as('settings.quickbooks.credentials')
    router
      .post('settings/quickbooks/test', [controllers.QuickbooksSettings, 'testConnection'])
      .as('settings.quickbooks.test')
    router
      .patch('settings/quickbooks', [controllers.QuickbooksSettings, 'update'])
      .as('settings.quickbooks.update')

    router
      .post('invoices/:id/quickbooks/retry', [controllers.Invoices, 'retryQuickbooksSync'])
      .as('invoices.quickbooks.retry')

    router.get('profile', [controllers.Profile, 'show']).as('profile')
    router.get('user-settings', [controllers.Profile, 'settings']).as('user_settings')
    router
      .patch('user-settings/password', [controllers.Profile, 'updatePassword'])
      .as('user_settings.password')

    router.post('logout', [controllers.Session, 'destroy']).as('session.destroy')
  })
  .use(middleware.auth())
