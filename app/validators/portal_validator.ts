import vine from '@vinejs/vine'
import { PORTAL_PRIVILEGES } from '#types/portal_privileges'

export const portalRegistrationValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(120),
    email: vine.string().trim().email().maxLength(255),
    company: vine.string().trim().maxLength(255).optional(),
    phone: vine.string().trim().maxLength(64).optional(),
    message: vine.string().trim().maxLength(2000).optional(),
  })
)

export const portalEnquiryValidator = vine.compile(
  vine.object({
    destination: vine.string().trim().minLength(2).maxLength(120),
    departDate: vine.date(),
    returnDate: vine.date().optional(),
    pax: vine.number().min(1).max(999),
    estimatedBudget: vine.number().min(0).optional(),
    currency: vine.string().trim().fixedLength(3).optional(),
    notes: vine.string().trim().maxLength(5000).optional(),
    branchId: vine.number().optional(),
  })
)

export const portalPaymentValidator = vine.compile(
  vine.object({
    amount: vine.number().min(0.01).optional(),
    paymentMethod: vine.string().trim().minLength(2).maxLength(60),
    paymentReference: vine.string().trim().maxLength(120).optional(),
  })
)

export const portalUserStoreValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(120),
    email: vine.string().trim().email().maxLength(255),
    password: vine.string().minLength(8).maxLength(255),
    role: vine.enum(['owner', 'admin', 'member'] as const),
    privileges: vine.array(vine.enum(PORTAL_PRIVILEGES)).optional(),
  })
)

export const portalUserUpdateValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(120).optional(),
    role: vine.enum(['owner', 'admin', 'member'] as const).optional(),
    isActive: vine
      .any()
      .optional()
      .transform((value) => {
        if (value === undefined || value === null || value === '') {
          return undefined
        }
        return value === true || value === 'true' || value === '1' || value === 1
      }),
    privileges: vine.array(vine.enum(PORTAL_PRIVILEGES)).optional(),
    password: vine
      .string()
      .trim()
      .minLength(8)
      .maxLength(255)
      .optional()
      .transform((value) => (value === '' ? undefined : value)),
    passwordConfirmation: vine
      .string()
      .trim()
      .optional()
      .transform((value) => (value === '' ? undefined : value)),
  })
)

export const recoveryReportStoreValidator = vine.compile(
  vine.object({
    notes: vine.string().trim().maxLength(5000).optional(),
    lines: vine
      .array(
        vine.object({
          description: vine.string().trim().minLength(2).maxLength(255),
          quantity: vine.number().min(1).optional(),
          unitPrice: vine.number().min(0).optional(),
          lineTotal: vine.number().min(0).optional(),
          taxAmount: vine.number().min(0).optional(),
          totalAmount: vine.number().min(0).optional(),
          currency: vine.string().trim().fixedLength(3).optional(),
          notes: vine.string().trim().maxLength(2000).optional(),
        })
      )
      .optional(),
  })
)
