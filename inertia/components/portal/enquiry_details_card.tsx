import { Card, CardBody, CardHeader } from '~/components/ui/card'

type EnquiryDetailsCardProps = {
  typeName: string
  rows: Array<{ label: string; value: string }>
  compact?: boolean
}

export default function EnquiryDetailsCard({ typeName, rows, compact = false }: EnquiryDetailsCardProps) {
  if (!rows.length) {
    return null
  }

  return (
    <Card>
      <CardHeader title="Enquiry details" description={typeName} />
      <CardBody>
        <dl className={`grid gap-3 ${compact ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs font-medium text-slate-500">{row.label}</dt>
              <dd className="mt-0.5 text-sm text-slate-900">{row.value}</dd>
            </div>
          ))}
        </dl>
      </CardBody>
    </Card>
  )
}
