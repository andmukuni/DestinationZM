import type { ReactNode } from 'react'
import {
  AttractionIcon,
  CarIcon,
  FlightHotelIcon,
  HotelIcon,
  PlaneIcon,
  TrainIcon,
} from '~/components/icons'

export type TripCategoryTab = {
  slug: string
  tabLabel: string
  iconKey: string | null
}

const iconMap = {
  hotel: HotelIcon,
  plane: PlaneIcon,
  train: TrainIcon,
  car: CarIcon,
  attraction: AttractionIcon,
  flight_hotel: FlightHotelIcon,
} as const

type TripCategoryTabsProps = {
  tabs: TripCategoryTab[]
  activeSlug: string
  onChange: (slug: string) => void
}

export default function TripCategoryTabs({ tabs, activeSlug, onChange }: TripCategoryTabsProps) {
  return (
    <div
      className="inline-flex max-w-full gap-1 overflow-x-auto overscroll-x-contain rounded-full bg-[#0f172a] p-1.5 shadow-lg"
      role="tablist"
    >
      {tabs.map((tab) => {
        const Icon = iconMap[(tab.iconKey ?? 'plane') as keyof typeof iconMap] ?? PlaneIcon
        const active = tab.slug === activeSlug
        return (
          <button
            key={tab.slug}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.slug)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition ${
              active
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className={`h-4 w-4 ${active ? 'text-slate-900' : 'text-white'}`} />
            <span className="whitespace-nowrap">{tab.tabLabel}</span>
          </button>
        )
      })}
    </div>
  )
}

type TripSearchShellProps = {
  tabs: ReactNode
  children: ReactNode
  footer?: ReactNode
  stuck?: boolean
}

export function TripSearchShell({ tabs, children, footer, stuck = false }: TripSearchShellProps) {
  return (
    <div
      className={`relative z-30 px-2 md:px-4 ${stuck ? 'pt-3' : '-mt-12 md:-mt-14'}`}
    >
      <div className="mx-auto w-full min-w-0 max-w-6xl">
        <div className={`relative z-40 flex justify-center ${stuck ? 'mb-2.5' : 'mb-0'}`}>{tabs}</div>
        <div
          className={`relative z-20 overflow-visible border border-slate-200/90 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.12)] ${
            stuck ? 'rounded-xl' : '-mt-6 rounded-2xl md:-mt-7'
          }`}
        >
          <div
            className={
              stuck
                ? 'relative z-10 px-4 pb-4 pt-4 md:px-6 md:pb-5'
                : 'relative z-10 px-4 pb-4 pt-10 md:px-6 md:pb-5 md:pt-11'
            }
          >
            {children}
          </div>
          {footer ? (
            <div className="relative z-0 border-t border-slate-200 bg-slate-50 px-4 py-3.5 md:px-6">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function TripSearchPanel({ children }: { children: ReactNode }) {
  return <>{children}</>
}
