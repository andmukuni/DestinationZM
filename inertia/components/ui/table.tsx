import { type CSSProperties, type ReactNode, type KeyboardEvent, type MouseEvent, forwardRef } from 'react'
import { router } from '@inertiajs/react'

export function Table({
  children,
  scrollContainer = true,
  className = '',
}: {
  children: ReactNode
  scrollContainer?: boolean
  className?: string
}) {
  const table = (
    <table className={`min-w-full divide-y divide-slate-200 text-sm ${className}`}>{children}</table>
  )

  if (!scrollContainer) {
    return table
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">{table}</div>
  )
}

export const THead = forwardRef<
  HTMLTableSectionElement,
  {
    children: ReactNode
    className?: string
    style?: CSSProperties
    pinned?: boolean
  }
>(function THead({ children, className = '', style, pinned = false }, ref) {
  return (
    <thead
      ref={ref}
      className={`${pinned ? 'bg-slate-300' : 'bg-slate-200'} ${className}`}
      style={style}
    >
      {children}
    </thead>
  )
})

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
}

export function TR({
  children,
  className = '',
  onClick,
  href,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  href?: string
}) {
  const handleClick = href ? () => router.visit(href) : onClick

  return (
    <tr
      className={`hover:bg-slate-50/80 ${handleClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
      onKeyDown={
        handleClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleClick()
              }
            }
          : undefined
      }
      tabIndex={handleClick ? 0 : undefined}
      role={handleClick ? 'link' : undefined}
    >
      {children}
    </tr>
  )
}

export function TH({
  children,
  className = '',
  stickyTop,
  stickyPinned = false,
}: {
  children: ReactNode
  className?: string
  stickyTop?: number
  stickyPinned?: boolean
}) {
  const isSticky = stickyTop !== undefined
  const pinnedHeaderClass =
    'sticky z-10 border-b border-slate-400 bg-slate-300 text-slate-800 shadow-none'
  const stickyHeaderClass =
    'sticky z-10 border-b border-slate-300 bg-slate-200 text-slate-700 shadow-none'

  return (
    <th
      scope="col"
      style={isSticky ? { top: stickyTop } : undefined}
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${
        isSticky
          ? stickyPinned
            ? pinnedHeaderClass
            : stickyHeaderClass
          : 'bg-slate-200 text-slate-700'
      } ${className}`}
    >
      {children}
    </th>
  )
}

export function TD({
  children,
  className = '',
  colSpan,
  onClick,
  onKeyDown,
}: {
  children: ReactNode
  className?: string
  colSpan?: number
  onClick?: (event: MouseEvent<HTMLTableCellElement>) => void
  onKeyDown?: (event: KeyboardEvent<HTMLTableCellElement>) => void
}) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-3 text-slate-800 ${className}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {children}
    </td>
  )
}
