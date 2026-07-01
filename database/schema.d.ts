import { BaseModel } from '@adonisjs/lucid/orm';
import { DateTime } from 'luxon';
export declare class AuditLogSchema extends BaseModel {
    static $columns: readonly ["action", "createdAt", "entityId", "entityType", "id", "ipAddress", "metadata", "userId"];
    $columns: readonly ["action", "createdAt", "entityId", "entityType", "id", "ipAddress", "metadata", "userId"];
    action: string;
    createdAt: DateTime;
    entityId: number | null;
    entityType: string;
    id: number;
    ipAddress: string | null;
    metadata: string | null;
    userId: number | null;
}
export declare class BookingSchema extends BaseModel {
    static $columns: readonly ["assignedUserId", "branchId", "confirmedAt", "createdAt", "currency", "customerId", "departDate", "destination", "id", "notes", "pax", "reference", "returnDate", "status", "totalAmount", "updatedAt"];
    $columns: readonly ["assignedUserId", "branchId", "confirmedAt", "createdAt", "currency", "customerId", "departDate", "destination", "id", "notes", "pax", "reference", "returnDate", "status", "totalAmount", "updatedAt"];
    assignedUserId: number | null;
    branchId: number;
    confirmedAt: DateTime | null;
    createdAt: DateTime;
    currency: string;
    customerId: number;
    departDate: DateTime;
    destination: string;
    id: number;
    notes: string | null;
    pax: number;
    reference: string;
    returnDate: DateTime | null;
    status: string;
    totalAmount: string;
    updatedAt: DateTime | null;
}
export declare class BookingItemSchema extends BaseModel {
    static $columns: readonly ["bookingId", "createdAt", "description", "id", "lineTotal", "quantity", "supplierId", "unitPrice", "updatedAt"];
    $columns: readonly ["bookingId", "createdAt", "description", "id", "lineTotal", "quantity", "supplierId", "unitPrice", "updatedAt"];
    bookingId: number;
    createdAt: DateTime;
    description: string;
    id: number;
    lineTotal: string;
    quantity: number;
    supplierId: number | null;
    unitPrice: string;
    updatedAt: DateTime | null;
}
export declare class BranchSchema extends BaseModel {
    static $columns: readonly ["code", "createdAt", "id", "name", "updatedAt"];
    $columns: readonly ["code", "createdAt", "id", "name", "updatedAt"];
    code: string;
    createdAt: DateTime;
    id: number;
    name: string;
    updatedAt: DateTime | null;
}
export declare class ClientAccountSchema extends BaseModel {
    static $columns: readonly ["createdAt", "customerId", "email", "fullName", "id", "isActive", "lastLoginAt", "password", "role", "updatedAt"];
    $columns: readonly ["createdAt", "customerId", "email", "fullName", "id", "isActive", "lastLoginAt", "password", "role", "updatedAt"];
    createdAt: DateTime;
    customerId: number;
    email: string;
    fullName: string | null;
    id: number;
    isActive: boolean;
    lastLoginAt: DateTime | null;
    password: string;
    role: string;
    updatedAt: DateTime | null;
}
export declare class CustomerSchema extends BaseModel {
    static $columns: readonly ["branchId", "company", "createdAt", "email", "fullName", "id", "notes", "phone", "updatedAt"];
    $columns: readonly ["branchId", "company", "createdAt", "email", "fullName", "id", "notes", "phone", "updatedAt"];
    branchId: number | null;
    company: string | null;
    createdAt: DateTime;
    email: string | null;
    fullName: string;
    id: number;
    notes: string | null;
    phone: string | null;
    updatedAt: DateTime | null;
}
export declare class DocumentSchema extends BaseModel {
    static $columns: readonly ["branchId", "createdAt", "documentType", "filePath", "fileSize", "id", "mimeType", "referenceId", "referenceType", "status", "title", "updatedAt", "uploadedById"];
    $columns: readonly ["branchId", "createdAt", "documentType", "filePath", "fileSize", "id", "mimeType", "referenceId", "referenceType", "status", "title", "updatedAt", "uploadedById"];
    branchId: number | null;
    createdAt: DateTime;
    documentType: string;
    filePath: string;
    fileSize: number | null;
    id: number;
    mimeType: string | null;
    referenceId: number | null;
    referenceType: string | null;
    status: string;
    title: string;
    updatedAt: DateTime | null;
    uploadedById: number | null;
}
export declare class InvoiceSchema extends BaseModel {
    static $columns: readonly ["amountPaid", "bookingId", "branchId", "createdAt", "currency", "customerId", "documentId", "dueDate", "id", "invoiceNumber", "issueDate", "notes", "recoveryReportId", "status", "subtotal", "taxAmount", "totalAmount", "updatedAt"];
    $columns: readonly ["amountPaid", "bookingId", "branchId", "createdAt", "currency", "customerId", "documentId", "dueDate", "id", "invoiceNumber", "issueDate", "notes", "recoveryReportId", "status", "subtotal", "taxAmount", "totalAmount", "updatedAt"];
    amountPaid: string;
    bookingId: number | null;
    branchId: number;
    createdAt: DateTime;
    currency: string;
    customerId: number;
    documentId: number | null;
    dueDate: DateTime;
    id: number;
    invoiceNumber: string;
    issueDate: DateTime;
    notes: string | null;
    recoveryReportId: number | null;
    status: string;
    subtotal: string;
    taxAmount: string;
    totalAmount: string;
    updatedAt: DateTime | null;
}
export declare class NotificationSchema extends BaseModel {
    static $columns: readonly ["body", "createdAt", "entityId", "entityType", "id", "readAt", "title", "type", "userId"];
    $columns: readonly ["body", "createdAt", "entityId", "entityType", "id", "readAt", "title", "type", "userId"];
    body: string | null;
    createdAt: DateTime;
    entityId: number | null;
    entityType: string | null;
    id: number;
    readAt: DateTime | null;
    title: string;
    type: string;
    userId: number;
}
export declare class PaymentRecordSchema extends BaseModel {
    static $columns: readonly ["amount", "branchId", "createdAt", "currency", "customerId", "documentId", "id", "invoiceId", "notes", "paymentDate", "paymentMethod", "paymentReference", "receiptId", "recordedById", "reference", "status", "updatedAt"];
    $columns: readonly ["amount", "branchId", "createdAt", "currency", "customerId", "documentId", "id", "invoiceId", "notes", "paymentDate", "paymentMethod", "paymentReference", "receiptId", "recordedById", "reference", "status", "updatedAt"];
    amount: string;
    branchId: number;
    createdAt: DateTime;
    currency: string;
    customerId: number;
    documentId: number | null;
    id: number;
    invoiceId: number | null;
    notes: string | null;
    paymentDate: DateTime;
    paymentMethod: string;
    paymentReference: string | null;
    receiptId: number | null;
    recordedById: number | null;
    reference: string;
    status: string;
    updatedAt: DateTime | null;
}
export declare class QuotationSchema extends BaseModel {
    static $columns: readonly ["approvedAt", "bookingId", "branchId", "createdAt", "createdById", "currency", "customerId", "documentId", "id", "notes", "reference", "status", "subtotal", "taxAmount", "totalAmount", "updatedAt", "validUntil"];
    $columns: readonly ["approvedAt", "bookingId", "branchId", "createdAt", "createdById", "currency", "customerId", "documentId", "id", "notes", "reference", "status", "subtotal", "taxAmount", "totalAmount", "updatedAt", "validUntil"];
    approvedAt: DateTime | null;
    bookingId: number | null;
    branchId: number;
    createdAt: DateTime;
    createdById: number | null;
    currency: string;
    customerId: number;
    documentId: number | null;
    id: number;
    notes: string | null;
    reference: string;
    status: string;
    subtotal: string;
    taxAmount: string;
    totalAmount: string;
    updatedAt: DateTime | null;
    validUntil: DateTime | null;
}
export declare class ReceiptSchema extends BaseModel {
    static $columns: readonly ["amount", "branchId", "createdAt", "currency", "customerId", "documentId", "id", "invoiceId", "notes", "paymentMethod", "paymentReference", "receiptNumber", "receivedDate", "recordedById", "updatedAt"];
    $columns: readonly ["amount", "branchId", "createdAt", "currency", "customerId", "documentId", "id", "invoiceId", "notes", "paymentMethod", "paymentReference", "receiptNumber", "receivedDate", "recordedById", "updatedAt"];
    amount: string;
    branchId: number;
    createdAt: DateTime;
    currency: string;
    customerId: number;
    documentId: number | null;
    id: number;
    invoiceId: number;
    notes: string | null;
    paymentMethod: string;
    paymentReference: string | null;
    receiptNumber: string;
    receivedDate: DateTime;
    recordedById: number | null;
    updatedAt: DateTime | null;
}
export declare class RecoveryReportSchema extends BaseModel {
    static $columns: readonly ["bookingId", "branchId", "clientConfirmedAt", "clientRejectedAt", "createdAt", "createdById", "documentId", "id", "notes", "quotationId", "reference", "sentAt", "status", "updatedAt"];
    $columns: readonly ["bookingId", "branchId", "clientConfirmedAt", "clientRejectedAt", "createdAt", "createdById", "documentId", "id", "notes", "quotationId", "reference", "sentAt", "status", "updatedAt"];
    bookingId: number;
    branchId: number;
    clientConfirmedAt: DateTime | null;
    clientRejectedAt: DateTime | null;
    createdAt: DateTime;
    createdById: number | null;
    documentId: number | null;
    id: number;
    notes: string | null;
    quotationId: number | null;
    reference: string;
    sentAt: DateTime | null;
    status: string;
    updatedAt: DateTime | null;
}
export declare class RecoveryReportLineSchema extends BaseModel {
    static $columns: readonly ["bookingReference", "createdAt", "currency", "departDate", "description", "destination", "id", "lineTotal", "notes", "pax", "quantity", "recoveryReportId", "returnDate", "sortOrder", "taxAmount", "totalAmount", "unitPrice", "updatedAt"];
    $columns: readonly ["bookingReference", "createdAt", "currency", "departDate", "description", "destination", "id", "lineTotal", "notes", "pax", "quantity", "recoveryReportId", "returnDate", "sortOrder", "taxAmount", "totalAmount", "unitPrice", "updatedAt"];
    bookingReference: string | null;
    createdAt: DateTime;
    currency: string;
    departDate: DateTime | null;
    description: string;
    destination: string | null;
    id: number;
    lineTotal: string;
    notes: string | null;
    pax: number | null;
    quantity: number;
    recoveryReportId: number;
    returnDate: DateTime | null;
    sortOrder: number;
    taxAmount: string;
    totalAmount: string;
    unitPrice: string;
    updatedAt: DateTime | null;
}
export declare class RecoveryScheduleSchema extends BaseModel {
    static $columns: readonly ["assignedOfficerId", "branchId", "createdAt", "customerId", "documentId", "escalationLevel", "id", "invoiceId", "nextActionDate", "notes", "resolvedAt", "status", "updatedAt"];
    $columns: readonly ["assignedOfficerId", "branchId", "createdAt", "customerId", "documentId", "escalationLevel", "id", "invoiceId", "nextActionDate", "notes", "resolvedAt", "status", "updatedAt"];
    assignedOfficerId: number | null;
    branchId: number;
    createdAt: DateTime;
    customerId: number;
    documentId: number | null;
    escalationLevel: number;
    id: number;
    invoiceId: number;
    nextActionDate: DateTime | null;
    notes: string | null;
    resolvedAt: DateTime | null;
    status: string;
    updatedAt: DateTime | null;
}
export declare class ReportRunSchema extends BaseModel {
    static $columns: readonly ["createdAt", "errorMessage", "generatedById", "id", "outputDocumentId", "parameters", "status", "templateId", "updatedAt"];
    $columns: readonly ["createdAt", "errorMessage", "generatedById", "id", "outputDocumentId", "parameters", "status", "templateId", "updatedAt"];
    createdAt: DateTime;
    errorMessage: string | null;
    generatedById: number | null;
    id: number;
    outputDocumentId: number | null;
    parameters: string | null;
    status: string;
    templateId: number;
    updatedAt: DateTime | null;
}
export declare class ReportTemplateSchema extends BaseModel {
    static $columns: readonly ["createdAt", "description", "filePath", "id", "isActive", "name", "slug", "source", "updatedAt"];
    $columns: readonly ["createdAt", "description", "filePath", "id", "isActive", "name", "slug", "source", "updatedAt"];
    createdAt: DateTime;
    description: string | null;
    filePath: string | null;
    id: number;
    isActive: boolean;
    name: string;
    slug: string;
    source: string;
    updatedAt: DateTime | null;
}
export declare class RolePermissionSchema extends BaseModel {
    static $columns: readonly ["createdAt", "id", "permission", "role", "updatedAt"];
    $columns: readonly ["createdAt", "id", "permission", "role", "updatedAt"];
    createdAt: DateTime;
    id: number;
    permission: string;
    role: string;
    updatedAt: DateTime | null;
}
export declare class SupplierSchema extends BaseModel {
    static $columns: readonly ["branchId", "code", "contactName", "createdAt", "email", "id", "isActive", "name", "notes", "phone", "updatedAt"];
    $columns: readonly ["branchId", "code", "contactName", "createdAt", "email", "id", "isActive", "name", "notes", "phone", "updatedAt"];
    branchId: number | null;
    code: string | null;
    contactName: string | null;
    createdAt: DateTime;
    email: string | null;
    id: number;
    isActive: boolean;
    name: string;
    notes: string | null;
    phone: string | null;
    updatedAt: DateTime | null;
}
export declare class UserSchema extends BaseModel {
    static $columns: readonly ["branchId", "createdAt", "email", "fullName", "id", "lastAccessedAt", "password", "role", "updatedAt"];
    $columns: readonly ["branchId", "createdAt", "email", "fullName", "id", "lastAccessedAt", "password", "role", "updatedAt"];
    branchId: number | null;
    createdAt: DateTime;
    email: string;
    fullName: string | null;
    id: number;
    lastAccessedAt: DateTime | null;
    password: string;
    role: string;
    updatedAt: DateTime | null;
}
