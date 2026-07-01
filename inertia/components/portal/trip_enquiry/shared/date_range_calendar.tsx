import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '~/components/icons'
import { formatNightsLabel, formatTripDate, nightsBetween } from './field_bridge'

type DateRangeCalendarProps = {
  startValue: string
  endValue: string
  onChange: (next: { start: string; end: string }) => void
  minDate?: string
  showEnd?: boolean
  startLabel?: string
  endLabel?: string
  children: (args: {
    open: boolean
    toggle: () => void
    summary: string
    nightsLabel: string | null
  }) => React.ReactNode
}

function isoFromDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseIso(value: string): Date | null {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1)
}

function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isBefore(a: Date, b: Date) {
  return a.getTime() < b.getTime()
}

function isWithinRange(date: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false
  const t = date.getTime()
  return t > start.getTime() && t < end.getTime()
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function MonthGrid({
  month,
  start,
  end,
  hover,
  onSelect,
  onHover,
  minDate,
}: {
  month: Date
  start: Date | null
  end: Date | null
  hover: Date | null
  onSelect: (date: Date) => void
  onHover: (date: Date | null) => void
  minDate?: Date | null
}) {
  const firstDay = startOfMonth(month)
  const lastDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const leadingBlanks = firstDay.getDay()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const hoverRange = !end ? hover : null

  return (
    <div className="min-w-[260px]">
      <div className="mb-3 text-center text-sm font-semibold text-slate-900">
        {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-slate-400">
        {WEEKDAY_LABELS.map((label, index) => (
          <div key={`${label}-${index}`} className="py-1">
            {label}
          </div>
        ))}
        {Array.from({ length: leadingBlanks }, (_, index) => (
          <div key={`blank-${index}`} />
        ))}
        {Array.from({ length: lastDate }, (_, index) => {
          const day = index + 1
          const date = new Date(month.getFullYear(), month.getMonth(), day)
          const disabled = minDate ? isBefore(date, minDate) : false
          const isStart = isSameDay(date, start)
          const isEnd = isSameDay(date, end)
          const inSelected = isWithinRange(date, start, end)
          const inHover =
            !!start && !end && hoverRange && !isBefore(hoverRange, start) && isWithinRange(date, start, hoverRange)
          const isHoverEnd = !!start && !end && hoverRange && isSameDay(date, hoverRange) && !isBefore(hoverRange, start)
          const isPivot = isStart || isEnd || isHoverEnd
          const inRange = inSelected || inHover
          const isToday = isSameDay(date, today)

          let bgClass = ''
          if (isPivot) {
            bgClass = 'bg-[#2563eb] text-white font-semibold'
          } else if (inRange) {
            bgClass = 'bg-blue-100 text-slate-900'
          } else if (disabled) {
            bgClass = 'text-slate-300 cursor-not-allowed'
          } else {
            bgClass = 'text-slate-700 hover:bg-slate-100'
          }

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelect(date)}
              onMouseEnter={() => !disabled && onHover(date)}
              onMouseLeave={() => onHover(null)}
              className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${bgClass}`}
            >
              <span>{day}</span>
              {isToday && !isPivot ? (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#2563eb]" />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function DateRangeCalendar({
  startValue,
  endValue,
  onChange,
  minDate,
  showEnd = true,
  startLabel = 'Check-in',
  endLabel = 'Check-out',
  children,
}: DateRangeCalendarProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState<Date | null>(null)

  const startDate = useMemo(() => parseIso(startValue), [startValue])
  const endDate = useMemo(() => parseIso(endValue), [endValue])
  const minDateObj = useMemo(() => parseIso(minDate ?? ''), [minDate])

  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const seed = startDate ?? new Date()
    return startOfMonth(seed)
  })

  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  function handleSelect(date: Date) {
    if (!showEnd) {
      onChange({ start: isoFromDate(date), end: '' })
      setOpen(false)
      return
    }
    if (!startDate || (startDate && endDate)) {
      onChange({ start: isoFromDate(date), end: '' })
      return
    }
    if (isBefore(date, startDate)) {
      onChange({ start: isoFromDate(date), end: '' })
      return
    }
    onChange({ start: startValue, end: isoFromDate(date) })
  }

  function clear() {
    onChange({ start: '', end: '' })
  }

  const nights = showEnd ? nightsBetween(startValue, endValue) : null
  const nightsLabel = formatNightsLabel(nights)
  const summary =
    startValue && (endValue || !showEnd)
      ? showEnd
        ? `${formatTripDate(startValue)} – ${formatTripDate(endValue)}`
        : formatTripDate(startValue)
      : 'Select dates'

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      {children({ open, toggle: () => setOpen((current) => !current), summary, nightsLabel })}

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 min-w-[320px] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl md:left-auto md:right-auto md:w-[640px]">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth((current) => addMonths(current, -1))}
              aria-label="Previous month"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {showEnd ? `${startLabel} → ${endLabel}` : startLabel}
            </div>
            <button
              type="button"
              onClick={() => setViewMonth((current) => addMonths(current, 1))}
              aria-label="Next month"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:gap-8">
            <MonthGrid
              month={viewMonth}
              start={startDate}
              end={endDate}
              hover={hover}
              onSelect={handleSelect}
              onHover={setHover}
              minDate={minDateObj}
            />
            <div className="hidden md:block">
              <MonthGrid
                month={addMonths(viewMonth, 1)}
                start={startDate}
                end={endDate}
                hover={hover}
                onSelect={handleSelect}
                onHover={setHover}
                minDate={minDateObj}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <div className="text-sm text-slate-600">
              {startValue ? (
                <span className="font-medium text-slate-900">{summary}</span>
              ) : (
                'Choose a start date to begin'
              )}
              {nightsLabel ? (
                <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {nightsLabel}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clear}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
