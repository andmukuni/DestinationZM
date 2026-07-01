export type EnquiryServiceSummary = {
  typeName: string
  destination: string
  dateRange: string | null
  pax: number | null
  details: Array<{ label: string; value: string }>
}

export function LineItemDescription({ description }: { description: string }) {
  const lines = description.split('\n').filter(Boolean)
  if (!lines.length) {
    return <span className="text-slate-400">—</span>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {lines.map((line) => {
        const colonIdx = line.indexOf(':')
        const label = colonIdx > 0 ? line.slice(0, colonIdx).trim() : line
        const value = colonIdx > 0 ? line.slice(colonIdx + 1).trim() : ''

        return (
          <span
            key={line}
            className="inline-flex max-w-full items-baseline rounded-md bg-slate-100 px-2 py-0.5 text-[11px] leading-snug text-slate-700"
          >
            <span className="font-semibold text-slate-500">{label}</span>
            {value ? <span className="ml-1">{value}</span> : null}
          </span>
        )
      })}
    </div>
  )
}

export default function EnquiryServiceSummaries({
  summaries,
}: {
  summaries: EnquiryServiceSummary[]
}) {
  if (!summaries.length) {
    return null
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {summaries.map((service, index) => (
        <div
          key={`${service.typeName}-${service.destination}-${index}`}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200">
              {service.typeName}
            </span>
            {service.destination ? (
              <span className="min-w-0 truncate text-sm font-medium text-slate-900">
                {service.destination}
              </span>
            ) : null}
          </div>

          {service.dateRange || service.pax ? (
            <p className="mt-1 text-xs text-slate-500">
              {[service.dateRange, service.pax ? `${service.pax} pax` : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
          ) : null}

          {service.details.length ? (
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {service.details.map((row) => (
                <div key={`${row.label}-${row.value}`} className="min-w-0">
                  <dt className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    {row.label}
                  </dt>
                  <dd className="truncate text-xs text-slate-800">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      ))}
    </div>
  )
}
