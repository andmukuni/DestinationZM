import type { Registry } from './schema.d.ts';
import type { ApiDefinition } from './tree.d.ts';
declare const routes: {
    readonly home: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/";
        readonly tokens: [{
            readonly old: "/";
            readonly type: 0;
            readonly val: "/";
            readonly end: "";
        }];
        readonly types: Registry["home"]["types"];
    };
    readonly 'portal.login': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/portal/login";
        readonly tokens: [{
            readonly old: "/portal/login";
            readonly type: 0;
            readonly val: "portal";
            readonly end: "";
        }, {
            readonly old: "/portal/login";
            readonly type: 0;
            readonly val: "login";
            readonly end: "";
        }];
        readonly types: Registry["portal.login"]["types"];
    };
    readonly 'portal.login.store': {
        readonly methods: ["POST"];
        readonly pattern: "/portal/login";
        readonly tokens: [{
            readonly old: "/portal/login";
            readonly type: 0;
            readonly val: "portal";
            readonly end: "";
        }, {
            readonly old: "/portal/login";
            readonly type: 0;
            readonly val: "login";
            readonly end: "";
        }];
        readonly types: Registry["portal.login.store"]["types"];
    };
    readonly 'portal.dashboard': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/portal/dashboard";
        readonly tokens: [{
            readonly old: "/portal/dashboard";
            readonly type: 0;
            readonly val: "portal";
            readonly end: "";
        }, {
            readonly old: "/portal/dashboard";
            readonly type: 0;
            readonly val: "dashboard";
            readonly end: "";
        }];
        readonly types: Registry["portal.dashboard"]["types"];
    };
    readonly 'portal.bookings.create': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/portal/bookings/create";
        readonly tokens: [{
            readonly old: "/portal/bookings/create";
            readonly type: 0;
            readonly val: "portal";
            readonly end: "";
        }, {
            readonly old: "/portal/bookings/create";
            readonly type: 0;
            readonly val: "bookings";
            readonly end: "";
        }, {
            readonly old: "/portal/bookings/create";
            readonly type: 0;
            readonly val: "create";
            readonly end: "";
        }];
        readonly types: Registry["portal.bookings.create"]["types"];
    };
    readonly 'portal.bookings.store': {
        readonly methods: ["POST"];
        readonly pattern: "/portal/bookings";
        readonly tokens: [{
            readonly old: "/portal/bookings";
            readonly type: 0;
            readonly val: "portal";
            readonly end: "";
        }, {
            readonly old: "/portal/bookings";
            readonly type: 0;
            readonly val: "bookings";
            readonly end: "";
        }];
        readonly types: Registry["portal.bookings.store"]["types"];
    };
    readonly 'portal.bookings.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/portal/bookings/:id";
        readonly tokens: [{
            readonly old: "/portal/bookings/:id";
            readonly type: 0;
            readonly val: "portal";
            readonly end: "";
        }, {
            readonly old: "/portal/bookings/:id";
            readonly type: 0;
            readonly val: "bookings";
            readonly end: "";
        }, {
            readonly old: "/portal/bookings/:id";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }];
        readonly types: Registry["portal.bookings.show"]["types"];
    };
    readonly 'portal.quotations.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/portal/quotations/:id";
        readonly tokens: [{
            readonly old: "/portal/quotations/:id";
            readonly type: 0;
            readonly val: "portal";
            readonly end: "";
        }, {
            readonly old: "/portal/quotations/:id";
            readonly type: 0;
            readonly val: "quotations";
            readonly end: "";
        }, {
            readonly old: "/portal/quotations/:id";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }];
        readonly types: Registry["portal.quotations.show"]["types"];
    };
    readonly 'portal.quotations.approve': {
        readonly methods: ["POST"];
        readonly pattern: "/portal/quotations/:id/approve";
        readonly tokens: [{
            readonly old: "/portal/quotations/:id/approve";
            readonly type: 0;
            readonly val: "portal";
            readonly end: "";
        }, {
            readonly old: "/portal/quotations/:id/approve";
            readonly type: 0;
            readonly val: "quotations";
            readonly end: "";
        }, {
            readonly old: "/portal/quotations/:id/approve";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/portal/quotations/:id/approve";
            readonly type: 0;
            readonly val: "approve";
            readonly end: "";
        }];
        readonly types: Registry["portal.quotations.approve"]["types"];
    };
    readonly 'portal.recovery_reports.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/portal/recovery-reports/:id";
        readonly tokens: [{
            readonly old: "/portal/recovery-reports/:id";
            readonly type: 0;
            readonly val: "portal";
            readonly end: "";
        }, {
            readonly old: "/portal/recovery-reports/:id";
            readonly type: 0;
            readonly val: "recovery-reports";
            readonly end: "";
        }, {
            readonly old: "/portal/recovery-reports/:id";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }];
        readonly types: Registry["portal.recovery_reports.show"]["types"];
    };
    readonly 'portal.recovery_reports.confirm': {
        readonly methods: ["POST"];
        readonly pattern: "/portal/recovery-reports/:id/confirm";
        readonly tokens: [{
            readonly old: "/portal/recovery-reports/:id/confirm";
            readonly type: 0;
            readonly val: "portal";
            readonly end: "";
        }, {
            readonly old: "/portal/recovery-reports/:id/confirm";
            readonly type: 0;
            readonly val: "recovery-reports";
            readonly end: "";
        }, {
            readonly old: "/portal/recovery-reports/:id/confirm";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/portal/recovery-reports/:id/confirm";
            readonly type: 0;
            readonly val: "confirm";
            readonly end: "";
        }];
        readonly types: Registry["portal.recovery_reports.confirm"]["types"];
    };
    readonly 'portal.invoices': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/portal/invoices";
        readonly tokens: [{
            readonly old: "/portal/invoices";
            readonly type: 0;
            readonly val: "portal";
            readonly end: "";
        }, {
            readonly old: "/portal/invoices";
            readonly type: 0;
            readonly val: "invoices";
            readonly end: "";
        }];
        readonly types: Registry["portal.invoices"]["types"];
    };
    readonly 'portal.invoices.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/portal/invoices/:id";
        readonly tokens: [{
            readonly old: "/portal/invoices/:id";
            readonly type: 0;
            readonly val: "portal";
            readonly end: "";
        }, {
            readonly old: "/portal/invoices/:id";
            readonly type: 0;
            readonly val: "invoices";
            readonly end: "";
        }, {
            readonly old: "/portal/invoices/:id";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }];
        readonly types: Registry["portal.invoices.show"]["types"];
    };
    readonly 'portal.invoices.pay': {
        readonly methods: ["POST"];
        readonly pattern: "/portal/invoices/:id/pay";
        readonly tokens: [{
            readonly old: "/portal/invoices/:id/pay";
            readonly type: 0;
            readonly val: "portal";
            readonly end: "";
        }, {
            readonly old: "/portal/invoices/:id/pay";
            readonly type: 0;
            readonly val: "invoices";
            readonly end: "";
        }, {
            readonly old: "/portal/invoices/:id/pay";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/portal/invoices/:id/pay";
            readonly type: 0;
            readonly val: "pay";
            readonly end: "";
        }];
        readonly types: Registry["portal.invoices.pay"]["types"];
    };
    readonly 'portal.logout': {
        readonly methods: ["POST"];
        readonly pattern: "/portal/logout";
        readonly tokens: [{
            readonly old: "/portal/logout";
            readonly type: 0;
            readonly val: "portal";
            readonly end: "";
        }, {
            readonly old: "/portal/logout";
            readonly type: 0;
            readonly val: "logout";
            readonly end: "";
        }];
        readonly types: Registry["portal.logout"]["types"];
    };
    readonly 'session.create': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/login";
        readonly tokens: [{
            readonly old: "/login";
            readonly type: 0;
            readonly val: "login";
            readonly end: "";
        }];
        readonly types: Registry["session.create"]["types"];
    };
    readonly 'session.store': {
        readonly methods: ["POST"];
        readonly pattern: "/login";
        readonly tokens: [{
            readonly old: "/login";
            readonly type: 0;
            readonly val: "login";
            readonly end: "";
        }];
        readonly types: Registry["session.store"]["types"];
    };
    readonly dashboard: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/dashboard";
        readonly tokens: [{
            readonly old: "/dashboard";
            readonly type: 0;
            readonly val: "dashboard";
            readonly end: "";
        }];
        readonly types: Registry["dashboard"]["types"];
    };
    readonly bookings: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/bookings";
        readonly tokens: [{
            readonly old: "/bookings";
            readonly type: 0;
            readonly val: "bookings";
            readonly end: "";
        }];
        readonly types: Registry["bookings"]["types"];
    };
    readonly 'bookings.create': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/bookings/create";
        readonly tokens: [{
            readonly old: "/bookings/create";
            readonly type: 0;
            readonly val: "bookings";
            readonly end: "";
        }, {
            readonly old: "/bookings/create";
            readonly type: 0;
            readonly val: "create";
            readonly end: "";
        }];
        readonly types: Registry["bookings.create"]["types"];
    };
    readonly 'bookings.store': {
        readonly methods: ["POST"];
        readonly pattern: "/bookings";
        readonly tokens: [{
            readonly old: "/bookings";
            readonly type: 0;
            readonly val: "bookings";
            readonly end: "";
        }];
        readonly types: Registry["bookings.store"]["types"];
    };
    readonly 'bookings.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/bookings/:id";
        readonly tokens: [{
            readonly old: "/bookings/:id";
            readonly type: 0;
            readonly val: "bookings";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }];
        readonly types: Registry["bookings.show"]["types"];
    };
    readonly 'bookings.confirm': {
        readonly methods: ["POST"];
        readonly pattern: "/bookings/:id/confirm";
        readonly tokens: [{
            readonly old: "/bookings/:id/confirm";
            readonly type: 0;
            readonly val: "bookings";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/confirm";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/confirm";
            readonly type: 0;
            readonly val: "confirm";
            readonly end: "";
        }];
        readonly types: Registry["bookings.confirm"]["types"];
    };
    readonly 'bookings.quotations.store': {
        readonly methods: ["POST"];
        readonly pattern: "/bookings/:id/quotations";
        readonly tokens: [{
            readonly old: "/bookings/:id/quotations";
            readonly type: 0;
            readonly val: "bookings";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/quotations";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/quotations";
            readonly type: 0;
            readonly val: "quotations";
            readonly end: "";
        }];
        readonly types: Registry["bookings.quotations.store"]["types"];
    };
    readonly 'recovery_reports.create': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/bookings/:id/recovery-reports/create";
        readonly tokens: [{
            readonly old: "/bookings/:id/recovery-reports/create";
            readonly type: 0;
            readonly val: "bookings";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/recovery-reports/create";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/recovery-reports/create";
            readonly type: 0;
            readonly val: "recovery-reports";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/recovery-reports/create";
            readonly type: 0;
            readonly val: "create";
            readonly end: "";
        }];
        readonly types: Registry["recovery_reports.create"]["types"];
    };
    readonly 'recovery_reports.store': {
        readonly methods: ["POST"];
        readonly pattern: "/bookings/:id/recovery-reports";
        readonly tokens: [{
            readonly old: "/bookings/:id/recovery-reports";
            readonly type: 0;
            readonly val: "bookings";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/recovery-reports";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/recovery-reports";
            readonly type: 0;
            readonly val: "recovery-reports";
            readonly end: "";
        }];
        readonly types: Registry["recovery_reports.store"]["types"];
    };
    readonly 'recovery_reports.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/bookings/:id/recovery-reports/:reportId";
        readonly tokens: [{
            readonly old: "/bookings/:id/recovery-reports/:reportId";
            readonly type: 0;
            readonly val: "bookings";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/recovery-reports/:reportId";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/recovery-reports/:reportId";
            readonly type: 0;
            readonly val: "recovery-reports";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/recovery-reports/:reportId";
            readonly type: 1;
            readonly val: "reportId";
            readonly end: "";
        }];
        readonly types: Registry["recovery_reports.show"]["types"];
    };
    readonly 'recovery_reports.send': {
        readonly methods: ["POST"];
        readonly pattern: "/bookings/:id/recovery-reports/:reportId/send";
        readonly tokens: [{
            readonly old: "/bookings/:id/recovery-reports/:reportId/send";
            readonly type: 0;
            readonly val: "bookings";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/recovery-reports/:reportId/send";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/recovery-reports/:reportId/send";
            readonly type: 0;
            readonly val: "recovery-reports";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/recovery-reports/:reportId/send";
            readonly type: 1;
            readonly val: "reportId";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/recovery-reports/:reportId/send";
            readonly type: 0;
            readonly val: "send";
            readonly end: "";
        }];
        readonly types: Registry["recovery_reports.send"]["types"];
    };
    readonly 'bookings.create_invoice': {
        readonly methods: ["POST"];
        readonly pattern: "/bookings/:id/create-invoice";
        readonly tokens: [{
            readonly old: "/bookings/:id/create-invoice";
            readonly type: 0;
            readonly val: "bookings";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/create-invoice";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/bookings/:id/create-invoice";
            readonly type: 0;
            readonly val: "create-invoice";
            readonly end: "";
        }];
        readonly types: Registry["bookings.create_invoice"]["types"];
    };
    readonly packages: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/packages";
        readonly tokens: [{
            readonly old: "/packages";
            readonly type: 0;
            readonly val: "packages";
            readonly end: "";
        }];
        readonly types: Registry["packages"]["types"];
    };
    readonly destinations: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/destinations";
        readonly tokens: [{
            readonly old: "/destinations";
            readonly type: 0;
            readonly val: "destinations";
            readonly end: "";
        }];
        readonly types: Registry["destinations"]["types"];
    };
    readonly customers: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/customers";
        readonly tokens: [{
            readonly old: "/customers";
            readonly type: 0;
            readonly val: "customers";
            readonly end: "";
        }];
        readonly types: Registry["customers"]["types"];
    };
    readonly 'customers.create': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/customers/create";
        readonly tokens: [{
            readonly old: "/customers/create";
            readonly type: 0;
            readonly val: "customers";
            readonly end: "";
        }, {
            readonly old: "/customers/create";
            readonly type: 0;
            readonly val: "create";
            readonly end: "";
        }];
        readonly types: Registry["customers.create"]["types"];
    };
    readonly 'customers.store': {
        readonly methods: ["POST"];
        readonly pattern: "/customers";
        readonly tokens: [{
            readonly old: "/customers";
            readonly type: 0;
            readonly val: "customers";
            readonly end: "";
        }];
        readonly types: Registry["customers.store"]["types"];
    };
    readonly 'customers.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/customers/:id";
        readonly tokens: [{
            readonly old: "/customers/:id";
            readonly type: 0;
            readonly val: "customers";
            readonly end: "";
        }, {
            readonly old: "/customers/:id";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }];
        readonly types: Registry["customers.show"]["types"];
    };
    readonly offices: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/offices";
        readonly tokens: [{
            readonly old: "/offices";
            readonly type: 0;
            readonly val: "offices";
            readonly end: "";
        }];
        readonly types: Registry["offices"]["types"];
    };
    readonly agents: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/agents";
        readonly tokens: [{
            readonly old: "/agents";
            readonly type: 0;
            readonly val: "agents";
            readonly end: "";
        }];
        readonly types: Registry["agents"]["types"];
    };
    readonly documents: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/documents";
        readonly tokens: [{
            readonly old: "/documents";
            readonly type: 0;
            readonly val: "documents";
            readonly end: "";
        }];
        readonly types: Registry["documents"]["types"];
    };
    readonly 'documents.store': {
        readonly methods: ["POST"];
        readonly pattern: "/documents";
        readonly tokens: [{
            readonly old: "/documents";
            readonly type: 0;
            readonly val: "documents";
            readonly end: "";
        }];
        readonly types: Registry["documents.store"]["types"];
    };
    readonly 'documents.download': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/documents/:id/download";
        readonly tokens: [{
            readonly old: "/documents/:id/download";
            readonly type: 0;
            readonly val: "documents";
            readonly end: "";
        }, {
            readonly old: "/documents/:id/download";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/documents/:id/download";
            readonly type: 0;
            readonly val: "download";
            readonly end: "";
        }];
        readonly types: Registry["documents.download"]["types"];
    };
    readonly 'documents.destroy': {
        readonly methods: ["DELETE"];
        readonly pattern: "/documents/:id";
        readonly tokens: [{
            readonly old: "/documents/:id";
            readonly type: 0;
            readonly val: "documents";
            readonly end: "";
        }, {
            readonly old: "/documents/:id";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }];
        readonly types: Registry["documents.destroy"]["types"];
    };
    readonly suppliers: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/suppliers";
        readonly tokens: [{
            readonly old: "/suppliers";
            readonly type: 0;
            readonly val: "suppliers";
            readonly end: "";
        }];
        readonly types: Registry["suppliers"]["types"];
    };
    readonly 'suppliers.create': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/suppliers/create";
        readonly tokens: [{
            readonly old: "/suppliers/create";
            readonly type: 0;
            readonly val: "suppliers";
            readonly end: "";
        }, {
            readonly old: "/suppliers/create";
            readonly type: 0;
            readonly val: "create";
            readonly end: "";
        }];
        readonly types: Registry["suppliers.create"]["types"];
    };
    readonly 'suppliers.store': {
        readonly methods: ["POST"];
        readonly pattern: "/suppliers";
        readonly tokens: [{
            readonly old: "/suppliers";
            readonly type: 0;
            readonly val: "suppliers";
            readonly end: "";
        }];
        readonly types: Registry["suppliers.store"]["types"];
    };
    readonly 'suppliers.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/suppliers/:id";
        readonly tokens: [{
            readonly old: "/suppliers/:id";
            readonly type: 0;
            readonly val: "suppliers";
            readonly end: "";
        }, {
            readonly old: "/suppliers/:id";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }];
        readonly types: Registry["suppliers.show"]["types"];
    };
    readonly quotations: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/quotations";
        readonly tokens: [{
            readonly old: "/quotations";
            readonly type: 0;
            readonly val: "quotations";
            readonly end: "";
        }];
        readonly types: Registry["quotations"]["types"];
    };
    readonly 'quotations.create': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/quotations/create";
        readonly tokens: [{
            readonly old: "/quotations/create";
            readonly type: 0;
            readonly val: "quotations";
            readonly end: "";
        }, {
            readonly old: "/quotations/create";
            readonly type: 0;
            readonly val: "create";
            readonly end: "";
        }];
        readonly types: Registry["quotations.create"]["types"];
    };
    readonly 'quotations.store': {
        readonly methods: ["POST"];
        readonly pattern: "/quotations";
        readonly tokens: [{
            readonly old: "/quotations";
            readonly type: 0;
            readonly val: "quotations";
            readonly end: "";
        }];
        readonly types: Registry["quotations.store"]["types"];
    };
    readonly 'quotations.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/quotations/:id";
        readonly tokens: [{
            readonly old: "/quotations/:id";
            readonly type: 0;
            readonly val: "quotations";
            readonly end: "";
        }, {
            readonly old: "/quotations/:id";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }];
        readonly types: Registry["quotations.show"]["types"];
    };
    readonly 'quotations.send': {
        readonly methods: ["POST"];
        readonly pattern: "/quotations/:id/send";
        readonly tokens: [{
            readonly old: "/quotations/:id/send";
            readonly type: 0;
            readonly val: "quotations";
            readonly end: "";
        }, {
            readonly old: "/quotations/:id/send";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/quotations/:id/send";
            readonly type: 0;
            readonly val: "send";
            readonly end: "";
        }];
        readonly types: Registry["quotations.send"]["types"];
    };
    readonly invoices: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/invoices";
        readonly tokens: [{
            readonly old: "/invoices";
            readonly type: 0;
            readonly val: "invoices";
            readonly end: "";
        }];
        readonly types: Registry["invoices"]["types"];
    };
    readonly 'invoices.create': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/invoices/create";
        readonly tokens: [{
            readonly old: "/invoices/create";
            readonly type: 0;
            readonly val: "invoices";
            readonly end: "";
        }, {
            readonly old: "/invoices/create";
            readonly type: 0;
            readonly val: "create";
            readonly end: "";
        }];
        readonly types: Registry["invoices.create"]["types"];
    };
    readonly 'invoices.store': {
        readonly methods: ["POST"];
        readonly pattern: "/invoices";
        readonly tokens: [{
            readonly old: "/invoices";
            readonly type: 0;
            readonly val: "invoices";
            readonly end: "";
        }];
        readonly types: Registry["invoices.store"]["types"];
    };
    readonly 'invoices.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/invoices/:id";
        readonly tokens: [{
            readonly old: "/invoices/:id";
            readonly type: 0;
            readonly val: "invoices";
            readonly end: "";
        }, {
            readonly old: "/invoices/:id";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }];
        readonly types: Registry["invoices.show"]["types"];
    };
    readonly 'invoices.issue': {
        readonly methods: ["POST"];
        readonly pattern: "/invoices/:id/issue";
        readonly tokens: [{
            readonly old: "/invoices/:id/issue";
            readonly type: 0;
            readonly val: "invoices";
            readonly end: "";
        }, {
            readonly old: "/invoices/:id/issue";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/invoices/:id/issue";
            readonly type: 0;
            readonly val: "issue";
            readonly end: "";
        }];
        readonly types: Registry["invoices.issue"]["types"];
    };
    readonly receipts: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/receipts";
        readonly tokens: [{
            readonly old: "/receipts";
            readonly type: 0;
            readonly val: "receipts";
            readonly end: "";
        }];
        readonly types: Registry["receipts"]["types"];
    };
    readonly 'receipts.create': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/receipts/create";
        readonly tokens: [{
            readonly old: "/receipts/create";
            readonly type: 0;
            readonly val: "receipts";
            readonly end: "";
        }, {
            readonly old: "/receipts/create";
            readonly type: 0;
            readonly val: "create";
            readonly end: "";
        }];
        readonly types: Registry["receipts.create"]["types"];
    };
    readonly 'receipts.store': {
        readonly methods: ["POST"];
        readonly pattern: "/receipts";
        readonly tokens: [{
            readonly old: "/receipts";
            readonly type: 0;
            readonly val: "receipts";
            readonly end: "";
        }];
        readonly types: Registry["receipts.store"]["types"];
    };
    readonly payments: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/payments";
        readonly tokens: [{
            readonly old: "/payments";
            readonly type: 0;
            readonly val: "payments";
            readonly end: "";
        }];
        readonly types: Registry["payments"]["types"];
    };
    readonly 'payments.create': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/payments/create";
        readonly tokens: [{
            readonly old: "/payments/create";
            readonly type: 0;
            readonly val: "payments";
            readonly end: "";
        }, {
            readonly old: "/payments/create";
            readonly type: 0;
            readonly val: "create";
            readonly end: "";
        }];
        readonly types: Registry["payments.create"]["types"];
    };
    readonly 'payments.store': {
        readonly methods: ["POST"];
        readonly pattern: "/payments";
        readonly tokens: [{
            readonly old: "/payments";
            readonly type: 0;
            readonly val: "payments";
            readonly end: "";
        }];
        readonly types: Registry["payments.store"]["types"];
    };
    readonly recovery: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/recovery";
        readonly tokens: [{
            readonly old: "/recovery";
            readonly type: 0;
            readonly val: "recovery";
            readonly end: "";
        }];
        readonly types: Registry["recovery"]["types"];
    };
    readonly 'recovery.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/recovery/:id";
        readonly tokens: [{
            readonly old: "/recovery/:id";
            readonly type: 0;
            readonly val: "recovery";
            readonly end: "";
        }, {
            readonly old: "/recovery/:id";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }];
        readonly types: Registry["recovery.show"]["types"];
    };
    readonly 'recovery.update': {
        readonly methods: ["PATCH"];
        readonly pattern: "/recovery/:id";
        readonly tokens: [{
            readonly old: "/recovery/:id";
            readonly type: 0;
            readonly val: "recovery";
            readonly end: "";
        }, {
            readonly old: "/recovery/:id";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }];
        readonly types: Registry["recovery.update"]["types"];
    };
    readonly 'recovery.assign': {
        readonly methods: ["POST"];
        readonly pattern: "/recovery/:id/assign";
        readonly tokens: [{
            readonly old: "/recovery/:id/assign";
            readonly type: 0;
            readonly val: "recovery";
            readonly end: "";
        }, {
            readonly old: "/recovery/:id/assign";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/recovery/:id/assign";
            readonly type: 0;
            readonly val: "assign";
            readonly end: "";
        }];
        readonly types: Registry["recovery.assign"]["types"];
    };
    readonly reports: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/reports";
        readonly tokens: [{
            readonly old: "/reports";
            readonly type: 0;
            readonly val: "reports";
            readonly end: "";
        }];
        readonly types: Registry["reports"]["types"];
    };
    readonly 'reports.templates': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/reports/templates";
        readonly tokens: [{
            readonly old: "/reports/templates";
            readonly type: 0;
            readonly val: "reports";
            readonly end: "";
        }, {
            readonly old: "/reports/templates";
            readonly type: 0;
            readonly val: "templates";
            readonly end: "";
        }];
        readonly types: Registry["reports.templates"]["types"];
    };
    readonly 'reports.templates.store': {
        readonly methods: ["POST"];
        readonly pattern: "/reports/templates";
        readonly tokens: [{
            readonly old: "/reports/templates";
            readonly type: 0;
            readonly val: "reports";
            readonly end: "";
        }, {
            readonly old: "/reports/templates";
            readonly type: 0;
            readonly val: "templates";
            readonly end: "";
        }];
        readonly types: Registry["reports.templates.store"]["types"];
    };
    readonly 'reports.run': {
        readonly methods: ["POST"];
        readonly pattern: "/reports/run";
        readonly tokens: [{
            readonly old: "/reports/run";
            readonly type: 0;
            readonly val: "reports";
            readonly end: "";
        }, {
            readonly old: "/reports/run";
            readonly type: 0;
            readonly val: "run";
            readonly end: "";
        }];
        readonly types: Registry["reports.run"]["types"];
    };
    readonly 'reports.download': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/reports/runs/:id/download";
        readonly tokens: [{
            readonly old: "/reports/runs/:id/download";
            readonly type: 0;
            readonly val: "reports";
            readonly end: "";
        }, {
            readonly old: "/reports/runs/:id/download";
            readonly type: 0;
            readonly val: "runs";
            readonly end: "";
        }, {
            readonly old: "/reports/runs/:id/download";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/reports/runs/:id/download";
            readonly type: 0;
            readonly val: "download";
            readonly end: "";
        }];
        readonly types: Registry["reports.download"]["types"];
    };
    readonly users: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/users";
        readonly tokens: [{
            readonly old: "/users";
            readonly type: 0;
            readonly val: "users";
            readonly end: "";
        }];
        readonly types: Registry["users"]["types"];
    };
    readonly 'users.create': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/users/create";
        readonly tokens: [{
            readonly old: "/users/create";
            readonly type: 0;
            readonly val: "users";
            readonly end: "";
        }, {
            readonly old: "/users/create";
            readonly type: 0;
            readonly val: "create";
            readonly end: "";
        }];
        readonly types: Registry["users.create"]["types"];
    };
    readonly 'users.store': {
        readonly methods: ["POST"];
        readonly pattern: "/users";
        readonly tokens: [{
            readonly old: "/users";
            readonly type: 0;
            readonly val: "users";
            readonly end: "";
        }];
        readonly types: Registry["users.store"]["types"];
    };
    readonly roles: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/roles";
        readonly tokens: [{
            readonly old: "/roles";
            readonly type: 0;
            readonly val: "roles";
            readonly end: "";
        }];
        readonly types: Registry["roles"]["types"];
    };
    readonly 'roles.update': {
        readonly methods: ["PATCH"];
        readonly pattern: "/roles";
        readonly tokens: [{
            readonly old: "/roles";
            readonly type: 0;
            readonly val: "roles";
            readonly end: "";
        }];
        readonly types: Registry["roles.update"]["types"];
    };
    readonly settings: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/settings";
        readonly tokens: [{
            readonly old: "/settings";
            readonly type: 0;
            readonly val: "settings";
            readonly end: "";
        }];
        readonly types: Registry["settings"]["types"];
    };
    readonly profile: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/profile";
        readonly tokens: [{
            readonly old: "/profile";
            readonly type: 0;
            readonly val: "profile";
            readonly end: "";
        }];
        readonly types: Registry["profile"]["types"];
    };
    readonly user_settings: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/user-settings";
        readonly tokens: [{
            readonly old: "/user-settings";
            readonly type: 0;
            readonly val: "user-settings";
            readonly end: "";
        }];
        readonly types: Registry["user_settings"]["types"];
    };
    readonly 'user_settings.password': {
        readonly methods: ["PATCH"];
        readonly pattern: "/user-settings/password";
        readonly tokens: [{
            readonly old: "/user-settings/password";
            readonly type: 0;
            readonly val: "user-settings";
            readonly end: "";
        }, {
            readonly old: "/user-settings/password";
            readonly type: 0;
            readonly val: "password";
            readonly end: "";
        }];
        readonly types: Registry["user_settings.password"]["types"];
    };
    readonly 'session.destroy': {
        readonly methods: ["POST"];
        readonly pattern: "/logout";
        readonly tokens: [{
            readonly old: "/logout";
            readonly type: 0;
            readonly val: "logout";
            readonly end: "";
        }];
        readonly types: Registry["session.destroy"]["types"];
    };
};
export { routes };
export declare const registry: {
    routes: {
        readonly home: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/";
            readonly tokens: [{
                readonly old: "/";
                readonly type: 0;
                readonly val: "/";
                readonly end: "";
            }];
            readonly types: Registry["home"]["types"];
        };
        readonly 'portal.login': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/portal/login";
            readonly tokens: [{
                readonly old: "/portal/login";
                readonly type: 0;
                readonly val: "portal";
                readonly end: "";
            }, {
                readonly old: "/portal/login";
                readonly type: 0;
                readonly val: "login";
                readonly end: "";
            }];
            readonly types: Registry["portal.login"]["types"];
        };
        readonly 'portal.login.store': {
            readonly methods: ["POST"];
            readonly pattern: "/portal/login";
            readonly tokens: [{
                readonly old: "/portal/login";
                readonly type: 0;
                readonly val: "portal";
                readonly end: "";
            }, {
                readonly old: "/portal/login";
                readonly type: 0;
                readonly val: "login";
                readonly end: "";
            }];
            readonly types: Registry["portal.login.store"]["types"];
        };
        readonly 'portal.dashboard': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/portal/dashboard";
            readonly tokens: [{
                readonly old: "/portal/dashboard";
                readonly type: 0;
                readonly val: "portal";
                readonly end: "";
            }, {
                readonly old: "/portal/dashboard";
                readonly type: 0;
                readonly val: "dashboard";
                readonly end: "";
            }];
            readonly types: Registry["portal.dashboard"]["types"];
        };
        readonly 'portal.bookings.create': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/portal/bookings/create";
            readonly tokens: [{
                readonly old: "/portal/bookings/create";
                readonly type: 0;
                readonly val: "portal";
                readonly end: "";
            }, {
                readonly old: "/portal/bookings/create";
                readonly type: 0;
                readonly val: "bookings";
                readonly end: "";
            }, {
                readonly old: "/portal/bookings/create";
                readonly type: 0;
                readonly val: "create";
                readonly end: "";
            }];
            readonly types: Registry["portal.bookings.create"]["types"];
        };
        readonly 'portal.bookings.store': {
            readonly methods: ["POST"];
            readonly pattern: "/portal/bookings";
            readonly tokens: [{
                readonly old: "/portal/bookings";
                readonly type: 0;
                readonly val: "portal";
                readonly end: "";
            }, {
                readonly old: "/portal/bookings";
                readonly type: 0;
                readonly val: "bookings";
                readonly end: "";
            }];
            readonly types: Registry["portal.bookings.store"]["types"];
        };
        readonly 'portal.bookings.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/portal/bookings/:id";
            readonly tokens: [{
                readonly old: "/portal/bookings/:id";
                readonly type: 0;
                readonly val: "portal";
                readonly end: "";
            }, {
                readonly old: "/portal/bookings/:id";
                readonly type: 0;
                readonly val: "bookings";
                readonly end: "";
            }, {
                readonly old: "/portal/bookings/:id";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }];
            readonly types: Registry["portal.bookings.show"]["types"];
        };
        readonly 'portal.quotations.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/portal/quotations/:id";
            readonly tokens: [{
                readonly old: "/portal/quotations/:id";
                readonly type: 0;
                readonly val: "portal";
                readonly end: "";
            }, {
                readonly old: "/portal/quotations/:id";
                readonly type: 0;
                readonly val: "quotations";
                readonly end: "";
            }, {
                readonly old: "/portal/quotations/:id";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }];
            readonly types: Registry["portal.quotations.show"]["types"];
        };
        readonly 'portal.quotations.approve': {
            readonly methods: ["POST"];
            readonly pattern: "/portal/quotations/:id/approve";
            readonly tokens: [{
                readonly old: "/portal/quotations/:id/approve";
                readonly type: 0;
                readonly val: "portal";
                readonly end: "";
            }, {
                readonly old: "/portal/quotations/:id/approve";
                readonly type: 0;
                readonly val: "quotations";
                readonly end: "";
            }, {
                readonly old: "/portal/quotations/:id/approve";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/portal/quotations/:id/approve";
                readonly type: 0;
                readonly val: "approve";
                readonly end: "";
            }];
            readonly types: Registry["portal.quotations.approve"]["types"];
        };
        readonly 'portal.recovery_reports.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/portal/recovery-reports/:id";
            readonly tokens: [{
                readonly old: "/portal/recovery-reports/:id";
                readonly type: 0;
                readonly val: "portal";
                readonly end: "";
            }, {
                readonly old: "/portal/recovery-reports/:id";
                readonly type: 0;
                readonly val: "recovery-reports";
                readonly end: "";
            }, {
                readonly old: "/portal/recovery-reports/:id";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }];
            readonly types: Registry["portal.recovery_reports.show"]["types"];
        };
        readonly 'portal.recovery_reports.confirm': {
            readonly methods: ["POST"];
            readonly pattern: "/portal/recovery-reports/:id/confirm";
            readonly tokens: [{
                readonly old: "/portal/recovery-reports/:id/confirm";
                readonly type: 0;
                readonly val: "portal";
                readonly end: "";
            }, {
                readonly old: "/portal/recovery-reports/:id/confirm";
                readonly type: 0;
                readonly val: "recovery-reports";
                readonly end: "";
            }, {
                readonly old: "/portal/recovery-reports/:id/confirm";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/portal/recovery-reports/:id/confirm";
                readonly type: 0;
                readonly val: "confirm";
                readonly end: "";
            }];
            readonly types: Registry["portal.recovery_reports.confirm"]["types"];
        };
        readonly 'portal.invoices': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/portal/invoices";
            readonly tokens: [{
                readonly old: "/portal/invoices";
                readonly type: 0;
                readonly val: "portal";
                readonly end: "";
            }, {
                readonly old: "/portal/invoices";
                readonly type: 0;
                readonly val: "invoices";
                readonly end: "";
            }];
            readonly types: Registry["portal.invoices"]["types"];
        };
        readonly 'portal.invoices.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/portal/invoices/:id";
            readonly tokens: [{
                readonly old: "/portal/invoices/:id";
                readonly type: 0;
                readonly val: "portal";
                readonly end: "";
            }, {
                readonly old: "/portal/invoices/:id";
                readonly type: 0;
                readonly val: "invoices";
                readonly end: "";
            }, {
                readonly old: "/portal/invoices/:id";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }];
            readonly types: Registry["portal.invoices.show"]["types"];
        };
        readonly 'portal.invoices.pay': {
            readonly methods: ["POST"];
            readonly pattern: "/portal/invoices/:id/pay";
            readonly tokens: [{
                readonly old: "/portal/invoices/:id/pay";
                readonly type: 0;
                readonly val: "portal";
                readonly end: "";
            }, {
                readonly old: "/portal/invoices/:id/pay";
                readonly type: 0;
                readonly val: "invoices";
                readonly end: "";
            }, {
                readonly old: "/portal/invoices/:id/pay";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/portal/invoices/:id/pay";
                readonly type: 0;
                readonly val: "pay";
                readonly end: "";
            }];
            readonly types: Registry["portal.invoices.pay"]["types"];
        };
        readonly 'portal.logout': {
            readonly methods: ["POST"];
            readonly pattern: "/portal/logout";
            readonly tokens: [{
                readonly old: "/portal/logout";
                readonly type: 0;
                readonly val: "portal";
                readonly end: "";
            }, {
                readonly old: "/portal/logout";
                readonly type: 0;
                readonly val: "logout";
                readonly end: "";
            }];
            readonly types: Registry["portal.logout"]["types"];
        };
        readonly 'session.create': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/login";
            readonly tokens: [{
                readonly old: "/login";
                readonly type: 0;
                readonly val: "login";
                readonly end: "";
            }];
            readonly types: Registry["session.create"]["types"];
        };
        readonly 'session.store': {
            readonly methods: ["POST"];
            readonly pattern: "/login";
            readonly tokens: [{
                readonly old: "/login";
                readonly type: 0;
                readonly val: "login";
                readonly end: "";
            }];
            readonly types: Registry["session.store"]["types"];
        };
        readonly dashboard: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/dashboard";
            readonly tokens: [{
                readonly old: "/dashboard";
                readonly type: 0;
                readonly val: "dashboard";
                readonly end: "";
            }];
            readonly types: Registry["dashboard"]["types"];
        };
        readonly bookings: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/bookings";
            readonly tokens: [{
                readonly old: "/bookings";
                readonly type: 0;
                readonly val: "bookings";
                readonly end: "";
            }];
            readonly types: Registry["bookings"]["types"];
        };
        readonly 'bookings.create': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/bookings/create";
            readonly tokens: [{
                readonly old: "/bookings/create";
                readonly type: 0;
                readonly val: "bookings";
                readonly end: "";
            }, {
                readonly old: "/bookings/create";
                readonly type: 0;
                readonly val: "create";
                readonly end: "";
            }];
            readonly types: Registry["bookings.create"]["types"];
        };
        readonly 'bookings.store': {
            readonly methods: ["POST"];
            readonly pattern: "/bookings";
            readonly tokens: [{
                readonly old: "/bookings";
                readonly type: 0;
                readonly val: "bookings";
                readonly end: "";
            }];
            readonly types: Registry["bookings.store"]["types"];
        };
        readonly 'bookings.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/bookings/:id";
            readonly tokens: [{
                readonly old: "/bookings/:id";
                readonly type: 0;
                readonly val: "bookings";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }];
            readonly types: Registry["bookings.show"]["types"];
        };
        readonly 'bookings.confirm': {
            readonly methods: ["POST"];
            readonly pattern: "/bookings/:id/confirm";
            readonly tokens: [{
                readonly old: "/bookings/:id/confirm";
                readonly type: 0;
                readonly val: "bookings";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/confirm";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/confirm";
                readonly type: 0;
                readonly val: "confirm";
                readonly end: "";
            }];
            readonly types: Registry["bookings.confirm"]["types"];
        };
        readonly 'bookings.quotations.store': {
            readonly methods: ["POST"];
            readonly pattern: "/bookings/:id/quotations";
            readonly tokens: [{
                readonly old: "/bookings/:id/quotations";
                readonly type: 0;
                readonly val: "bookings";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/quotations";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/quotations";
                readonly type: 0;
                readonly val: "quotations";
                readonly end: "";
            }];
            readonly types: Registry["bookings.quotations.store"]["types"];
        };
        readonly 'recovery_reports.create': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/bookings/:id/recovery-reports/create";
            readonly tokens: [{
                readonly old: "/bookings/:id/recovery-reports/create";
                readonly type: 0;
                readonly val: "bookings";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/recovery-reports/create";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/recovery-reports/create";
                readonly type: 0;
                readonly val: "recovery-reports";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/recovery-reports/create";
                readonly type: 0;
                readonly val: "create";
                readonly end: "";
            }];
            readonly types: Registry["recovery_reports.create"]["types"];
        };
        readonly 'recovery_reports.store': {
            readonly methods: ["POST"];
            readonly pattern: "/bookings/:id/recovery-reports";
            readonly tokens: [{
                readonly old: "/bookings/:id/recovery-reports";
                readonly type: 0;
                readonly val: "bookings";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/recovery-reports";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/recovery-reports";
                readonly type: 0;
                readonly val: "recovery-reports";
                readonly end: "";
            }];
            readonly types: Registry["recovery_reports.store"]["types"];
        };
        readonly 'recovery_reports.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/bookings/:id/recovery-reports/:reportId";
            readonly tokens: [{
                readonly old: "/bookings/:id/recovery-reports/:reportId";
                readonly type: 0;
                readonly val: "bookings";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/recovery-reports/:reportId";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/recovery-reports/:reportId";
                readonly type: 0;
                readonly val: "recovery-reports";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/recovery-reports/:reportId";
                readonly type: 1;
                readonly val: "reportId";
                readonly end: "";
            }];
            readonly types: Registry["recovery_reports.show"]["types"];
        };
        readonly 'recovery_reports.send': {
            readonly methods: ["POST"];
            readonly pattern: "/bookings/:id/recovery-reports/:reportId/send";
            readonly tokens: [{
                readonly old: "/bookings/:id/recovery-reports/:reportId/send";
                readonly type: 0;
                readonly val: "bookings";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/recovery-reports/:reportId/send";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/recovery-reports/:reportId/send";
                readonly type: 0;
                readonly val: "recovery-reports";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/recovery-reports/:reportId/send";
                readonly type: 1;
                readonly val: "reportId";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/recovery-reports/:reportId/send";
                readonly type: 0;
                readonly val: "send";
                readonly end: "";
            }];
            readonly types: Registry["recovery_reports.send"]["types"];
        };
        readonly 'bookings.create_invoice': {
            readonly methods: ["POST"];
            readonly pattern: "/bookings/:id/create-invoice";
            readonly tokens: [{
                readonly old: "/bookings/:id/create-invoice";
                readonly type: 0;
                readonly val: "bookings";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/create-invoice";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/bookings/:id/create-invoice";
                readonly type: 0;
                readonly val: "create-invoice";
                readonly end: "";
            }];
            readonly types: Registry["bookings.create_invoice"]["types"];
        };
        readonly packages: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/packages";
            readonly tokens: [{
                readonly old: "/packages";
                readonly type: 0;
                readonly val: "packages";
                readonly end: "";
            }];
            readonly types: Registry["packages"]["types"];
        };
        readonly destinations: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/destinations";
            readonly tokens: [{
                readonly old: "/destinations";
                readonly type: 0;
                readonly val: "destinations";
                readonly end: "";
            }];
            readonly types: Registry["destinations"]["types"];
        };
        readonly customers: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/customers";
            readonly tokens: [{
                readonly old: "/customers";
                readonly type: 0;
                readonly val: "customers";
                readonly end: "";
            }];
            readonly types: Registry["customers"]["types"];
        };
        readonly 'customers.create': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/customers/create";
            readonly tokens: [{
                readonly old: "/customers/create";
                readonly type: 0;
                readonly val: "customers";
                readonly end: "";
            }, {
                readonly old: "/customers/create";
                readonly type: 0;
                readonly val: "create";
                readonly end: "";
            }];
            readonly types: Registry["customers.create"]["types"];
        };
        readonly 'customers.store': {
            readonly methods: ["POST"];
            readonly pattern: "/customers";
            readonly tokens: [{
                readonly old: "/customers";
                readonly type: 0;
                readonly val: "customers";
                readonly end: "";
            }];
            readonly types: Registry["customers.store"]["types"];
        };
        readonly 'customers.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/customers/:id";
            readonly tokens: [{
                readonly old: "/customers/:id";
                readonly type: 0;
                readonly val: "customers";
                readonly end: "";
            }, {
                readonly old: "/customers/:id";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }];
            readonly types: Registry["customers.show"]["types"];
        };
        readonly offices: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/offices";
            readonly tokens: [{
                readonly old: "/offices";
                readonly type: 0;
                readonly val: "offices";
                readonly end: "";
            }];
            readonly types: Registry["offices"]["types"];
        };
        readonly agents: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/agents";
            readonly tokens: [{
                readonly old: "/agents";
                readonly type: 0;
                readonly val: "agents";
                readonly end: "";
            }];
            readonly types: Registry["agents"]["types"];
        };
        readonly documents: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/documents";
            readonly tokens: [{
                readonly old: "/documents";
                readonly type: 0;
                readonly val: "documents";
                readonly end: "";
            }];
            readonly types: Registry["documents"]["types"];
        };
        readonly 'documents.store': {
            readonly methods: ["POST"];
            readonly pattern: "/documents";
            readonly tokens: [{
                readonly old: "/documents";
                readonly type: 0;
                readonly val: "documents";
                readonly end: "";
            }];
            readonly types: Registry["documents.store"]["types"];
        };
        readonly 'documents.download': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/documents/:id/download";
            readonly tokens: [{
                readonly old: "/documents/:id/download";
                readonly type: 0;
                readonly val: "documents";
                readonly end: "";
            }, {
                readonly old: "/documents/:id/download";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/documents/:id/download";
                readonly type: 0;
                readonly val: "download";
                readonly end: "";
            }];
            readonly types: Registry["documents.download"]["types"];
        };
        readonly 'documents.destroy': {
            readonly methods: ["DELETE"];
            readonly pattern: "/documents/:id";
            readonly tokens: [{
                readonly old: "/documents/:id";
                readonly type: 0;
                readonly val: "documents";
                readonly end: "";
            }, {
                readonly old: "/documents/:id";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }];
            readonly types: Registry["documents.destroy"]["types"];
        };
        readonly suppliers: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/suppliers";
            readonly tokens: [{
                readonly old: "/suppliers";
                readonly type: 0;
                readonly val: "suppliers";
                readonly end: "";
            }];
            readonly types: Registry["suppliers"]["types"];
        };
        readonly 'suppliers.create': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/suppliers/create";
            readonly tokens: [{
                readonly old: "/suppliers/create";
                readonly type: 0;
                readonly val: "suppliers";
                readonly end: "";
            }, {
                readonly old: "/suppliers/create";
                readonly type: 0;
                readonly val: "create";
                readonly end: "";
            }];
            readonly types: Registry["suppliers.create"]["types"];
        };
        readonly 'suppliers.store': {
            readonly methods: ["POST"];
            readonly pattern: "/suppliers";
            readonly tokens: [{
                readonly old: "/suppliers";
                readonly type: 0;
                readonly val: "suppliers";
                readonly end: "";
            }];
            readonly types: Registry["suppliers.store"]["types"];
        };
        readonly 'suppliers.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/suppliers/:id";
            readonly tokens: [{
                readonly old: "/suppliers/:id";
                readonly type: 0;
                readonly val: "suppliers";
                readonly end: "";
            }, {
                readonly old: "/suppliers/:id";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }];
            readonly types: Registry["suppliers.show"]["types"];
        };
        readonly quotations: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/quotations";
            readonly tokens: [{
                readonly old: "/quotations";
                readonly type: 0;
                readonly val: "quotations";
                readonly end: "";
            }];
            readonly types: Registry["quotations"]["types"];
        };
        readonly 'quotations.create': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/quotations/create";
            readonly tokens: [{
                readonly old: "/quotations/create";
                readonly type: 0;
                readonly val: "quotations";
                readonly end: "";
            }, {
                readonly old: "/quotations/create";
                readonly type: 0;
                readonly val: "create";
                readonly end: "";
            }];
            readonly types: Registry["quotations.create"]["types"];
        };
        readonly 'quotations.store': {
            readonly methods: ["POST"];
            readonly pattern: "/quotations";
            readonly tokens: [{
                readonly old: "/quotations";
                readonly type: 0;
                readonly val: "quotations";
                readonly end: "";
            }];
            readonly types: Registry["quotations.store"]["types"];
        };
        readonly 'quotations.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/quotations/:id";
            readonly tokens: [{
                readonly old: "/quotations/:id";
                readonly type: 0;
                readonly val: "quotations";
                readonly end: "";
            }, {
                readonly old: "/quotations/:id";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }];
            readonly types: Registry["quotations.show"]["types"];
        };
        readonly 'quotations.send': {
            readonly methods: ["POST"];
            readonly pattern: "/quotations/:id/send";
            readonly tokens: [{
                readonly old: "/quotations/:id/send";
                readonly type: 0;
                readonly val: "quotations";
                readonly end: "";
            }, {
                readonly old: "/quotations/:id/send";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/quotations/:id/send";
                readonly type: 0;
                readonly val: "send";
                readonly end: "";
            }];
            readonly types: Registry["quotations.send"]["types"];
        };
        readonly invoices: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/invoices";
            readonly tokens: [{
                readonly old: "/invoices";
                readonly type: 0;
                readonly val: "invoices";
                readonly end: "";
            }];
            readonly types: Registry["invoices"]["types"];
        };
        readonly 'invoices.create': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/invoices/create";
            readonly tokens: [{
                readonly old: "/invoices/create";
                readonly type: 0;
                readonly val: "invoices";
                readonly end: "";
            }, {
                readonly old: "/invoices/create";
                readonly type: 0;
                readonly val: "create";
                readonly end: "";
            }];
            readonly types: Registry["invoices.create"]["types"];
        };
        readonly 'invoices.store': {
            readonly methods: ["POST"];
            readonly pattern: "/invoices";
            readonly tokens: [{
                readonly old: "/invoices";
                readonly type: 0;
                readonly val: "invoices";
                readonly end: "";
            }];
            readonly types: Registry["invoices.store"]["types"];
        };
        readonly 'invoices.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/invoices/:id";
            readonly tokens: [{
                readonly old: "/invoices/:id";
                readonly type: 0;
                readonly val: "invoices";
                readonly end: "";
            }, {
                readonly old: "/invoices/:id";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }];
            readonly types: Registry["invoices.show"]["types"];
        };
        readonly 'invoices.issue': {
            readonly methods: ["POST"];
            readonly pattern: "/invoices/:id/issue";
            readonly tokens: [{
                readonly old: "/invoices/:id/issue";
                readonly type: 0;
                readonly val: "invoices";
                readonly end: "";
            }, {
                readonly old: "/invoices/:id/issue";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/invoices/:id/issue";
                readonly type: 0;
                readonly val: "issue";
                readonly end: "";
            }];
            readonly types: Registry["invoices.issue"]["types"];
        };
        readonly receipts: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/receipts";
            readonly tokens: [{
                readonly old: "/receipts";
                readonly type: 0;
                readonly val: "receipts";
                readonly end: "";
            }];
            readonly types: Registry["receipts"]["types"];
        };
        readonly 'receipts.create': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/receipts/create";
            readonly tokens: [{
                readonly old: "/receipts/create";
                readonly type: 0;
                readonly val: "receipts";
                readonly end: "";
            }, {
                readonly old: "/receipts/create";
                readonly type: 0;
                readonly val: "create";
                readonly end: "";
            }];
            readonly types: Registry["receipts.create"]["types"];
        };
        readonly 'receipts.store': {
            readonly methods: ["POST"];
            readonly pattern: "/receipts";
            readonly tokens: [{
                readonly old: "/receipts";
                readonly type: 0;
                readonly val: "receipts";
                readonly end: "";
            }];
            readonly types: Registry["receipts.store"]["types"];
        };
        readonly payments: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/payments";
            readonly tokens: [{
                readonly old: "/payments";
                readonly type: 0;
                readonly val: "payments";
                readonly end: "";
            }];
            readonly types: Registry["payments"]["types"];
        };
        readonly 'payments.create': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/payments/create";
            readonly tokens: [{
                readonly old: "/payments/create";
                readonly type: 0;
                readonly val: "payments";
                readonly end: "";
            }, {
                readonly old: "/payments/create";
                readonly type: 0;
                readonly val: "create";
                readonly end: "";
            }];
            readonly types: Registry["payments.create"]["types"];
        };
        readonly 'payments.store': {
            readonly methods: ["POST"];
            readonly pattern: "/payments";
            readonly tokens: [{
                readonly old: "/payments";
                readonly type: 0;
                readonly val: "payments";
                readonly end: "";
            }];
            readonly types: Registry["payments.store"]["types"];
        };
        readonly recovery: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/recovery";
            readonly tokens: [{
                readonly old: "/recovery";
                readonly type: 0;
                readonly val: "recovery";
                readonly end: "";
            }];
            readonly types: Registry["recovery"]["types"];
        };
        readonly 'recovery.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/recovery/:id";
            readonly tokens: [{
                readonly old: "/recovery/:id";
                readonly type: 0;
                readonly val: "recovery";
                readonly end: "";
            }, {
                readonly old: "/recovery/:id";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }];
            readonly types: Registry["recovery.show"]["types"];
        };
        readonly 'recovery.update': {
            readonly methods: ["PATCH"];
            readonly pattern: "/recovery/:id";
            readonly tokens: [{
                readonly old: "/recovery/:id";
                readonly type: 0;
                readonly val: "recovery";
                readonly end: "";
            }, {
                readonly old: "/recovery/:id";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }];
            readonly types: Registry["recovery.update"]["types"];
        };
        readonly 'recovery.assign': {
            readonly methods: ["POST"];
            readonly pattern: "/recovery/:id/assign";
            readonly tokens: [{
                readonly old: "/recovery/:id/assign";
                readonly type: 0;
                readonly val: "recovery";
                readonly end: "";
            }, {
                readonly old: "/recovery/:id/assign";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/recovery/:id/assign";
                readonly type: 0;
                readonly val: "assign";
                readonly end: "";
            }];
            readonly types: Registry["recovery.assign"]["types"];
        };
        readonly reports: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/reports";
            readonly tokens: [{
                readonly old: "/reports";
                readonly type: 0;
                readonly val: "reports";
                readonly end: "";
            }];
            readonly types: Registry["reports"]["types"];
        };
        readonly 'reports.templates': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/reports/templates";
            readonly tokens: [{
                readonly old: "/reports/templates";
                readonly type: 0;
                readonly val: "reports";
                readonly end: "";
            }, {
                readonly old: "/reports/templates";
                readonly type: 0;
                readonly val: "templates";
                readonly end: "";
            }];
            readonly types: Registry["reports.templates"]["types"];
        };
        readonly 'reports.templates.store': {
            readonly methods: ["POST"];
            readonly pattern: "/reports/templates";
            readonly tokens: [{
                readonly old: "/reports/templates";
                readonly type: 0;
                readonly val: "reports";
                readonly end: "";
            }, {
                readonly old: "/reports/templates";
                readonly type: 0;
                readonly val: "templates";
                readonly end: "";
            }];
            readonly types: Registry["reports.templates.store"]["types"];
        };
        readonly 'reports.run': {
            readonly methods: ["POST"];
            readonly pattern: "/reports/run";
            readonly tokens: [{
                readonly old: "/reports/run";
                readonly type: 0;
                readonly val: "reports";
                readonly end: "";
            }, {
                readonly old: "/reports/run";
                readonly type: 0;
                readonly val: "run";
                readonly end: "";
            }];
            readonly types: Registry["reports.run"]["types"];
        };
        readonly 'reports.download': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/reports/runs/:id/download";
            readonly tokens: [{
                readonly old: "/reports/runs/:id/download";
                readonly type: 0;
                readonly val: "reports";
                readonly end: "";
            }, {
                readonly old: "/reports/runs/:id/download";
                readonly type: 0;
                readonly val: "runs";
                readonly end: "";
            }, {
                readonly old: "/reports/runs/:id/download";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/reports/runs/:id/download";
                readonly type: 0;
                readonly val: "download";
                readonly end: "";
            }];
            readonly types: Registry["reports.download"]["types"];
        };
        readonly users: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/users";
            readonly tokens: [{
                readonly old: "/users";
                readonly type: 0;
                readonly val: "users";
                readonly end: "";
            }];
            readonly types: Registry["users"]["types"];
        };
        readonly 'users.create': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/users/create";
            readonly tokens: [{
                readonly old: "/users/create";
                readonly type: 0;
                readonly val: "users";
                readonly end: "";
            }, {
                readonly old: "/users/create";
                readonly type: 0;
                readonly val: "create";
                readonly end: "";
            }];
            readonly types: Registry["users.create"]["types"];
        };
        readonly 'users.store': {
            readonly methods: ["POST"];
            readonly pattern: "/users";
            readonly tokens: [{
                readonly old: "/users";
                readonly type: 0;
                readonly val: "users";
                readonly end: "";
            }];
            readonly types: Registry["users.store"]["types"];
        };
        readonly roles: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/roles";
            readonly tokens: [{
                readonly old: "/roles";
                readonly type: 0;
                readonly val: "roles";
                readonly end: "";
            }];
            readonly types: Registry["roles"]["types"];
        };
        readonly 'roles.update': {
            readonly methods: ["PATCH"];
            readonly pattern: "/roles";
            readonly tokens: [{
                readonly old: "/roles";
                readonly type: 0;
                readonly val: "roles";
                readonly end: "";
            }];
            readonly types: Registry["roles.update"]["types"];
        };
        readonly settings: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/settings";
            readonly tokens: [{
                readonly old: "/settings";
                readonly type: 0;
                readonly val: "settings";
                readonly end: "";
            }];
            readonly types: Registry["settings"]["types"];
        };
        readonly profile: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/profile";
            readonly tokens: [{
                readonly old: "/profile";
                readonly type: 0;
                readonly val: "profile";
                readonly end: "";
            }];
            readonly types: Registry["profile"]["types"];
        };
        readonly user_settings: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/user-settings";
            readonly tokens: [{
                readonly old: "/user-settings";
                readonly type: 0;
                readonly val: "user-settings";
                readonly end: "";
            }];
            readonly types: Registry["user_settings"]["types"];
        };
        readonly 'user_settings.password': {
            readonly methods: ["PATCH"];
            readonly pattern: "/user-settings/password";
            readonly tokens: [{
                readonly old: "/user-settings/password";
                readonly type: 0;
                readonly val: "user-settings";
                readonly end: "";
            }, {
                readonly old: "/user-settings/password";
                readonly type: 0;
                readonly val: "password";
                readonly end: "";
            }];
            readonly types: Registry["user_settings.password"]["types"];
        };
        readonly 'session.destroy': {
            readonly methods: ["POST"];
            readonly pattern: "/logout";
            readonly tokens: [{
                readonly old: "/logout";
                readonly type: 0;
                readonly val: "logout";
                readonly end: "";
            }];
            readonly types: Registry["session.destroy"]["types"];
        };
    };
    $tree: ApiDefinition;
};
declare module '@tuyau/core/types' {
    interface UserRegistry {
        routes: typeof routes;
        $tree: ApiDefinition;
    }
}
