import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'legal.eula': { paramsTuple?: []; params?: {} }
    'legal.privacy': { paramsTuple?: []; params?: {} }
    'portal.login': { paramsTuple?: []; params?: {} }
    'portal.login.store': { paramsTuple?: []; params?: {} }
    'portal.register': { paramsTuple?: []; params?: {} }
    'portal.register.store': { paramsTuple?: []; params?: {} }
    'portal.dashboard': { paramsTuple?: []; params?: {} }
    'portal.enquiries.index': { paramsTuple?: []; params?: {} }
    'portal.enquiries.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.enquiries.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.enquiries.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.bookings.index': { paramsTuple?: []; params?: {} }
    'portal.bookings.create': { paramsTuple?: []; params?: {} }
    'portal.bookings.cart.add': { paramsTuple?: []; params?: {} }
    'portal.bookings.cart.remove': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'portal.bookings.cart.budget': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'portal.bookings.submit': { paramsTuple?: []; params?: {} }
    'portal.bookings.store': { paramsTuple?: []; params?: {} }
    'portal.bookings.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.quotations.index': { paramsTuple?: []; params?: {} }
    'portal.quotations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.quotations.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.quotations.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.recovery_reports.index': { paramsTuple?: []; params?: {} }
    'portal.recovery_reports.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.recovery_reports.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.recovery_reports.query': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.recovery_reports.reject': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.recovery_reports.document': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.recovery_reports.export': { paramsTuple?: []; params?: {} }
    'portal.recovery_reports.export_pdf': { paramsTuple?: []; params?: {} }
    'portal.invoices': { paramsTuple?: []; params?: {} }
    'portal.invoices.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.invoices.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.invoices.pay': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.users': { paramsTuple?: []; params?: {} }
    'portal.users.create': { paramsTuple?: []; params?: {} }
    'portal.users.store': { paramsTuple?: []; params?: {} }
    'portal.users.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.logout': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.mfa': { paramsTuple?: []; params?: {} }
    'session.mfa.store': { paramsTuple?: []; params?: {} }
    'settings.quickbooks.callback': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'enquiries': { paramsTuple?: []; params?: {} }
    'enquiries.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'enquiries.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bookings': { paramsTuple?: []; params?: {} }
    'bookings.create': { paramsTuple?: []; params?: {} }
    'bookings.store': { paramsTuple?: []; params?: {} }
    'bookings.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'workflow_cycles.index': { paramsTuple?: []; params?: {} }
    'workflow_cycles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal_booking_types.index': { paramsTuple?: []; params?: {} }
    'portal_booking_types.create': { paramsTuple?: []; params?: {} }
    'portal_booking_types.store': { paramsTuple?: []; params?: {} }
    'portal_booking_types.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal_booking_types.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal_booking_types.fields.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal_booking_types.fields.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'fieldId': ParamValue} }
    'portal_booking_types.fields.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'fieldId': ParamValue} }
    'bookings.confirm': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bookings.record_supplier_payment': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bookings.quotations.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bookings.create_invoice': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'packages': { paramsTuple?: []; params?: {} }
    'destinations': { paramsTuple?: []; params?: {} }
    'customers': { paramsTuple?: []; params?: {} }
    'customers.create': { paramsTuple?: []; params?: {} }
    'customers.store': { paramsTuple?: []; params?: {} }
    'customers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offices': { paramsTuple?: []; params?: {} }
    'agents': { paramsTuple?: []; params?: {} }
    'documents': { paramsTuple?: []; params?: {} }
    'documents.store': { paramsTuple?: []; params?: {} }
    'documents.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'documents.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'suppliers': { paramsTuple?: []; params?: {} }
    'suppliers.create': { paramsTuple?: []; params?: {} }
    'suppliers.store': { paramsTuple?: []; params?: {} }
    'suppliers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotations': { paramsTuple?: []; params?: {} }
    'quotations.create': { paramsTuple?: []; params?: {} }
    'quotations.store': { paramsTuple?: []; params?: {} }
    'quotations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotations.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotations.send': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'invoices': { paramsTuple?: []; params?: {} }
    'invoices.create': { paramsTuple?: []; params?: {} }
    'invoices.store': { paramsTuple?: []; params?: {} }
    'invoices.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'invoices.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'invoices.issue': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'invoices.mark_paid': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quickbooks.accounts': { paramsTuple?: []; params?: {} }
    'quickbooks.accounts.refresh': { paramsTuple?: []; params?: {} }
    'quickbooks.items': { paramsTuple?: []; params?: {} }
    'quickbooks.items.refresh': { paramsTuple?: []; params?: {} }
    'receipts': { paramsTuple?: []; params?: {} }
    'receipts.create': { paramsTuple?: []; params?: {} }
    'receipts.store': { paramsTuple?: []; params?: {} }
    'payments': { paramsTuple?: []; params?: {} }
    'payments.create': { paramsTuple?: []; params?: {} }
    'payments.store': { paramsTuple?: []; params?: {} }
    'recovery_reports.index': { paramsTuple?: []; params?: {} }
    'recovery_reports.items.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recovery_reports.items.send': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recovery_reports.items.mark_recovered': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recovery_reports.export': { paramsTuple?: []; params?: {} }
    'recovery_reports.export_pdf': { paramsTuple?: []; params?: {} }
    'recovery_reports.weekly_export': { paramsTuple?: []; params?: {} }
    'reports': { paramsTuple?: []; params?: {} }
    'reports.templates': { paramsTuple?: []; params?: {} }
    'reports.templates.store': { paramsTuple?: []; params?: {} }
    'reports.run': { paramsTuple?: []; params?: {} }
    'reports.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users': { paramsTuple?: []; params?: {} }
    'users.create': { paramsTuple?: []; params?: {} }
    'users.store': { paramsTuple?: []; params?: {} }
    'roles': { paramsTuple?: []; params?: {} }
    'roles.update': { paramsTuple?: []; params?: {} }
    'settings': { paramsTuple?: []; params?: {} }
    'settings.general': { paramsTuple?: []; params?: {} }
    'settings.general.update': { paramsTuple?: []; params?: {} }
    'settings.smtp': { paramsTuple?: []; params?: {} }
    'settings.smtp.update': { paramsTuple?: []; params?: {} }
    'settings.smtp.test': { paramsTuple?: []; params?: {} }
    'settings.sms': { paramsTuple?: []; params?: {} }
    'settings.sms.update': { paramsTuple?: []; params?: {} }
    'settings.whatsapp': { paramsTuple?: []; params?: {} }
    'settings.whatsapp.update': { paramsTuple?: []; params?: {} }
    'settings.other': { paramsTuple?: []; params?: {} }
    'settings.other.update': { paramsTuple?: []; params?: {} }
    'settings.security': { paramsTuple?: []; params?: {} }
    'settings.security.update': { paramsTuple?: []; params?: {} }
    'settings.security.mfa.start': { paramsTuple?: []; params?: {} }
    'settings.security.mfa.confirm': { paramsTuple?: []; params?: {} }
    'settings.security.mfa.disable': { paramsTuple?: []; params?: {} }
    'settings.quickbooks': { paramsTuple?: []; params?: {} }
    'settings.quickbooks.connect': { paramsTuple?: []; params?: {} }
    'settings.quickbooks.disconnect': { paramsTuple?: []; params?: {} }
    'settings.quickbooks.credentials': { paramsTuple?: []; params?: {} }
    'settings.quickbooks.test': { paramsTuple?: []; params?: {} }
    'settings.quickbooks.update': { paramsTuple?: []; params?: {} }
    'invoices.quickbooks.retry': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.quickbooks.retry': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile': { paramsTuple?: []; params?: {} }
    'user_settings': { paramsTuple?: []; params?: {} }
    'user_settings.password': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'legal.eula': { paramsTuple?: []; params?: {} }
    'legal.privacy': { paramsTuple?: []; params?: {} }
    'portal.login': { paramsTuple?: []; params?: {} }
    'portal.register': { paramsTuple?: []; params?: {} }
    'portal.dashboard': { paramsTuple?: []; params?: {} }
    'portal.enquiries.index': { paramsTuple?: []; params?: {} }
    'portal.enquiries.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.enquiries.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.bookings.index': { paramsTuple?: []; params?: {} }
    'portal.bookings.create': { paramsTuple?: []; params?: {} }
    'portal.bookings.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.quotations.index': { paramsTuple?: []; params?: {} }
    'portal.quotations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.quotations.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.recovery_reports.index': { paramsTuple?: []; params?: {} }
    'portal.recovery_reports.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.recovery_reports.document': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.recovery_reports.export': { paramsTuple?: []; params?: {} }
    'portal.recovery_reports.export_pdf': { paramsTuple?: []; params?: {} }
    'portal.invoices': { paramsTuple?: []; params?: {} }
    'portal.invoices.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.invoices.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.users': { paramsTuple?: []; params?: {} }
    'portal.users.create': { paramsTuple?: []; params?: {} }
    'portal.users.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.mfa': { paramsTuple?: []; params?: {} }
    'settings.quickbooks.callback': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'enquiries': { paramsTuple?: []; params?: {} }
    'enquiries.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'enquiries.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bookings': { paramsTuple?: []; params?: {} }
    'bookings.create': { paramsTuple?: []; params?: {} }
    'bookings.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'workflow_cycles.index': { paramsTuple?: []; params?: {} }
    'workflow_cycles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal_booking_types.index': { paramsTuple?: []; params?: {} }
    'portal_booking_types.create': { paramsTuple?: []; params?: {} }
    'portal_booking_types.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'packages': { paramsTuple?: []; params?: {} }
    'destinations': { paramsTuple?: []; params?: {} }
    'customers': { paramsTuple?: []; params?: {} }
    'customers.create': { paramsTuple?: []; params?: {} }
    'customers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offices': { paramsTuple?: []; params?: {} }
    'agents': { paramsTuple?: []; params?: {} }
    'documents': { paramsTuple?: []; params?: {} }
    'documents.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'suppliers': { paramsTuple?: []; params?: {} }
    'suppliers.create': { paramsTuple?: []; params?: {} }
    'suppliers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotations': { paramsTuple?: []; params?: {} }
    'quotations.create': { paramsTuple?: []; params?: {} }
    'quotations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotations.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'invoices': { paramsTuple?: []; params?: {} }
    'invoices.create': { paramsTuple?: []; params?: {} }
    'invoices.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'invoices.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quickbooks.accounts': { paramsTuple?: []; params?: {} }
    'quickbooks.items': { paramsTuple?: []; params?: {} }
    'receipts': { paramsTuple?: []; params?: {} }
    'receipts.create': { paramsTuple?: []; params?: {} }
    'payments': { paramsTuple?: []; params?: {} }
    'payments.create': { paramsTuple?: []; params?: {} }
    'recovery_reports.index': { paramsTuple?: []; params?: {} }
    'recovery_reports.items.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recovery_reports.export': { paramsTuple?: []; params?: {} }
    'recovery_reports.export_pdf': { paramsTuple?: []; params?: {} }
    'reports': { paramsTuple?: []; params?: {} }
    'reports.templates': { paramsTuple?: []; params?: {} }
    'reports.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users': { paramsTuple?: []; params?: {} }
    'users.create': { paramsTuple?: []; params?: {} }
    'roles': { paramsTuple?: []; params?: {} }
    'settings': { paramsTuple?: []; params?: {} }
    'settings.general': { paramsTuple?: []; params?: {} }
    'settings.smtp': { paramsTuple?: []; params?: {} }
    'settings.sms': { paramsTuple?: []; params?: {} }
    'settings.whatsapp': { paramsTuple?: []; params?: {} }
    'settings.other': { paramsTuple?: []; params?: {} }
    'settings.security': { paramsTuple?: []; params?: {} }
    'settings.quickbooks': { paramsTuple?: []; params?: {} }
    'settings.quickbooks.connect': { paramsTuple?: []; params?: {} }
    'profile': { paramsTuple?: []; params?: {} }
    'user_settings': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'legal.eula': { paramsTuple?: []; params?: {} }
    'legal.privacy': { paramsTuple?: []; params?: {} }
    'portal.login': { paramsTuple?: []; params?: {} }
    'portal.register': { paramsTuple?: []; params?: {} }
    'portal.dashboard': { paramsTuple?: []; params?: {} }
    'portal.enquiries.index': { paramsTuple?: []; params?: {} }
    'portal.enquiries.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.enquiries.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.bookings.index': { paramsTuple?: []; params?: {} }
    'portal.bookings.create': { paramsTuple?: []; params?: {} }
    'portal.bookings.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.quotations.index': { paramsTuple?: []; params?: {} }
    'portal.quotations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.quotations.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.recovery_reports.index': { paramsTuple?: []; params?: {} }
    'portal.recovery_reports.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.recovery_reports.document': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.recovery_reports.export': { paramsTuple?: []; params?: {} }
    'portal.recovery_reports.export_pdf': { paramsTuple?: []; params?: {} }
    'portal.invoices': { paramsTuple?: []; params?: {} }
    'portal.invoices.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.invoices.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.users': { paramsTuple?: []; params?: {} }
    'portal.users.create': { paramsTuple?: []; params?: {} }
    'portal.users.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.mfa': { paramsTuple?: []; params?: {} }
    'settings.quickbooks.callback': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'enquiries': { paramsTuple?: []; params?: {} }
    'enquiries.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'enquiries.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bookings': { paramsTuple?: []; params?: {} }
    'bookings.create': { paramsTuple?: []; params?: {} }
    'bookings.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'workflow_cycles.index': { paramsTuple?: []; params?: {} }
    'workflow_cycles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal_booking_types.index': { paramsTuple?: []; params?: {} }
    'portal_booking_types.create': { paramsTuple?: []; params?: {} }
    'portal_booking_types.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'packages': { paramsTuple?: []; params?: {} }
    'destinations': { paramsTuple?: []; params?: {} }
    'customers': { paramsTuple?: []; params?: {} }
    'customers.create': { paramsTuple?: []; params?: {} }
    'customers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offices': { paramsTuple?: []; params?: {} }
    'agents': { paramsTuple?: []; params?: {} }
    'documents': { paramsTuple?: []; params?: {} }
    'documents.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'suppliers': { paramsTuple?: []; params?: {} }
    'suppliers.create': { paramsTuple?: []; params?: {} }
    'suppliers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotations': { paramsTuple?: []; params?: {} }
    'quotations.create': { paramsTuple?: []; params?: {} }
    'quotations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotations.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'invoices': { paramsTuple?: []; params?: {} }
    'invoices.create': { paramsTuple?: []; params?: {} }
    'invoices.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'invoices.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quickbooks.accounts': { paramsTuple?: []; params?: {} }
    'quickbooks.items': { paramsTuple?: []; params?: {} }
    'receipts': { paramsTuple?: []; params?: {} }
    'receipts.create': { paramsTuple?: []; params?: {} }
    'payments': { paramsTuple?: []; params?: {} }
    'payments.create': { paramsTuple?: []; params?: {} }
    'recovery_reports.index': { paramsTuple?: []; params?: {} }
    'recovery_reports.items.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recovery_reports.export': { paramsTuple?: []; params?: {} }
    'recovery_reports.export_pdf': { paramsTuple?: []; params?: {} }
    'reports': { paramsTuple?: []; params?: {} }
    'reports.templates': { paramsTuple?: []; params?: {} }
    'reports.download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users': { paramsTuple?: []; params?: {} }
    'users.create': { paramsTuple?: []; params?: {} }
    'roles': { paramsTuple?: []; params?: {} }
    'settings': { paramsTuple?: []; params?: {} }
    'settings.general': { paramsTuple?: []; params?: {} }
    'settings.smtp': { paramsTuple?: []; params?: {} }
    'settings.sms': { paramsTuple?: []; params?: {} }
    'settings.whatsapp': { paramsTuple?: []; params?: {} }
    'settings.other': { paramsTuple?: []; params?: {} }
    'settings.security': { paramsTuple?: []; params?: {} }
    'settings.quickbooks': { paramsTuple?: []; params?: {} }
    'settings.quickbooks.connect': { paramsTuple?: []; params?: {} }
    'profile': { paramsTuple?: []; params?: {} }
    'user_settings': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'portal.login.store': { paramsTuple?: []; params?: {} }
    'portal.register.store': { paramsTuple?: []; params?: {} }
    'portal.enquiries.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.bookings.cart.add': { paramsTuple?: []; params?: {} }
    'portal.bookings.cart.remove': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'portal.bookings.cart.budget': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'portal.bookings.submit': { paramsTuple?: []; params?: {} }
    'portal.bookings.store': { paramsTuple?: []; params?: {} }
    'portal.quotations.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.recovery_reports.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.recovery_reports.query': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.recovery_reports.reject': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.invoices.pay': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.users.store': { paramsTuple?: []; params?: {} }
    'portal.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal.logout': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.mfa.store': { paramsTuple?: []; params?: {} }
    'bookings.store': { paramsTuple?: []; params?: {} }
    'portal_booking_types.store': { paramsTuple?: []; params?: {} }
    'portal_booking_types.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal_booking_types.fields.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'portal_booking_types.fields.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'fieldId': ParamValue} }
    'portal_booking_types.fields.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'fieldId': ParamValue} }
    'bookings.confirm': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bookings.record_supplier_payment': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bookings.quotations.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bookings.create_invoice': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.store': { paramsTuple?: []; params?: {} }
    'documents.store': { paramsTuple?: []; params?: {} }
    'suppliers.store': { paramsTuple?: []; params?: {} }
    'quotations.store': { paramsTuple?: []; params?: {} }
    'quotations.send': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'invoices.store': { paramsTuple?: []; params?: {} }
    'invoices.issue': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'invoices.mark_paid': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quickbooks.accounts.refresh': { paramsTuple?: []; params?: {} }
    'quickbooks.items.refresh': { paramsTuple?: []; params?: {} }
    'receipts.store': { paramsTuple?: []; params?: {} }
    'payments.store': { paramsTuple?: []; params?: {} }
    'recovery_reports.items.send': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recovery_reports.items.mark_recovered': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recovery_reports.weekly_export': { paramsTuple?: []; params?: {} }
    'reports.templates.store': { paramsTuple?: []; params?: {} }
    'reports.run': { paramsTuple?: []; params?: {} }
    'users.store': { paramsTuple?: []; params?: {} }
    'settings.smtp.test': { paramsTuple?: []; params?: {} }
    'settings.security.mfa.start': { paramsTuple?: []; params?: {} }
    'settings.security.mfa.confirm': { paramsTuple?: []; params?: {} }
    'settings.security.mfa.disable': { paramsTuple?: []; params?: {} }
    'settings.quickbooks.disconnect': { paramsTuple?: []; params?: {} }
    'settings.quickbooks.test': { paramsTuple?: []; params?: {} }
    'invoices.quickbooks.retry': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.quickbooks.retry': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'documents.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'roles.update': { paramsTuple?: []; params?: {} }
    'settings.general.update': { paramsTuple?: []; params?: {} }
    'settings.smtp.update': { paramsTuple?: []; params?: {} }
    'settings.sms.update': { paramsTuple?: []; params?: {} }
    'settings.whatsapp.update': { paramsTuple?: []; params?: {} }
    'settings.other.update': { paramsTuple?: []; params?: {} }
    'settings.security.update': { paramsTuple?: []; params?: {} }
    'settings.quickbooks.credentials': { paramsTuple?: []; params?: {} }
    'settings.quickbooks.update': { paramsTuple?: []; params?: {} }
    'user_settings.password': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}