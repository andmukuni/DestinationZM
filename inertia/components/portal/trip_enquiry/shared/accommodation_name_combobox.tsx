import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { HotelIcon } from '~/components/icons'
import { fieldName } from './field_bridge'

type AccommodationKind = 'hotel' | 'lodge' | 'apartment'

const KIND_LABELS: Record<AccommodationKind, string> = {
  hotel: 'Hotel',
  lodge: 'Lodge',
  apartment: 'Apartment',
}

export type AccommodationOption = {
  id: number
  name: string
  kind: AccommodationKind
  city: string
  region: string | null
  country: string
  starRating: number | null
}

type AccommodationNameComboboxProps = {
  fieldKey: string
  location: string
  starRating: string
  value: string
  onChange: (next: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  variant?: 'inline' | 'boxed'
  className?: string
}

function parseStarFilter(starRating: string): number | null {
  const match = starRating.match(/^(\d)\s*star$/i)
  return match ? Number(match[1]) : null
}

function formatAccommodationMeta(option: AccommodationOption) {
  const parts: string[] = []
  if (option.starRating) {
    parts.push(`${option.starRating} star`)
  }
  parts.push(KIND_LABELS[option.kind])
  parts.push([option.city, option.region, option.country].filter(Boolean).join(', '))
  return parts.join(' · ')
}

export default function AccommodationNameCombobox({
  fieldKey,
  location,
  starRating,
  value,
  onChange,
  label,
  placeholder,
  disabled = false,
  variant = 'boxed',
  className,
}: AccommodationNameComboboxProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const [options, setOptions] = useState<AccommodationOption[]>([])
  const [loading, setLoading] = useState(false)

  const locationReady = location.trim().length > 0
  const isDisabled = disabled || !locationReady

  useEffect(() => {
    if (!locationReady) {
      setOptions([])
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          location,
          q: value,
          limit: '20',
        })
        const stars = parseStarFilter(starRating)
        if (stars) {
          params.set('stars', String(stars))
        }

        const response = await fetch(`/portal/locations/accommodations?${params.toString()}`, {
          signal: controller.signal,
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        })
        if (!response.ok) {
          throw new Error('Accommodation search failed')
        }
        const payload = (await response.json()) as { accommodations?: AccommodationOption[] }
        setOptions(payload.accommodations ?? [])
      } catch (error) {
        if (controller.signal.aborted) return
        setOptions([])
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }, 220)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [location, starRating, value, locationReady])

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

  useEffect(() => {
    if (highlight >= options.length) {
      setHighlight(0)
    }
  }, [options.length, highlight])

  function commit(next: string) {
    onChange(next)
    setOpen(false)
    inputRef.current?.blur()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (isDisabled) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setHighlight((current) => (options.length ? (current + 1) % options.length : 0))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setHighlight((current) => (options.length ? (current - 1 + options.length) % options.length : 0))
      return
    }
    if (event.key === 'Enter') {
      if (open && options[highlight]) {
        event.preventDefault()
        commit(options[highlight].name)
      }
      return
    }
    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const inputClass =
    variant === 'inline'
      ? 'mt-0.5 w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400'
      : 'mt-1 w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400'

  const showDropdown = open && !isDisabled && (options.length > 0 || loading)

  function focusInput() {
    inputRef.current?.focus()
    setOpen(true)
  }

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`}>
      <div
        className={`${variant === 'inline' ? 'flex min-w-0 flex-1 items-center gap-3' : ''} ${
          isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-text'
        }`}
        onClick={() => {
          if (!isDisabled) focusInput()
        }}
      >
        {variant === 'inline' ? (
          <HotelIcon className="h-5 w-5 shrink-0 text-slate-400" />
        ) : null}
        <div className="min-w-0 flex-1">
          {label ? <span className="block text-xs text-slate-500">{label}</span> : null}
          <input
            ref={inputRef}
            name={fieldName(fieldKey)}
            type="text"
            value={value}
            placeholder={
              locationReady
                ? (placeholder ?? 'Select or type accommodation')
                : 'Choose a location first'
            }
            disabled={isDisabled}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open ? 'true' : 'false'}
            aria-controls={listboxId}
            aria-activedescendant={
              open && options[highlight] ? `${listboxId}-option-${highlight}` : undefined
            }
            onChange={(event) => {
              onChange(event.target.value)
              setOpen(true)
              setHighlight(0)
            }}
            onFocus={() => {
              if (!isDisabled) setOpen(true)
            }}
            onKeyDown={handleKeyDown}
            className={inputClass}
          />
        </div>
      </div>

      {showDropdown ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-full min-w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl md:w-[420px]">
          <div className="border-b border-slate-100 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            {loading ? 'Searching…' : value.trim() ? 'Matching stays' : `Stays in ${location}`}
          </div>
          {options.length ? (
            <ul id={listboxId} role="listbox" className="max-h-72 overflow-y-auto py-1">
              {options.map((option, index) => {
                const active = index === highlight
                return (
                  <li
                    key={option.id}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={active ? 'true' : 'false'}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      commit(option.name)
                    }}
                    onMouseEnter={() => setHighlight(index)}
                    className={`flex cursor-pointer items-start gap-3 px-4 py-2.5 text-sm ${
                      active ? 'bg-slate-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <HotelIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-slate-900">{option.name}</div>
                      <div className="truncate text-xs text-slate-500">{formatAccommodationMeta(option)}</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
