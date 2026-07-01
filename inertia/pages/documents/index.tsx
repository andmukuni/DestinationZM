import { Form } from '@adonisjs/inertia/react'
import { DownloadIcon, PlusIcon } from '~/components/icons'
import { tableIconButtonClass } from '~/components/ui/table_icon_button'
import ResourceTable from '~/components/resource_table'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'

const DOCUMENT_TYPES = [
  { value: 'quotation', label: 'Quotation' },
  { value: 'booking_confirmation', label: 'Booking confirmation' },
  { value: 'supplier_document', label: 'Supplier document' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'recovery_schedule', label: 'Recovery schedule' },
  { value: 'payment_record', label: 'Payment record' },
  { value: 'travel_supporting', label: 'Travel supporting document' },
  { value: 'excel_report', label: 'Excel report' },
]

type DocumentRow = {
  id: number
  documentType: string
  documentTypeLabel: string
  title: string
  mimeType: string
  fileSize: number
  referenceType: string | null
  referenceId: number | null
  uploadedBy: string
  createdAt: string
}

type DocumentsIndexProps = {
  filters: {
    referenceType: string | null
    referenceId: number | null
    documentType: string | null
    branchId: number | null
  }
  documents: DocumentRow[]
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsIndex({ documents }: DocumentsIndexProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Upload document" description="Upload a file to the document library." />
        <CardBody>
          <Form route="documents.store" encType="multipart" className="space-y-4">
            {({ errors }) => (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Document type</label>
                  <select
                    name="documentType"
                    required
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">Select type</option>
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.documentType ? (
                    <p className="mt-1 text-sm text-red-600">{errors.documentType}</p>
                  ) : null}
                </div>
                <Input label="Title" name="title" required error={errors.title} />
                <Input label="Reference type" name="referenceType" error={errors.referenceType} />
                <Input label="Reference ID" name="referenceId" type="number" error={errors.referenceId} />
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">File</label>
                  <input
                    type="file"
                    name="file"
                    required
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                  />
                  {errors.file ? <p className="mt-1 text-sm text-red-600">{errors.file}</p> : null}
                </div>
                <Button type="submit" className="gap-2">
                  <PlusIcon />
                  Upload document
                </Button>
              </>
            )}
          </Form>
        </CardBody>
      </Card>

      <ResourceTable
        title="Document library"
        description={`${documents.length} document${documents.length === 1 ? '' : 's'}`}
        columns={[
          { key: 'title', label: 'Title', className: 'font-medium text-slate-900' },
          { key: 'documentTypeLabel', label: 'Type' },
          {
            key: 'fileSize',
            label: 'Size',
            className: 'text-slate-600',
            render: (value) => formatFileSize(Number(value)),
          },
          { key: 'mimeType', label: 'MIME', className: 'text-slate-600' },
          { key: 'uploadedBy', label: 'Uploaded by', className: 'text-slate-600' },
          { key: 'createdAt', label: 'Uploaded', className: 'text-slate-600' },
          {
            key: 'id',
            label: '',
            stopRowClick: true,
            render: (_, row) => (
              <a
                href={`/documents/${row.id}/download`}
                className={tableIconButtonClass('secondary')}
                title="Download document"
                aria-label="Download document"
                onClick={(event) => event.stopPropagation()}
              >
                <DownloadIcon className="h-4 w-4" />
              </a>
            ),
          },
        ]}
        rows={documents}
        rowHref={(row) => `/documents/${row.id}/download`}
        emptyMessage="No documents in the library."
      />
    </div>
  )
}
