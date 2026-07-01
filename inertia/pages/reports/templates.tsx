import { Form, Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon, PlusIcon } from '~/components/icons'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'

type ReportsTemplatesProps = {
  templates: Array<{
    id: number
    name: string
    slug: string
    source: string
    description: string | null
    isActive: boolean
    filePath: string | null
  }>
}

export default function ReportsTemplates({ templates }: ReportsTemplatesProps) {
  return (
    <div className="space-y-6">
      <div>
        <Link
          route="reports"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon />
          Back to reports
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Report templates</h1>
        <p className="mt-1 text-sm text-slate-600">Upload and manage Excel report templates.</p>
      </div>

      <Card>
        <CardHeader title="Upload template" description="Excel templates (.xlsx, .xls) up to 20 MB." />
        <CardBody>
          <Form route="reports.templates.store" encType="multipart" className="space-y-4">
            {({ errors }) => (
              <>
                <Input label="Name" name="name" required error={errors.name} />
                <Input
                  label="Slug"
                  name="slug"
                  placeholder="monthly-bookings"
                  required
                  error={errors.slug}
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    name="description"
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                  {errors.description ? (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  ) : null}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Template file</label>
                  <input
                    type="file"
                    name="file"
                    accept=".xlsx,.xls"
                    required
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                  />
                  {errors.file ? <p className="mt-1 text-sm text-red-600">{errors.file}</p> : null}
                </div>
                <Button type="submit" className="gap-2">
                  <PlusIcon />
                  Upload template
                </Button>
              </>
            )}
          </Form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Existing templates"
          description={`${templates.length} template${templates.length === 1 ? '' : 's'}`}
        />
        {templates.length === 0 ? (
          <CardBody>
            <p className="text-sm text-slate-600">No templates uploaded yet.</p>
          </CardBody>
        ) : (
          <CardBody className="p-0">
            <Table scrollContainer={false}>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Slug</TH>
                  <TH>Source</TH>
                  <TH>Status</TH>
                  <TH>File</TH>
                </TR>
              </THead>
              <TBody>
                {templates.map((template) => (
                  <TR key={template.id}>
                    <TD className="font-medium text-slate-900">{template.name}</TD>
                    <TD className="text-slate-600">{template.slug}</TD>
                    <TD className="text-slate-600">{template.source}</TD>
                    <TD>
                      {template.isActive ? (
                        <Badge tone="success">Active</Badge>
                      ) : (
                        <Badge tone="danger">Inactive</Badge>
                      )}
                    </TD>
                    <TD className="text-slate-600">{template.filePath}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        )}
      </Card>
    </div>
  )
}
