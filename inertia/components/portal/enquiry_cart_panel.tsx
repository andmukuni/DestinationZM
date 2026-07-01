import { Form, Link } from '@adonisjs/inertia/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TrashIcon } from '~/components/icons'
import { Button } from '~/components/ui/button'
import { TR } from '~/components/ui/table'
import EnquiryCartBudgetCell from '~/components/portal/enquiry_cart_budget_cell'

export type EnquiryCartItem = {
  id: string
  typeName: string
  tabLabel: string
  destination: string
  departDate: string
  returnDate: string | null
  pax: number
  estimatedBudget: number
  travelerNames?: string | null
  summaryLines: Array<{ label: string; value: string }>
}

type PinnedLayout = {
  formBottom: number
  mainLeft: number
  mainWidth: number
  mainTop: number
  headerStickTop: number
}

function formatDisplayDate(iso: string) {
  if (!iso) return '—'
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateRange(start: string, end: string | null) {
  if (!start) return '—'
  if (!end) return formatDisplayDate(start)
  return `${formatDisplayDate(start)} – ${formatDisplayDate(end)}`
}

function formatTravelerNames(value: string | null | undefined) {
  if (!value?.trim()) {
    return null
  }

  return value
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
}

function serviceSummaryLines(item: EnquiryCartItem) {
  return item.summaryLines.filter((line) => line.label !== 'Traveler names')
}

function CartTableColGroup() {
  return (
    <colgroup>
      <col style={{ width: 120 }} />
      <col />
      <col style={{ width: 168 }} />
      <col style={{ width: 96 }} />
      <col style={{ width: 168 }} />
      <col style={{ width: 132 }} />
      <col style={{ width: 64 }} />
    </colgroup>
  )
}

const cartTableClassName = 'min-w-[860px] w-full border-collapse table-fixed text-sm'

const cartThClass =
  'border-b border-slate-400 bg-slate-300 px-4 py-2.5 text-left align-middle text-xs font-semibold uppercase tracking-wide text-slate-800'

const cartTdClass = 'border-b border-slate-100 px-4 py-3.5 align-middle text-slate-800'

function CartTableHeaderRow() {
  return (
    <tr>
      <th scope="col" className={cartThClass}>
        Type
      </th>
      <th scope="col" className={cartThClass}>
        Service
      </th>
      <th scope="col" className={cartThClass}>
        When
      </th>
      <th scope="col" className={cartThClass}>
        Travellers
      </th>
      <th scope="col" className={cartThClass}>
        Traveller names
      </th>
      <th scope="col" title="Click to add an optional budget estimate" className={cartThClass}>
        Budget
      </th>
      <th scope="col" className={`${cartThClass} text-center`}>
        <span className="sr-only">Actions</span>
        <TrashIcon className="mx-auto h-3.5 w-3.5 text-slate-600" aria-hidden />
      </th>
    </tr>
  )
}

type EnquiryCartPanelProps = {
  items: EnquiryCartItem[]
  defaultBranchId: number
  organizationName: string
  pinnedLayout?: PinnedLayout | null
}

export default function EnquiryCartPanel({
  items,
  defaultBranchId,
  organizationName,
  pinnedLayout = null,
}: EnquiryCartPanelProps) {
  const seenIdsRef = useRef<Set<string>>(new Set(items.map((item) => item.id)))
  const scrollRef = useRef<HTMLDivElement>(null)
  const theadRef = useRef<HTMLTableSectionElement>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [showPinnedHeader, setShowPinnedHeader] = useState(false)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [tableBounds, setTableBounds] = useState({ left: 0, width: 0 })

  const syncTableBounds = useCallback(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return
    const rect = scrollEl.getBoundingClientRect()
    setTableBounds({ left: rect.left, width: rect.width })
  }, [])

  useEffect(() => {
    const seen = seenIdsRef.current
    const newItem = items.find((item) => !seen.has(item.id))
    if (newItem) {
      setHighlightId(newItem.id)
      const timer = window.setTimeout(() => setHighlightId(null), 1800)
      seenIdsRef.current = new Set(items.map((item) => item.id))
      return () => window.clearTimeout(timer)
    }
    seenIdsRef.current = new Set(items.map((item) => item.id))
  }, [items])

  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    const onScroll = () => {
      setScrollLeft(scrollEl.scrollLeft)
      syncTableBounds()
    }
    onScroll()
    scrollEl.addEventListener('scroll', onScroll, { passive: true })

    const main = scrollEl.closest('main')
    main?.addEventListener('scroll', syncTableBounds, { passive: true })
    window.addEventListener('resize', syncTableBounds)

    return () => {
      scrollEl.removeEventListener('scroll', onScroll)
      main?.removeEventListener('scroll', syncTableBounds)
      window.removeEventListener('resize', syncTableBounds)
    }
  }, [items.length, syncTableBounds])

  useEffect(() => {
    if (showPinnedHeader) {
      syncTableBounds()
    }
  }, [showPinnedHeader, pinnedLayout, syncTableBounds])

  useEffect(() => {
    const thead = theadRef.current
    if (!pinnedLayout || !thead) {
      setShowPinnedHeader(false)
      return
    }

    const main = thead.closest('main')
    if (!main) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowPinnedHeader(!entry.isIntersecting)
      },
      {
        root: main,
        rootMargin: `-${pinnedLayout.headerStickTop}px 0px 0px 0px`,
        threshold: 0,
      }
    )

    observer.observe(thead)
    return () => observer.disconnect()
  }, [pinnedLayout, items.length])

  if (!items.length) {
    return (
      <div className="mx-4 mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center md:mx-6">
        <p className="text-sm font-medium text-slate-700">Your enquiry is empty</p>
        <p className="mt-1 text-sm text-slate-500">
          Choose a service above, fill in the details, and click <strong>Add to enquiry</strong>. Add as many
          services as you need, then submit once below.
        </p>
      </div>
    )
  }

  const fixedHeaderTop = pinnedLayout ? pinnedLayout.mainTop + pinnedLayout.headerStickTop : 0

  return (
    <div className="mx-4 mt-4 min-w-0 space-y-4 md:mx-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Your enquiry</h2>
          <p className="text-sm text-slate-600">
            {items.length} service{items.length === 1 ? '' : 's'} — all will be submitted as one enquiry
          </p>
        </div>
        <Link route="portal.bookings.index" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          View existing bookings
        </Link>
      </div>

      {showPinnedHeader && pinnedLayout ? (
        <div
          className="pointer-events-none fixed z-30 overflow-hidden bg-slate-300 shadow-[0_1px_0_0_rgb(148_163_184)] md:rounded-t-lg"
          style={{
            top: fixedHeaderTop,
            left: tableBounds.left,
            width: tableBounds.width,
          }}
          aria-hidden
        >
          <div style={{ transform: `translateX(-${scrollLeft}px)` }}>
            <table className={cartTableClassName}>
              <CartTableColGroup />
              <thead className="bg-slate-300">
                <CartTableHeaderRow />
              </thead>
            </table>
          </div>
        </div>
      ) : null}

      <div ref={scrollRef} className="overflow-x-auto overflow-y-visible md:rounded-lg md:border md:border-slate-200">
        <table className={cartTableClassName}>
          <CartTableColGroup />
          <thead ref={theadRef} className="bg-slate-300">
            <CartTableHeaderRow />
          </thead>
          <tbody className="bg-white">
            {items.map((item) => {
              const isHighlighted = highlightId === item.id
              return (
                <TR
                  key={item.id}
                  className={`align-middle transition-colors duration-700 ${
                    isHighlighted ? 'bg-orange-50' : ''
                  }`}
                >
                  <td className={cartTdClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {item.tabLabel}
                      </span>
                      {isHighlighted ? (
                        <span className="rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          New
                        </span>
                      ) : null}
                    </span>
                  </td>
                  <td className={cartTdClass}>
                    <div className="font-semibold text-slate-900">{item.destination}</div>
                    {serviceSummaryLines(item).length ? (
                      <div className="mt-1 text-xs leading-relaxed text-slate-500">
                        {serviceSummaryLines(item)
                          .slice(0, 4)
                          .map((line) => `${line.label}: ${line.value}`)
                          .join(' · ')}
                      </div>
                    ) : null}
                  </td>
                  <td className={`${cartTdClass} text-slate-700`}>{formatDateRange(item.departDate, item.returnDate)}</td>
                  <td className={`${cartTdClass} text-slate-700`}>
                    {item.pax} {item.pax === 1 ? 'person' : 'people'}
                  </td>
                  <td className={`${cartTdClass} text-slate-700`}>
                    {formatTravelerNames(item.travelerNames)?.length ? (
                      <ul className="space-y-1">
                        {formatTravelerNames(item.travelerNames)!.map((name, index) => (
                          <li key={`${item.id}-traveler-${index}`} className="text-sm text-slate-700">
                            {name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                  <td className={`${cartTdClass} text-slate-700`}>
                    <EnquiryCartBudgetCell item={item} />
                  </td>
                  <td className={`${cartTdClass} text-center`}>
                    <Form route="portal.bookings.cart.remove" routeParams={{ itemId: item.id }}>
                      <button
                        type="submit"
                        title={`Remove ${item.tabLabel}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                        aria-label={`Remove ${item.tabLabel}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </Form>
                  </td>
                </TR>
              )
            })}
          </tbody>
        </table>
      </div>

      <Form route="portal.bookings.submit" className="rounded-xl border border-orange-200 bg-orange-50 p-4">
        <input type="hidden" name="branchId" value={defaultBranchId} />
        <input type="hidden" name="currency" value="ZMW" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-orange-950">Ready to submit?</p>
            <p className="mt-1 text-sm text-orange-950/80">
              All {items.length} service{items.length === 1 ? '' : 's'} below will be sent as{' '}
              <strong>one enquiry</strong> for {organizationName}. We will prepare a single quotation.
            </p>
          </div>
          <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
            Submit enquiry{items.length > 1 ? ` (${items.length} items)` : ''}
          </Button>
        </div>
      </Form>
    </div>
  )
}
