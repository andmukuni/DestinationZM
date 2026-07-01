import { Form, Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'

type FieldRow = {
  id: number
  fieldKey: string
  label: string
  fieldType: string
  placeholder: string | null
  required: boolean
  options: string[] | null
  sortOrder: number
  mapsTo: string
}

type PortalBookingTypesFormProps = {
  pageTitle?: string
  pageDescription?: string
  bookingType: {
    id: number
    slug: string
    name: string
    description: string | null
    sortOrder: number
    isActive: boolean
    fields: FieldRow[]
  } | null
  fieldMaps: string[]
  fieldTypes: string[]
}

const fieldClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200'

export default function PortalBookingTypesForm({
  bookingType,
  fieldMaps,
  fieldTypes,
}: PortalBookingTypesFormProps) {
  const isEdit = Boolean(bookingType)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/portal-booking-types" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ← Back to portal enquiry types
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
          {isEdit ? bookingType!.name : 'New portal enquiry type'}
        </h1>
      </div>

      <Card>
        <CardHeader title="Type details" />
        <CardBody>
          <Form
            action={isEdit ? `/portal-booking-types/${bookingType!.id}` : '/portal-booking-types'}
            method="post"
            className="grid gap-4 sm:grid-cols-2"
          >
            {({ errors }) => (
              <>
                <Input
                  label="Name"
                  name="name"
                  defaultValue={bookingType?.name ?? ''}
                  error={errors.name}
                  className="sm:col-span-2"
                />
                <Input
                  label="Slug"
                  name="slug"
                  defaultValue={bookingType?.slug ?? ''}
                  placeholder="flight"
                  error={errors.slug}
                />
                <Input
                  label="Sort order"
                  name="sortOrder"
                  type="number"
                  defaultValue={String(bookingType?.sortOrder ?? 0)}
                  error={errors.sortOrder}
                />
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={bookingType?.description ?? ''}
                    className={`${fieldClass} h-auto py-2`}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="isActive"
                    value="1"
                    defaultChecked={bookingType?.isActive ?? true}
                    className="rounded border-slate-300"
                  />
                  Active on client portal
                </label>
                <div className="sm:col-span-2">
                  <Button type="submit">{isEdit ? 'Save type' : 'Create type'}</Button>
                </div>
              </>
            )}
          </Form>
        </CardBody>
      </Card>

      {isEdit ? (
        <>
          <Card>
            <CardHeader title="Fields" description="Inputs shown when a client selects this tab" />
            <CardBody className="space-y-6 p-0 sm:p-0">
              <Table>
                <THead>
                  <TR>
                    <TH>Label</TH>
                    <TH>Key</TH>
                    <TH>Type</TH>
                    <TH>Maps to</TH>
                    <TH>Required</TH>
                    <TH>Order</TH>
                    <TH />
                  </TR>
                </THead>
                <TBody>
                  {bookingType!.fields.length === 0 ? (
                    <TR>
                      <TD colSpan={7} className="py-8 text-center text-sm text-slate-500">
                        No fields yet. Add one below.
                      </TD>
                    </TR>
                  ) : (
                    bookingType!.fields.map((field) => (
                      <TR key={field.id}>
                        <TD>{field.label}</TD>
                        <TD className="font-mono text-xs">{field.fieldKey}</TD>
                        <TD>{field.fieldType}</TD>
                        <TD>{field.mapsTo}</TD>
                        <TD>{field.required ? 'Yes' : 'No'}</TD>
                        <TD>{field.sortOrder}</TD>
                        <TD className="text-right">
                          <Form
                            action={`/portal-booking-types/${bookingType!.id}/fields/${field.id}/delete`}
                            method="post"
                            className="inline"
                          >
                            <Button type="submit" variant="secondary" className="h-8 px-3 text-xs">
                              Remove
                            </Button>
                          </Form>
                        </TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Add field" />
            <CardBody>
              <Form
                action={`/portal-booking-types/${bookingType!.id}/fields`}
                method="post"
                className="grid gap-4 sm:grid-cols-2"
              >
                {({ errors }) => (
                  <>
                    <Input label="Label" name="label" error={errors.label} />
                    <Input
                      label="Field key"
                      name="fieldKey"
                      placeholder="pickup_location"
                      error={errors.fieldKey}
                    />
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Field type</label>
                      <select name="fieldType" defaultValue="text" className={fieldClass}>
                        {fieldTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Maps to</label>
                      <select name="mapsTo" defaultValue="custom" className={fieldClass}>
                        {fieldMaps.map((map) => (
                          <option key={map} value={map}>
                            {map}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input label="Placeholder" name="placeholder" error={errors.placeholder} />
                    <Input
                      label="Sort order"
                      name="sortOrder"
                      type="number"
                      defaultValue="0"
                      error={errors.sortOrder}
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Select options (comma-separated)"
                        name="options"
                        placeholder="Economy, Business, First"
                        error={errors.options}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" name="required" value="1" className="rounded border-slate-300" />
                      Required
                    </label>
                    <div className="sm:col-span-2">
                      <Button type="submit">Add field</Button>
                    </div>
                  </>
                )}
              </Form>
            </CardBody>
          </Card>
        </>
      ) : null}
    </div>
  )
}
