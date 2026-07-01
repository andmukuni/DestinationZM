import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { CheckCircleIcon, XMarkIcon } from '~/components/icons'
import { Button } from '~/components/ui/button'

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export type MonthRangeValue = {
  from: string
  to: string
}

type PickerMode = 'single' | 'range'

type MonthPickerProps = {
  label?: string
  monthFromName?: string
  monthToName?: string
  value: MonthRangeValue
  availableMonths?: string[]
  onChange: (value: MonthRangeValue) => void
}

function parseMonth(value: string) {
  const [year, month] = value.split('-').map(Number)
  return { year: year || new Date().getFullYear(), month: month || new Date().getMonth() + 1 }
}

function toMonthValue(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

function monthIndex(value: string) {
  const { year, month } = parseMonth(value)
  return year * 12 + month
}

function normalizeRange(from: string, to: string): MonthRangeValue {
  return monthIndex(from) <= monthIndex(to) ? { from, to } : { from: to, to: from }
}

function isSingleMonth(value: MonthRangeValue) {
  return value.from === value.to
}

export function formatMonthDisplay(value: string) {
  const { year, month } = parseMonth(value)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('en-ZM', { month: 'long', year: 'numeric' })
}

export function formatMonthRangeDisplay(value: MonthRangeValue) {
  const range = normalizeRange(value.from, value.to)
  if (isSingleMonth(range)) return formatMonthDisplay(range.from)

  const fromParsed = parseMonth(range.from)
  const toParsed = parseMonth(range.to)

  if (fromParsed.year === toParsed.year) {
    const fromShort = new Date(fromParsed.year, fromParsed.month - 1, 1).toLocaleDateString('en-ZM', {
      month: 'short',
    })
    const toShort = formatMonthDisplay(range.to)
    return `${fromShort} – ${toShort}`
  }

  return `${formatMonthDisplay(range.from)} – ${formatMonthDisplay(range.to)}`
}

function rangeHint(mode: PickerMode, draft: MonthRangeValue, rangeStart: string | null) {
  if (mode === 'single') return 'Select a month, then submit.'
  if (!rangeStart) return 'Choose the start month.'
  if (rangeStart && draft.from === draft.to) return 'Now choose the end month.'
  return 'Range selected. Submit or adjust.'
}

export function MonthPicker({
  label,
  monthFromName,
  monthToName,
  value,
  availableMonths = [],
  onChange,
}: MonthPickerProps) {
  const fieldId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<PickerMode>(() => (isSingleMonth(value) ? 'single' : 'range'))
  const [viewYear, setViewYear] = useState(() => parseMonth(value.from).year)
  const [draft, setDraft] = useState<MonthRangeValue>(() => normalizeRange(value.from, value.to))
  const [rangeStart, setRangeStart] = useState<string | null>(null)

  const availableSet = new Set(availableMonths)
  const normalizedDraft = normalizeRange(draft.from, draft.to)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        closePicker(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closePicker(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, value])

  function closePicker(keepDraft: boolean) {
    setOpen(false)
    if (!keepDraft) {
      setDraft(normalizeRange(value.from, value.to))
      setMode(isSingleMonth(value) ? 'single' : 'range')
      setRangeStart(null)
    }
  }

  function openPicker() {
    const normalized = normalizeRange(value.from, value.to)
    setViewYear(parseMonth(normalized.from).year)
    setDraft(normalized)
    setMode(isSingleMonth(normalized) ? 'single' : 'range')
    setRangeStart(null)
    setOpen(true)
  }

  function switchMode(nextMode: PickerMode) {
    setMode(nextMode)
    setRangeStart(null)
    if (nextMode === 'single') {
      setDraft({ from: draft.from, to: draft.from })
    }
  }

  function selectMonth(monthValue: string) {
    if (mode === 'single') {
      setDraft({ from: monthValue, to: monthValue })
      return
    }

    if (!rangeStart) {
      setRangeStart(monthValue)
      setDraft({ from: monthValue, to: monthValue })
      return
    }

    setDraft(normalizeRange(rangeStart, monthValue))
    setRangeStart(null)
  }

  function submitDate() {
    const next = mode === 'single' ? { from: draft.from, to: draft.from } : normalizeRange(draft.from, draft.to)
    onChange(next)
    setOpen(false)
    setRangeStart(null)
  }

  function monthState(monthValue: string) {
    const range = normalizedDraft
    const index = monthIndex(monthValue)
    const fromIndex = monthIndex(range.from)
    const toIndex = monthIndex(range.to)
    const inRange = mode === 'range' && index >= fromIndex && index <= toIndex
    const isStart = monthValue === range.from
    const isEnd = monthValue === range.to
    const isSingleSelection = mode === 'single' && isStart && isEnd
    const isAnchor = mode === 'range' && rangeStart === monthValue

    return { inRange, isStart, isEnd, isSingleSelection, isAnchor }
  }

  const canSubmit =
    mode === 'single'
      ? Boolean(draft.from)
      : Boolean(draft.from && draft.to && !rangeStart && !isSingleMonth(normalizedDraft))

  return (
    <div ref={rootRef} className="relative space-y-1.5">
      {label ? (
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}
      {monthFromName ? <input type="hidden" name={monthFromName} value={value.from} /> : null}
      {monthToName ? <input type="hidden" name={monthToName} value={value.to} /> : null}

      <button
        id={fieldId}
        type="button"
        onClick={openPicker}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-slate-300 bg-white px-3 text-left text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
      >
        <span className="truncate">{formatMonthRangeDisplay(value)}</span>
        <CalendarIcon />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Choose month"
          className="absolute left-0 top-full z-30 mt-2 w-full min-w-[300px] overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
            <div className="mb-3 flex rounded-lg border border-slate-200 bg-white p-1">
              <ModeButton active={mode === 'single'} onClick={() => switchMode('single')}>
                Single month
              </ModeButton>
              <ModeButton active={mode === 'range'} onClick={() => switchMode('range')}>
                Range
              </ModeButton>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous year"
                onClick={() => setViewYear((year) => year - 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-slate-900"
              >
                <ChevronLeftIcon />
              </button>
              <p className="text-sm font-semibold text-slate-900">{viewYear}</p>
              <button
                type="button"
                aria-label="Next year"
                onClick={() => setViewYear((year) => year + 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-slate-900"
              >
                <ChevronRightIcon />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">{rangeHint(mode, normalizedDraft, rangeStart)}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 p-4">
            {MONTHS.map((monthLabel, index) => {
              const monthNumber = index + 1
              const monthValue = toMonthValue(viewYear, monthNumber)
              const { inRange, isStart, isEnd, isSingleSelection, isAnchor } = monthState(monthValue)
              const hasData = availableSet.has(monthValue)
              const isEndpoint = isStart || isEnd || isSingleSelection || isAnchor

              return (
                <button
                  key={monthValue}
                  type="button"
                  onClick={() => selectMonth(monthValue)}
                  className={`relative rounded-lg px-2 py-3 text-sm font-medium transition ${
                    isEndpoint
                      ? 'bg-slate-900 text-white'
                      : inRange
                        ? 'bg-slate-200 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {monthLabel}
                  {hasData && !isEndpoint && !inRange ? (
                    <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-orange-500" />
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3">
            <p className="min-w-0 truncate text-xs text-slate-500">
              {mode === 'single'
                ? formatMonthDisplay(draft.from)
                : rangeStart
                  ? `${formatMonthDisplay(rangeStart)} → …`
                  : formatMonthRangeDisplay(normalizedDraft)}
            </p>
            <div className="flex shrink-0 gap-2">
              {mode === 'range' && (rangeStart || !isSingleMonth(normalizedDraft)) ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setRangeStart(null)
                    setDraft({ from: draft.from, to: draft.from })
                  }}
                >
                  <XMarkIcon />
                  Clear
                </Button>
              ) : null}
              <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={() => closePicker(false)}>
                <XMarkIcon />
                Cancel
              </Button>
              <Button type="button" size="sm" className="gap-2" onClick={submitDate} disabled={!canSubmit}>
                <CheckCircleIcon />
                Submit date
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
        active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5 shrink-0 text-slate-500"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path
        fillRule="evenodd"
        d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path
        fillRule="evenodd"
        d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  )
}
