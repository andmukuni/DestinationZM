/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  legal: {
    eula: typeof routes['legal.eula']
    privacy: typeof routes['legal.privacy']
  }
  portal: {
    login: typeof routes['portal.login'] & {
      store: typeof routes['portal.login.store']
    }
    register: typeof routes['portal.register'] & {
      store: typeof routes['portal.register.store']
    }
    dashboard: typeof routes['portal.dashboard']
    enquiries: {
      index: typeof routes['portal.enquiries.index']
      show: typeof routes['portal.enquiries.show']
      download: typeof routes['portal.enquiries.download']
      cancel: typeof routes['portal.enquiries.cancel']
    }
    bookings: {
      index: typeof routes['portal.bookings.index']
      create: typeof routes['portal.bookings.create']
      cart: {
        add: typeof routes['portal.bookings.cart.add']
        remove: typeof routes['portal.bookings.cart.remove']
        budget: typeof routes['portal.bookings.cart.budget']
      }
      submit: typeof routes['portal.bookings.submit']
      store: typeof routes['portal.bookings.store']
      show: typeof routes['portal.bookings.show']
    }
    quotations: {
      index: typeof routes['portal.quotations.index']
      show: typeof routes['portal.quotations.show']
      download: typeof routes['portal.quotations.download']
      approve: typeof routes['portal.quotations.approve']
    }
    recoveryReports: {
      index: typeof routes['portal.recovery_reports.index']
      show: typeof routes['portal.recovery_reports.show']
      approve: typeof routes['portal.recovery_reports.approve']
      query: typeof routes['portal.recovery_reports.query']
      reject: typeof routes['portal.recovery_reports.reject']
      document: typeof routes['portal.recovery_reports.document']
      export: typeof routes['portal.recovery_reports.export']
      exportPdf: typeof routes['portal.recovery_reports.export_pdf']
    }
    invoices: typeof routes['portal.invoices'] & {
      show: typeof routes['portal.invoices.show']
      download: typeof routes['portal.invoices.download']
      pay: typeof routes['portal.invoices.pay']
    }
    users: typeof routes['portal.users'] & {
      create: typeof routes['portal.users.create']
      store: typeof routes['portal.users.store']
      edit: typeof routes['portal.users.edit']
      update: typeof routes['portal.users.update']
    }
    logout: typeof routes['portal.logout']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  dashboard: typeof routes['dashboard']
  enquiries: typeof routes['enquiries'] & {
    show: typeof routes['enquiries.show']
    download: typeof routes['enquiries.download']
  }
  bookings: typeof routes['bookings'] & {
    create: typeof routes['bookings.create']
    store: typeof routes['bookings.store']
    show: typeof routes['bookings.show']
    confirm: typeof routes['bookings.confirm']
    recordSupplierPayment: typeof routes['bookings.record_supplier_payment']
    quotations: {
      store: typeof routes['bookings.quotations.store']
    }
    createInvoice: typeof routes['bookings.create_invoice']
  }
  workflowCycles: {
    index: typeof routes['workflow_cycles.index']
    show: typeof routes['workflow_cycles.show']
  }
  portalBookingTypes: {
    index: typeof routes['portal_booking_types.index']
    create: typeof routes['portal_booking_types.create']
    store: typeof routes['portal_booking_types.store']
    edit: typeof routes['portal_booking_types.edit']
    update: typeof routes['portal_booking_types.update']
    fields: {
      store: typeof routes['portal_booking_types.fields.store']
      update: typeof routes['portal_booking_types.fields.update']
      destroy: typeof routes['portal_booking_types.fields.destroy']
    }
  }
  packages: typeof routes['packages']
  destinations: typeof routes['destinations']
  customers: typeof routes['customers'] & {
    create: typeof routes['customers.create']
    store: typeof routes['customers.store']
    show: typeof routes['customers.show']
  }
  offices: typeof routes['offices']
  agents: typeof routes['agents']
  documents: typeof routes['documents'] & {
    store: typeof routes['documents.store']
    download: typeof routes['documents.download']
    destroy: typeof routes['documents.destroy']
  }
  suppliers: typeof routes['suppliers'] & {
    create: typeof routes['suppliers.create']
    store: typeof routes['suppliers.store']
    show: typeof routes['suppliers.show']
  }
  quotations: typeof routes['quotations'] & {
    create: typeof routes['quotations.create']
    store: typeof routes['quotations.store']
    show: typeof routes['quotations.show']
    download: typeof routes['quotations.download']
    send: typeof routes['quotations.send']
  }
  invoices: typeof routes['invoices'] & {
    create: typeof routes['invoices.create']
    store: typeof routes['invoices.store']
    show: typeof routes['invoices.show']
    download: typeof routes['invoices.download']
    issue: typeof routes['invoices.issue']
    markPaid: typeof routes['invoices.mark_paid']
    quickbooks: {
      retry: typeof routes['invoices.quickbooks.retry']
    }
  }
  receipts: typeof routes['receipts'] & {
    create: typeof routes['receipts.create']
    store: typeof routes['receipts.store']
  }
  payments: typeof routes['payments'] & {
    create: typeof routes['payments.create']
    store: typeof routes['payments.store']
  }
  recoveryReports: {
    index: typeof routes['recovery_reports.index']
    items: {
      show: typeof routes['recovery_reports.items.show']
      send: typeof routes['recovery_reports.items.send']
      markRecovered: typeof routes['recovery_reports.items.mark_recovered']
    }
    export: typeof routes['recovery_reports.export']
    exportPdf: typeof routes['recovery_reports.export_pdf']
    weeklyExport: typeof routes['recovery_reports.weekly_export']
  }
  reports: typeof routes['reports'] & {
    templates: typeof routes['reports.templates'] & {
      store: typeof routes['reports.templates.store']
    }
    run: typeof routes['reports.run']
    download: typeof routes['reports.download']
  }
  users: typeof routes['users'] & {
    create: typeof routes['users.create']
    store: typeof routes['users.store']
  }
  roles: typeof routes['roles'] & {
    update: typeof routes['roles.update']
  }
  settings: typeof routes['settings'] & {
    general: typeof routes['settings.general'] & {
      update: typeof routes['settings.general.update']
    }
    smtp: typeof routes['settings.smtp'] & {
      update: typeof routes['settings.smtp.update']
      test: typeof routes['settings.smtp.test']
    }
    sms: typeof routes['settings.sms'] & {
      update: typeof routes['settings.sms.update']
    }
    whatsapp: typeof routes['settings.whatsapp'] & {
      update: typeof routes['settings.whatsapp.update']
    }
    other: typeof routes['settings.other'] & {
      update: typeof routes['settings.other.update']
    }
    quickbooks: typeof routes['settings.quickbooks'] & {
      connect: typeof routes['settings.quickbooks.connect']
      callback: typeof routes['settings.quickbooks.callback']
      disconnect: typeof routes['settings.quickbooks.disconnect']
      credentials: typeof routes['settings.quickbooks.credentials']
      test: typeof routes['settings.quickbooks.test']
      update: typeof routes['settings.quickbooks.update']
    }
  }
  profile: typeof routes['profile']
  userSettings: typeof routes['user_settings'] & {
    password: typeof routes['user_settings.password']
  }
}
