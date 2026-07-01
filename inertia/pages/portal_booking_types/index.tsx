import { Link } from '@adonisjs/inertia/react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardBody } from '~/components/ui/card'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'

type PortalBookingTypesIndexProps = {
  pageTitle?: string
  pageDescription?: string
  types: Array<{
    id: number
    slug: string
    name: string
    description: string | null
    sortOrder: number
    isActive: boolean
    fieldCount: number
  }>
}

export default function PortalBookingTypesIndex({ types }: PortalBookingTypesIndexProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Portal enquiry types</h1>
          <p className="mt-1 text-sm text-slate-600">
            Tabs and fields shown on the client portal new enquiry page.
          </p>
        </div>
        <Link href="/portal-booking-types/create">
          <Button>New enquiry type</Button>
        </Link>
      </div>

      <Card>
        <CardBody className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Slug</TH>
                <TH>Fields</TH>
                <TH>Order</TH>
                <TH>Status</TH>
                <TH />
              </TR>
            </THead>
            <TBody>
              {types.length === 0 ? (
                <TR>
                  <TD colSpan={6} className="py-8 text-center text-sm text-slate-500">
                    No enquiry types yet.
                  </TD>
                </TR>
              ) : (
                types.map((type) => (
                  <TR key={type.id}>
                    <TD>
                      <div>
                        <p className="font-medium text-slate-900">{type.name}</p>
                        {type.description ? (
                          <p className="mt-0.5 text-xs text-slate-500">{type.description}</p>
                        ) : null}
                      </div>
                    </TD>
                    <TD className="font-mono text-xs text-slate-600">{type.slug}</TD>
                    <TD>{type.fieldCount}</TD>
                    <TD>{type.sortOrder}</TD>
                    <TD>
                      <Badge tone={type.isActive ? 'success' : 'default'}>
                        {type.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TD>
                    <TD className="text-right">
                      <Link href={`/portal-booking-types/${type.id}/edit`}>
                        <Button variant="secondary" className="h-8 px-3 text-xs">
                          Edit
                        </Button>
                      </Link>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  )
}
