/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/home_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/home_controller').default['index']>>>
    }
  }
  'legal.eula': {
    methods: ["GET","HEAD"]
    pattern: '/legal/eula'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'legal.privacy': {
    methods: ["GET","HEAD"]
    pattern: '/legal/privacy'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'portal.login': {
    methods: ["GET","HEAD"]
    pattern: '/portal/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_session_controller').default['create']>>>
    }
  }
  'portal.login.store': {
    methods: ["POST"]
    pattern: '/portal/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_session_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_session_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'portal.register': {
    methods: ["GET","HEAD"]
    pattern: '/portal/register'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_registration_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_registration_controller').default['create']>>>
    }
  }
  'portal.register.store': {
    methods: ["POST"]
    pattern: '/portal/register'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/portal_validator').portalRegistrationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/portal_validator').portalRegistrationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_registration_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_registration_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'portal.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/portal/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_dashboard_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_dashboard_controller').default['index']>>>
    }
  }
  'portal.enquiries.index': {
    methods: ["GET","HEAD"]
    pattern: '/portal/enquiries'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_enquiries_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_enquiries_controller').default['index']>>>
    }
  }
  'portal.enquiries.show': {
    methods: ["GET","HEAD"]
    pattern: '/portal/enquiries/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_enquiries_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_enquiries_controller').default['show']>>>
    }
  }
  'portal.enquiries.download': {
    methods: ["GET","HEAD"]
    pattern: '/portal/enquiries/:id/download'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_enquiries_controller').default['download']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_enquiries_controller').default['download']>>>
    }
  }
  'portal.enquiries.cancel': {
    methods: ["POST"]
    pattern: '/portal/enquiries/:id/cancel'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_enquiries_controller').default['cancel']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_enquiries_controller').default['cancel']>>>
    }
  }
  'portal.bookings.index': {
    methods: ["GET","HEAD"]
    pattern: '/portal/bookings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_bookings_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_bookings_controller').default['index']>>>
    }
  }
  'portal.bookings.create': {
    methods: ["GET","HEAD"]
    pattern: '/portal/bookings/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_bookings_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_bookings_controller').default['create']>>>
    }
  }
  'portal.bookings.cart.add': {
    methods: ["POST"]
    pattern: '/portal/bookings/cart'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_bookings_controller').default['addToCart']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_bookings_controller').default['addToCart']>>>
    }
  }
  'portal.bookings.cart.remove': {
    methods: ["POST"]
    pattern: '/portal/bookings/cart/:itemId/remove'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_bookings_controller').default['removeFromCart']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_bookings_controller').default['removeFromCart']>>>
    }
  }
  'portal.bookings.cart.budget': {
    methods: ["POST"]
    pattern: '/portal/bookings/cart/:itemId/budget'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_bookings_controller').default['updateCartBudget']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_bookings_controller').default['updateCartBudget']>>>
    }
  }
  'portal.bookings.submit': {
    methods: ["POST"]
    pattern: '/portal/bookings/submit'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_bookings_controller').default['submitCart']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_bookings_controller').default['submitCart']>>>
    }
  }
  'portal.bookings.store': {
    methods: ["POST"]
    pattern: '/portal/bookings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_bookings_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_bookings_controller').default['store']>>>
    }
  }
  'portal.bookings.show': {
    methods: ["GET","HEAD"]
    pattern: '/portal/bookings/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_dashboard_controller').default['showBooking']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_dashboard_controller').default['showBooking']>>>
    }
  }
  'portal.quotations.index': {
    methods: ["GET","HEAD"]
    pattern: '/portal/quotations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_quotations_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_quotations_controller').default['index']>>>
    }
  }
  'portal.quotations.show': {
    methods: ["GET","HEAD"]
    pattern: '/portal/quotations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_quotations_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_quotations_controller').default['show']>>>
    }
  }
  'portal.quotations.download': {
    methods: ["GET","HEAD"]
    pattern: '/portal/quotations/:id/download'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_quotations_controller').default['download']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_quotations_controller').default['download']>>>
    }
  }
  'portal.quotations.approve': {
    methods: ["POST"]
    pattern: '/portal/quotations/:id/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_quotations_controller').default['approve']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_quotations_controller').default['approve']>>>
    }
  }
  'portal.recovery_reports.index': {
    methods: ["GET","HEAD"]
    pattern: '/portal/recovery-reports'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/recovery_reporting_validator').recoveryItemQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_recovery_reports_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_recovery_reports_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'portal.recovery_reports.show': {
    methods: ["GET","HEAD"]
    pattern: '/portal/recovery-reports/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_recovery_reports_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_recovery_reports_controller').default['show']>>>
    }
  }
  'portal.recovery_reports.approve': {
    methods: ["POST"]
    pattern: '/portal/recovery-reports/:id/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_recovery_reports_controller').default['approve']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_recovery_reports_controller').default['approve']>>>
    }
  }
  'portal.recovery_reports.query': {
    methods: ["POST"]
    pattern: '/portal/recovery-reports/:id/query'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/recovery_reporting_validator').recoveryClientQueryValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/recovery_reporting_validator').recoveryClientQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_recovery_reports_controller').default['query']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_recovery_reports_controller').default['query']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'portal.recovery_reports.reject': {
    methods: ["POST"]
    pattern: '/portal/recovery-reports/:id/reject'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/recovery_reporting_validator').recoveryClientRejectValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/recovery_reporting_validator').recoveryClientRejectValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_recovery_reports_controller').default['reject']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_recovery_reports_controller').default['reject']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'portal.recovery_reports.document': {
    methods: ["GET","HEAD"]
    pattern: '/portal/recovery-reports/:id/document'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_recovery_reports_controller').default['downloadDocument']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_recovery_reports_controller').default['downloadDocument']>>>
    }
  }
  'portal.recovery_reports.export': {
    methods: ["GET","HEAD"]
    pattern: '/portal/recovery-reports/export'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/recovery_reporting_validator').recoveryItemQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_recovery_reports_controller').default['export']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_recovery_reports_controller').default['export']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'portal.recovery_reports.export_pdf': {
    methods: ["GET","HEAD"]
    pattern: '/portal/recovery-reports/export-pdf'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/recovery_reporting_validator').recoveryItemQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_recovery_reports_controller').default['exportPdf']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_recovery_reports_controller').default['exportPdf']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'portal.invoices': {
    methods: ["GET","HEAD"]
    pattern: '/portal/invoices'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_invoices_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_invoices_controller').default['index']>>>
    }
  }
  'portal.invoices.show': {
    methods: ["GET","HEAD"]
    pattern: '/portal/invoices/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_invoices_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_invoices_controller').default['show']>>>
    }
  }
  'portal.invoices.download': {
    methods: ["GET","HEAD"]
    pattern: '/portal/invoices/:id/download'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_invoices_controller').default['download']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_invoices_controller').default['download']>>>
    }
  }
  'portal.invoices.pay': {
    methods: ["POST"]
    pattern: '/portal/invoices/:id/pay'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/portal_validator').portalPaymentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/portal_validator').portalPaymentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_invoices_controller').default['pay']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_invoices_controller').default['pay']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'portal.users': {
    methods: ["GET","HEAD"]
    pattern: '/portal/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_users_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_users_controller').default['index']>>>
    }
  }
  'portal.users.create': {
    methods: ["GET","HEAD"]
    pattern: '/portal/users/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_users_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_users_controller').default['create']>>>
    }
  }
  'portal.users.store': {
    methods: ["POST"]
    pattern: '/portal/users'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/portal_validator').portalUserStoreValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/portal_validator').portalUserStoreValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_users_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_users_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'portal.users.edit': {
    methods: ["GET","HEAD"]
    pattern: '/portal/users/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_users_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_users_controller').default['edit']>>>
    }
  }
  'portal.users.update': {
    methods: ["POST"]
    pattern: '/portal/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/portal_validator').portalUserUpdateValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/portal_validator').portalUserUpdateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_users_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_users_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'portal.logout': {
    methods: ["POST"]
    pattern: '/portal/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_session_controller').default['destroy']>>>
    }
  }
  'session.create': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
    }
  }
  'session.store': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'session.mfa': {
    methods: ["GET","HEAD"]
    pattern: '/login/mfa'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['createMfa']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['createMfa']>>>
    }
  }
  'session.mfa.store': {
    methods: ["POST"]
    pattern: '/login/mfa'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/security_validator').mfaVerifyValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/security_validator').mfaVerifyValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['storeMfa']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['storeMfa']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.quickbooks.callback': {
    methods: ["GET","HEAD"]
    pattern: '/settings/quickbooks/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quickbooks_settings_controller').default['callback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quickbooks_settings_controller').default['callback']>>>
    }
  }
  'dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
    }
  }
  'enquiries': {
    methods: ["GET","HEAD"]
    pattern: '/enquiries'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/enquiries_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/enquiries_controller').default['index']>>>
    }
  }
  'enquiries.show': {
    methods: ["GET","HEAD"]
    pattern: '/enquiries/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/enquiries_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/enquiries_controller').default['show']>>>
    }
  }
  'enquiries.download': {
    methods: ["GET","HEAD"]
    pattern: '/enquiries/:id/download'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/enquiries_controller').default['download']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/enquiries_controller').default['download']>>>
    }
  }
  'bookings': {
    methods: ["GET","HEAD"]
    pattern: '/bookings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/bookings_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/bookings_controller').default['index']>>>
    }
  }
  'bookings.create': {
    methods: ["GET","HEAD"]
    pattern: '/bookings/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/bookings_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/bookings_controller').default['create']>>>
    }
  }
  'bookings.store': {
    methods: ["POST"]
    pattern: '/bookings'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/booking_validator').bookingStoreValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/booking_validator').bookingStoreValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/bookings_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/bookings_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'bookings.show': {
    methods: ["GET","HEAD"]
    pattern: '/bookings/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/bookings_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/bookings_controller').default['show']>>>
    }
  }
  'workflow_cycles.index': {
    methods: ["GET","HEAD"]
    pattern: '/workflow-cycles'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/workflow_cycles_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/workflow_cycles_controller').default['index']>>>
    }
  }
  'workflow_cycles.show': {
    methods: ["GET","HEAD"]
    pattern: '/workflow-cycles/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/workflow_cycles_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/workflow_cycles_controller').default['show']>>>
    }
  }
  'portal_booking_types.index': {
    methods: ["GET","HEAD"]
    pattern: '/portal-booking-types'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_booking_types_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_booking_types_controller').default['index']>>>
    }
  }
  'portal_booking_types.create': {
    methods: ["GET","HEAD"]
    pattern: '/portal-booking-types/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_booking_types_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_booking_types_controller').default['create']>>>
    }
  }
  'portal_booking_types.store': {
    methods: ["POST"]
    pattern: '/portal-booking-types'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/portal_booking_type_validator').portalBookingTypeStoreValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/portal_booking_type_validator').portalBookingTypeStoreValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_booking_types_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_booking_types_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'portal_booking_types.edit': {
    methods: ["GET","HEAD"]
    pattern: '/portal-booking-types/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_booking_types_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_booking_types_controller').default['edit']>>>
    }
  }
  'portal_booking_types.update': {
    methods: ["POST"]
    pattern: '/portal-booking-types/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/portal_booking_type_validator').portalBookingTypeUpdateValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/portal_booking_type_validator').portalBookingTypeUpdateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_booking_types_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_booking_types_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'portal_booking_types.fields.store': {
    methods: ["POST"]
    pattern: '/portal-booking-types/:id/fields'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/portal_booking_type_validator').portalBookingFieldStoreValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/portal_booking_type_validator').portalBookingFieldStoreValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_booking_types_controller').default['storeField']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_booking_types_controller').default['storeField']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'portal_booking_types.fields.update': {
    methods: ["POST"]
    pattern: '/portal-booking-types/:id/fields/:fieldId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/portal_booking_type_validator').portalBookingFieldUpdateValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; fieldId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/portal_booking_type_validator').portalBookingFieldUpdateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_booking_types_controller').default['updateField']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_booking_types_controller').default['updateField']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'portal_booking_types.fields.destroy': {
    methods: ["POST"]
    pattern: '/portal-booking-types/:id/fields/:fieldId/delete'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; fieldId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/portal_booking_types_controller').default['destroyField']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/portal_booking_types_controller').default['destroyField']>>>
    }
  }
  'bookings.confirm': {
    methods: ["POST"]
    pattern: '/bookings/:id/confirm'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/recovery_reporting_validator').bookingConfirmValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/recovery_reporting_validator').bookingConfirmValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/bookings_controller').default['confirm']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/bookings_controller').default['confirm']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'bookings.record_supplier_payment': {
    methods: ["POST"]
    pattern: '/bookings/:id/record-supplier-payment'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/recovery_reporting_validator').bookingSupplierPaymentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/recovery_reporting_validator').bookingSupplierPaymentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/bookings_controller').default['recordSupplierPayment']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/bookings_controller').default['recordSupplierPayment']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'bookings.quotations.store': {
    methods: ["POST"]
    pattern: '/bookings/:id/quotations'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotations_controller').default['storeFromBooking']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotations_controller').default['storeFromBooking']>>>
    }
  }
  'bookings.create_invoice': {
    methods: ["POST"]
    pattern: '/bookings/:id/create-invoice'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['createFromBooking']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['createFromBooking']>>>
    }
  }
  'packages': {
    methods: ["GET","HEAD"]
    pattern: '/packages'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'destinations': {
    methods: ["GET","HEAD"]
    pattern: '/destinations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'customers': {
    methods: ["GET","HEAD"]
    pattern: '/customers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['index']>>>
    }
  }
  'customers.create': {
    methods: ["GET","HEAD"]
    pattern: '/customers/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['create']>>>
    }
  }
  'customers.store': {
    methods: ["POST"]
    pattern: '/customers'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/customer_validator').customerStoreValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/customer_validator').customerStoreValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'customers.show': {
    methods: ["GET","HEAD"]
    pattern: '/customers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['show']>>>
    }
  }
  'offices': {
    methods: ["GET","HEAD"]
    pattern: '/offices'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'agents': {
    methods: ["GET","HEAD"]
    pattern: '/agents'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'documents': {
    methods: ["GET","HEAD"]
    pattern: '/documents'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/documents_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/documents_controller').default['index']>>>
    }
  }
  'documents.store': {
    methods: ["POST"]
    pattern: '/documents'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/document_validator').documentUploadValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/document_validator').documentUploadValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/documents_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/documents_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'documents.download': {
    methods: ["GET","HEAD"]
    pattern: '/documents/:id/download'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/documents_controller').default['download']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/documents_controller').default['download']>>>
    }
  }
  'documents.destroy': {
    methods: ["DELETE"]
    pattern: '/documents/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/documents_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/documents_controller').default['destroy']>>>
    }
  }
  'suppliers': {
    methods: ["GET","HEAD"]
    pattern: '/suppliers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['index']>>>
    }
  }
  'suppliers.create': {
    methods: ["GET","HEAD"]
    pattern: '/suppliers/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['create']>>>
    }
  }
  'suppliers.store': {
    methods: ["POST"]
    pattern: '/suppliers'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/supplier_validator').supplierStoreValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/supplier_validator').supplierStoreValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'suppliers.show': {
    methods: ["GET","HEAD"]
    pattern: '/suppliers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/suppliers_controller').default['show']>>>
    }
  }
  'quotations': {
    methods: ["GET","HEAD"]
    pattern: '/quotations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotations_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotations_controller').default['index']>>>
    }
  }
  'quotations.create': {
    methods: ["GET","HEAD"]
    pattern: '/quotations/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotations_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotations_controller').default['create']>>>
    }
  }
  'quotations.store': {
    methods: ["POST"]
    pattern: '/quotations'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/quotation_validator').quotationStoreValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/quotation_validator').quotationStoreValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotations_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotations_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'quotations.show': {
    methods: ["GET","HEAD"]
    pattern: '/quotations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotations_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotations_controller').default['show']>>>
    }
  }
  'quotations.download': {
    methods: ["GET","HEAD"]
    pattern: '/quotations/:id/download'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotations_controller').default['download']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotations_controller').default['download']>>>
    }
  }
  'quotations.send': {
    methods: ["POST"]
    pattern: '/quotations/:id/send'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotations_controller').default['send']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotations_controller').default['send']>>>
    }
  }
  'invoices': {
    methods: ["GET","HEAD"]
    pattern: '/invoices'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['index']>>>
    }
  }
  'invoices.create': {
    methods: ["GET","HEAD"]
    pattern: '/invoices/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['create']>>>
    }
  }
  'invoices.store': {
    methods: ["POST"]
    pattern: '/invoices'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/invoice_validator').invoiceStoreValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/invoice_validator').invoiceStoreValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'invoices.show': {
    methods: ["GET","HEAD"]
    pattern: '/invoices/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['show']>>>
    }
  }
  'invoices.download': {
    methods: ["GET","HEAD"]
    pattern: '/invoices/:id/download'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['download']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['download']>>>
    }
  }
  'invoices.issue': {
    methods: ["POST"]
    pattern: '/invoices/:id/issue'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['issue']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['issue']>>>
    }
  }
  'invoices.mark_paid': {
    methods: ["POST"]
    pattern: '/invoices/:id/mark-paid'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['markPaid']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['markPaid']>>>
    }
  }
  'quickbooks.accounts': {
    methods: ["GET","HEAD"]
    pattern: '/quickbooks/accounts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quickbooks_accounts_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quickbooks_accounts_controller').default['index']>>>
    }
  }
  'quickbooks.accounts.refresh': {
    methods: ["POST"]
    pattern: '/quickbooks/accounts/refresh'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quickbooks_accounts_controller').default['refresh']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quickbooks_accounts_controller').default['refresh']>>>
    }
  }
  'quickbooks.items': {
    methods: ["GET","HEAD"]
    pattern: '/quickbooks/items'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quickbooks_items_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quickbooks_items_controller').default['index']>>>
    }
  }
  'quickbooks.items.refresh': {
    methods: ["POST"]
    pattern: '/quickbooks/items/refresh'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quickbooks_items_controller').default['refresh']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quickbooks_items_controller').default['refresh']>>>
    }
  }
  'receipts': {
    methods: ["GET","HEAD"]
    pattern: '/receipts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/receipts_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/receipts_controller').default['index']>>>
    }
  }
  'receipts.create': {
    methods: ["GET","HEAD"]
    pattern: '/receipts/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/receipts_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/receipts_controller').default['create']>>>
    }
  }
  'receipts.store': {
    methods: ["POST"]
    pattern: '/receipts'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/receipt_validator').receiptStoreValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/receipt_validator').receiptStoreValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/receipts_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/receipts_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'payments': {
    methods: ["GET","HEAD"]
    pattern: '/payments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['index']>>>
    }
  }
  'payments.create': {
    methods: ["GET","HEAD"]
    pattern: '/payments/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['create']>>>
    }
  }
  'payments.store': {
    methods: ["POST"]
    pattern: '/payments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/payment_validator').paymentStoreValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/payment_validator').paymentStoreValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'recovery_reports.index': {
    methods: ["GET","HEAD"]
    pattern: '/recovery-reports'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/recovery_reporting_validator').recoveryItemQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/recovery_reports_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/recovery_reports_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'recovery_reports.items.show': {
    methods: ["GET","HEAD"]
    pattern: '/recovery-reports/items/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/recovery_reports_controller').default['showItem']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/recovery_reports_controller').default['showItem']>>>
    }
  }
  'recovery_reports.items.send': {
    methods: ["POST"]
    pattern: '/recovery-reports/items/:id/send-to-client'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/recovery_reports_controller').default['sendToClient']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/recovery_reports_controller').default['sendToClient']>>>
    }
  }
  'recovery_reports.items.mark_recovered': {
    methods: ["POST"]
    pattern: '/recovery-reports/items/:id/mark-recovered'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/recovery_reports_controller').default['markRecovered']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/recovery_reports_controller').default['markRecovered']>>>
    }
  }
  'recovery_reports.export': {
    methods: ["GET","HEAD"]
    pattern: '/recovery-reports/export'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/recovery_reporting_validator').recoveryItemQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/recovery_reports_controller').default['export']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/recovery_reports_controller').default['export']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'recovery_reports.export_pdf': {
    methods: ["GET","HEAD"]
    pattern: '/recovery-reports/export-pdf'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/recovery_reporting_validator').recoveryItemQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/recovery_reports_controller').default['exportPdf']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/recovery_reports_controller').default['exportPdf']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'recovery_reports.weekly_export': {
    methods: ["POST"]
    pattern: '/recovery-reports/weekly-export'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/recovery_reporting_validator').recoveryItemQueryValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/recovery_reporting_validator').recoveryItemQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/recovery_reports_controller').default['weeklyExport']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/recovery_reports_controller').default['weeklyExport']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'reports': {
    methods: ["GET","HEAD"]
    pattern: '/reports'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['index']>>>
    }
  }
  'reports.templates': {
    methods: ["GET","HEAD"]
    pattern: '/reports/templates'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['templates']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['templates']>>>
    }
  }
  'reports.templates.store': {
    methods: ["POST"]
    pattern: '/reports/templates'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/report_validator').reportTemplateStoreValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/report_validator').reportTemplateStoreValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['storeTemplate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['storeTemplate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'reports.run': {
    methods: ["POST"]
    pattern: '/reports/run'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/report_validator').reportRunValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/report_validator').reportRunValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['run']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['run']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'reports.download': {
    methods: ["GET","HEAD"]
    pattern: '/reports/runs/:id/download'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['download']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/reports_controller').default['download']>>>
    }
  }
  'users': {
    methods: ["GET","HEAD"]
    pattern: '/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['index']>>>
    }
  }
  'users.create': {
    methods: ["GET","HEAD"]
    pattern: '/users/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['create']>>>
    }
  }
  'users.store': {
    methods: ["POST"]
    pattern: '/users'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user_validator').userStoreValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user_validator').userStoreValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'roles': {
    methods: ["GET","HEAD"]
    pattern: '/roles'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/roles_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/roles_controller').default['index']>>>
    }
  }
  'roles.update': {
    methods: ["PATCH"]
    pattern: '/roles'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/role_permissions_validator').rolePermissionsUpdateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/role_permissions_validator').rolePermissionsUpdateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/roles_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/roles_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings': {
    methods: ["GET","HEAD"]
    pattern: '/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['index']>>>
    }
  }
  'settings.general': {
    methods: ["GET","HEAD"]
    pattern: '/settings/general'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['general']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['general']>>>
    }
  }
  'settings.general.update': {
    methods: ["PATCH"]
    pattern: '/settings/general'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/system_settings_validator').generalSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/system_settings_validator').generalSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['updateGeneral']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['updateGeneral']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.smtp': {
    methods: ["GET","HEAD"]
    pattern: '/settings/smtp'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['smtp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['smtp']>>>
    }
  }
  'settings.smtp.update': {
    methods: ["PATCH"]
    pattern: '/settings/smtp'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/system_settings_validator').smtpSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/system_settings_validator').smtpSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['updateSmtp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['updateSmtp']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.smtp.test': {
    methods: ["POST"]
    pattern: '/settings/smtp/test'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/system_settings_validator').smtpTestValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/system_settings_validator').smtpTestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['testSmtp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['testSmtp']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.sms': {
    methods: ["GET","HEAD"]
    pattern: '/settings/sms'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['sms']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['sms']>>>
    }
  }
  'settings.sms.update': {
    methods: ["PATCH"]
    pattern: '/settings/sms'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/system_settings_validator').smsSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/system_settings_validator').smsSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['updateSms']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['updateSms']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.whatsapp': {
    methods: ["GET","HEAD"]
    pattern: '/settings/whatsapp'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['whatsapp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['whatsapp']>>>
    }
  }
  'settings.whatsapp.update': {
    methods: ["PATCH"]
    pattern: '/settings/whatsapp'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/system_settings_validator').whatsappSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/system_settings_validator').whatsappSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['updateWhatsapp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['updateWhatsapp']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.other': {
    methods: ["GET","HEAD"]
    pattern: '/settings/other'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['other']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['other']>>>
    }
  }
  'settings.other.update': {
    methods: ["PATCH"]
    pattern: '/settings/other'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/system_settings_validator').otherSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/system_settings_validator').otherSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['updateOther']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['updateOther']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.security': {
    methods: ["GET","HEAD"]
    pattern: '/settings/security'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['security']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['security']>>>
    }
  }
  'settings.security.update': {
    methods: ["PATCH"]
    pattern: '/settings/security'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/security_validator').securitySettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/security_validator').securitySettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['updateSecurity']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['updateSecurity']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.security.mfa.start': {
    methods: ["POST"]
    pattern: '/settings/security/mfa/start'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['startMfaSetup']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['startMfaSetup']>>>
    }
  }
  'settings.security.mfa.confirm': {
    methods: ["POST"]
    pattern: '/settings/security/mfa/confirm'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/security_validator').mfaVerifyValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/security_validator').mfaVerifyValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['confirmMfaSetup']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['confirmMfaSetup']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.security.mfa.disable': {
    methods: ["POST"]
    pattern: '/settings/security/mfa/disable'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/security_validator').mfaDisableValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/security_validator').mfaDisableValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['disableMfa']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_settings_controller').default['disableMfa']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.quickbooks': {
    methods: ["GET","HEAD"]
    pattern: '/settings/quickbooks'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quickbooks_settings_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quickbooks_settings_controller').default['index']>>>
    }
  }
  'settings.quickbooks.connect': {
    methods: ["GET","HEAD"]
    pattern: '/settings/quickbooks/connect'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quickbooks_settings_controller').default['connect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quickbooks_settings_controller').default['connect']>>>
    }
  }
  'settings.quickbooks.disconnect': {
    methods: ["POST"]
    pattern: '/settings/quickbooks/disconnect'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quickbooks_settings_controller').default['disconnect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quickbooks_settings_controller').default['disconnect']>>>
    }
  }
  'settings.quickbooks.credentials': {
    methods: ["PATCH"]
    pattern: '/settings/quickbooks/credentials'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/quickbooks_validator').quickbooksCredentialsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/quickbooks_validator').quickbooksCredentialsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quickbooks_settings_controller').default['updateCredentials']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quickbooks_settings_controller').default['updateCredentials']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.quickbooks.test': {
    methods: ["POST"]
    pattern: '/settings/quickbooks/test'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quickbooks_settings_controller').default['testConnection']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quickbooks_settings_controller').default['testConnection']>>>
    }
  }
  'settings.quickbooks.update': {
    methods: ["PATCH"]
    pattern: '/settings/quickbooks'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/quickbooks_validator').quickbooksSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/quickbooks_validator').quickbooksSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quickbooks_settings_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quickbooks_settings_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'invoices.quickbooks.retry': {
    methods: ["POST"]
    pattern: '/invoices/:id/quickbooks/retry'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['retryQuickbooksSync']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invoices_controller').default['retryQuickbooksSync']>>>
    }
  }
  'customers.quickbooks.retry': {
    methods: ["POST"]
    pattern: '/customers/:id/quickbooks/retry'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['retryQuickbooksSync']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/customers_controller').default['retryQuickbooksSync']>>>
    }
  }
  'profile': {
    methods: ["GET","HEAD"]
    pattern: '/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'user_settings': {
    methods: ["GET","HEAD"]
    pattern: '/user-settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['settings']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['settings']>>>
    }
  }
  'user_settings.password': {
    methods: ["PATCH"]
    pattern: '/user-settings/password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user_validator').passwordUpdateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user_validator').passwordUpdateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['updatePassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['updatePassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'session.destroy': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
    }
  }
}
