import { Link } from '@adonisjs/inertia/react'
import { type ReactNode } from 'react'
import { PlusIcon } from '~/components/icons'
import { stopRowClick } from '~/lib/table_row'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'

export type ResourceTableColumn<T extends { id: number }> = {
  key: string
  label: string
  render?: (value: unknown, row: T) => ReactNode
  className?: string
  /** Prevent row navigation when clicking this cell (e.g. action buttons). */
  stopRowClick?: boolean
}

type ResourceTableProps<T extends { id: number }> = {
  title: string
  description?: string
  createHref?: string
  createLabel?: string
  columns: ResourceTableColumn<T>[]
  rows: T[]
  rowHref?: (row: T) => string | undefined
  emptyMessage?: string
}

export default function ResourceTable<T extends { id: number }>({
  title,
  description,
  createHref,
  createLabel = 'Create',
  columns,
  rows,
  rowHref,
  emptyMessage = 'No records found.',
}: ResourceTableProps<T>) {
  const summary = description ?? `${rows.length} record${rows.length === 1 ? '' : 's'}`

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{summary}</p>
        </div>
        {createHref ? (
          <Link
            href={createHref}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-transparent bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            <PlusIcon />
            {createLabel}
          </Link>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <Table scrollContainer={false}>
            <THead>
              <TR>
                {columns.map((column) => (
                  <TH key={column.key}>{column.label}</TH>
                ))}
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => {
                const href = rowHref?.(row)
                return (
                  <TR key={row.id} href={href}>
                    {columns.map((column) => {
                      const value = (row as Record<string, unknown>)[column.key]
                      return (
                        <TD
                          key={column.key}
                          className={column.className}
                          onClick={href && column.stopRowClick ? stopRowClick : undefined}
                          onKeyDown={href && column.stopRowClick ? stopRowClick : undefined}
                        >
                          {column.render ? column.render(value, row) : (value as ReactNode)}
                        </TD>
                      )
                    })}
                  </TR>
                )
              })}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  )
}
