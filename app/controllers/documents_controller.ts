import app from '@adonisjs/core/services/app'
import { readFile } from 'node:fs/promises'
import Document from '#models/document'
import AuthorizationService from '#services/authorization_service'
import DocumentService from '#services/document_service'
import { DOCUMENT_TYPE_LABELS } from '#types/document_types'
import { documentUploadValidator } from '#validators/document_validator'
import type { HttpContext } from '@adonisjs/core/http'

function canViewDocuments(user: Parameters<typeof AuthorizationService.can>[0]) {
  return (
    AuthorizationService.can(user, 'documents.view') ||
    AuthorizationService.can(user, 'documents.upload') ||
    AuthorizationService.can(user, 'documents.manage')
  )
}

export default class DocumentsController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!canViewDocuments(user)) {
      return response.forbidden()
    }

    const referenceType = request.qs().referenceType ? String(request.qs().referenceType) : null
    const referenceId = request.qs().referenceId ? Number(request.qs().referenceId) : null
    const documentType = request.qs().documentType ? String(request.qs().documentType) : null
    const userBranchId = AuthorizationService.branchIdFor(user)
    const filterBranchId = request.qs().branchId ? Number(request.qs().branchId) : null
    const branchId = userBranchId ?? filterBranchId ?? null

    const query = Document.query()
      .preload('uploadedBy')
      .where('status', 'active')
      .orderBy('created_at', 'desc')

    if (userBranchId) {
      query.where('branch_id', userBranchId)
    } else if (branchId) {
      query.where('branch_id', branchId)
    }

    if (referenceType) {
      query.where('reference_type', referenceType)
    }

    if (referenceId) {
      query.where('reference_id', referenceId)
    }

    if (documentType) {
      query.where('document_type', documentType)
    }

    const documents = await query

    return inertia.render('documents/index', {
      filters: {
        referenceType,
        referenceId,
        documentType,
        branchId: branchId ?? null,
      },
      documents: documents.map((doc) => ({
        id: doc.id,
        documentType: doc.documentType,
        documentTypeLabel: DOCUMENT_TYPE_LABELS[doc.documentType],
        title: doc.title,
        mimeType: doc.mimeType ?? '—',
        fileSize: doc.fileSize ?? 0,
        referenceType: doc.referenceType,
        referenceId: doc.referenceId,
        uploadedBy: doc.uploadedBy?.fullName ?? '—',
        createdAt: doc.createdAt.toFormat('dd LLL yyyy HH:mm'),
      })),
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.can(user, 'documents.upload')) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(documentUploadValidator)
    const file = request.file('file', {
      size: '20mb',
      extnames: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'],
    })

    if (!file || !file.isValid) {
      session.flash('error', file?.errors[0]?.message ?? 'A valid file is required')
      return response.redirect().back()
    }

    const userBranchId = AuthorizationService.branchIdFor(user)
    const branchId = userBranchId ?? payload.branchId ?? null
    const contents = await readFile(file.tmpPath!)

    const document = await DocumentService.store({
      documentType: payload.documentType,
      title: payload.title,
      fileName: file.clientName,
      contents,
      mimeType: file.type,
      referenceType: payload.referenceType ?? null,
      referenceId: payload.referenceId ?? null,
      uploadedById: user.id,
      branchId,
    })

    session.flash('success', 'Document uploaded successfully')
    return response.redirect().toRoute('documents.download', { id: document.id })
  }

  async download({ auth, params, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!canViewDocuments(user)) {
      return response.forbidden()
    }

    const document = await Document.findOrFail(params.id)
    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && document.branchId !== userBranchId) {
      return response.forbidden()
    }

    const absolutePath = app.makePath('storage/app', document.filePath)

    return response.download(absolutePath)
  }

  async destroy({ auth, params, response, session }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.can(user, 'documents.manage')) {
      return response.forbidden()
    }

    const document = await Document.findOrFail(params.id)
    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && document.branchId !== userBranchId) {
      return response.forbidden()
    }

    await DocumentService.delete(document)

    session.flash('success', 'Document removed successfully')
    return response.redirect().back()
  }
}
