import { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon } from '~/components/icons'

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2)
  const minutes = index % 2 === 0 ? '00' : '30'
  return `${String(hours).padStart(2, '0')}:${minutes}`
})

const QUICK_PICKS = [
  { label: 'Early', value: '06:00' },
  { label: 'Morning', value: '09:00' },
  { label: 'Noon', value: '12:00' },
  { label: 'Afternoon', value: '15:00' },
  { label: 'Evening', value: '18:00' },
  { label: 'Night', value: '21:00' },
]

function periodLabel(time: string) {
  const hour = Number(time.split(':')[0])
  if (hour < 6) return 'Early morning'
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  if (hour < 21) return 'Evening'
  return 'Night'
}

type TimeSelectProps = {
  value: string
  onChange: (value: string) => void
  name: string
  label?: string
  className?: string
}

export default function TimeSelect({ value, onChange, name, label = 'Time', className = '' }: TimeSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    const selected = listRef.current?.querySelector<HTMLButtonElement>(`[data-time="${value}"]`)
    if (selected) selected.scrollIntoView({ block: 'center' })
  }, [open, value])

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-900 hover:border-slate-400"
      >
        <span>{value}</span>
        <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-[240px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            {label} · {periodLabel(value)}
          </div>

          <div className="flex flex-wrap gap-1.5 px-3 py-3 border-b border-slate-100">
            {QUICK_PICKS.map((pick) => (
              <button
                key={pick.value}
                type="button"
                onClick={() => {
                  onChange(pick.value)
                }}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  value === pick.value
                    ? 'border-[#2563eb] bg-[#2563eb] text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {pick.label}
              </button>
            ))}
          </div>

          <div ref={listRef} className="max-h-60 overflow-y-auto py-1">
            {TIME_OPTIONS.map((time) => {
              const selected = time === value
              return (
                <button
                  key={time}
                  type="button"
                  data-time={time}
                  onClick={() => {
                    onChange(time)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2 text-sm transition ${
                    selected ? 'bg-[#2563eb] text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-semibold">{time}</span>
                  <span className={`text-xs ${selected ? 'text-white/80' : 'text-slate-400'}`}>
                    {periodLabel(time)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function defaultTimeValue() {
  return '10:00'
}
