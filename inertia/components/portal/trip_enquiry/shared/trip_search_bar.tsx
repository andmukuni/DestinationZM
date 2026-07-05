import type { ReactNode } from 'react'

type TripSearchBarProps = {
  children: ReactNode
}

export function TripSearchBar({ children }: TripSearchBarProps) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-300 shadow-sm lg:flex-row lg:items-stretch">
      {children}
    </div>
  )
}

type TripSearchBarSectionProps = {
  children: ReactNode
  className?: string
}

export function TripSearchBarSection({ children, className = '' }: TripSearchBarSectionProps) {
  return (
    <div
      className={`relative flex min-h-[64px] min-w-0 flex-1 items-center overflow-visible border-b border-slate-300 px-5 py-4 lg:border-b-0 lg:border-r lg:last:border-r-0 ${className}`}
    >
      {children}
    </div>
  )
}

export function TripSearchBarAction({ children }: { children: ReactNode }) {
  return <div className="flex shrink-0 items-stretch p-2.5 lg:min-w-[168px] xl:min-w-[180px]">{children}</div>
}
