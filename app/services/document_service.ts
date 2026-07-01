import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import app from '@adonisjs/core/services/app'
import Document from '#models/document'
import type { DocumentType } from '#types/document_types'

type StoreDocumentInput = {
  documentType: DocumentType
  title: string
  fileName: string
  contents: Buffer | Uint8Array
  mimeType?: string | null
  referenceType?: string | null
  referenceId?: number | null
  uploadedById?: number | null
  branchId?: number | null
}

export default class DocumentService {
  private static documentsRoot() {
    return app.makePath('storage/app/documents')
  }

  private static relativePath(fileName: string) {
    return join('documents', fileName)
  }

  static async store(input: StoreDocumentInput) {
    const root = this.documentsRoot()
    await mkdir(root, { recursive: true })

    const safeName = input.fileName.replace(/[^\w.-]+/g, '_')
    const storedName = `${randomUUID()}-${safeName}`
    const absolutePath = join(root, storedName)

    await writeFile(absolutePath, input.contents)

    return Document.create({
      documentType: input.documentType,
      title: input.title,
      filePath: this.relativePath(storedName),
      mimeType: input.mimeType ?? null,
      fileSize: input.contents.byteLength,
      referenceType: input.referenceType ?? null,
      referenceId: input.referenceId ?? null,
      uploadedById: input.uploadedById ?? null,
      branchId: input.branchId ?? null,
      status: 'active',
    })
  }

  static listByReference(referenceType: string, referenceId: number) {
    return Document.query()
      .where('reference_type', referenceType)
      .where('reference_id', referenceId)
      .where('status', 'active')
      .orderBy('created_at', 'desc')
  }

  static async delete(document: Document) {
    const absolutePath = app.makePath('storage/app', document.filePath)
    try {
      await unlink(absolutePath)
    } catch {
      // File may already be removed from disk.
    }

    document.status = 'archived'
    await document.save()
  }
}
