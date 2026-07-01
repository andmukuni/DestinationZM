import vine from '@vinejs/vine'
import { DOCUMENT_TYPES } from '#types/document_types'

export const documentUploadValidator = vine.compile(
  vine.object({
    documentType: vine.enum(DOCUMENT_TYPES),
    title: vine.string().trim().minLength(2).maxLength(255),
    referenceType: vine.string().trim().maxLength(80).optional(),
    referenceId: vine.number().optional(),
    branchId: vine.number().optional(),
  })
)
