import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { MapPinIcon } from '~/components/icons'
import {
  filterLocations,
  formatLocationMeta,
  type LocationKind,
  type LocationSuggestion,
} from '~/lib/portal_locations'
import { fieldName } from './field_bridge'

type LocationComboboxProps = {
  fieldKey: string
  value: string
  onChange: (next: string) => void
  kinds: LocationKind[]
  label?: string
  placeholder?: string
  required?: boolean
  variant?: 'inline' | 'boxed'
  className?: string
}

export default function LocationCombobox({
  fieldKey,
  value,
  onChange,
  kinds,
  label,
  placeholder,
  required,
  variant = 'boxed',
  className,
}: LocationComboboxProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)

  const suggestions = useMemo(() => filterLocations(value, kinds, 8), [value, kinds])

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
    if (highlight >= suggestions.length) {
      setHighlight(0)
    }
  }, [suggestions.length, highlight])

  function commit(next: string) {
    onChange(next)
    setOpen(false)
    inputRef.current?.blur()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setHighlight((current) =>
        suggestions.length ? (current + 1) % suggestions.length : 0
      )
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setHighlight((current) =>
        suggestions.length ? (current - 1 + suggestions.length) % suggestions.length : 0
      )
      return
    }
    if (event.key === 'Enter') {
      if (open && suggestions[highlight]) {
        event.preventDefault()
        commit(suggestions[highlight].value)
      }
      return
    }
    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const inputClass =
    variant === 'inline'
      ? 'mt-0.5 w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400'
      : 'mt-1 w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400'

  const wrapperClass = variant === 'inline' ? 'flex min-w-0 flex-1 items-center gap-3' : ''

  function focusInput() {
    inputRef.current?.focus()
    setOpen(true)
  }

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`}>
      <div className={`${wrapperClass} cursor-text`} onClick={focusInput}>
        {variant === 'inline' ? (
          <MapPinIcon className="h-5 w-5 shrink-0 text-slate-400" />
        ) : null}
        <div className="min-w-0 flex-1">
          {label ? <span className="block text-xs text-slate-500">{label}</span> : null}
          <input
            ref={inputRef}
            name={fieldName(fieldKey)}
            type="text"
            value={value}
            placeholder={placeholder}
            required={required}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open ? 'true' : 'false'}
            aria-controls={listboxId}
            aria-activedescendant={
              open && suggestions[highlight] ? `${listboxId}-option-${highlight}` : undefined
            }
            onChange={(event) => {
              onChange(event.target.value)
              setOpen(true)
              setHighlight(0)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            className={inputClass}
          />
        </div>
      </div>

      {open && suggestions.length ? (
        <div
          className="absolute left-0 top-[calc(100%+10px)] z-50 w-full min-w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl md:w-[420px]"
        >
          <div className="border-b border-slate-100 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            {value.trim() ? 'Matching destinations' : 'Popular destinations'}
          </div>
          <ul
            id={listboxId}
            role="listbox"
            className="max-h-72 overflow-y-auto py-1"
          >
            {suggestions.map((suggestion: LocationSuggestion, index: number) => {
              const active = index === highlight
              return (
                <li
                  key={`${suggestion.kind}-${suggestion.value}`}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={active ? 'true' : 'false'}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    commit(suggestion.value)
                  }}
                  onMouseEnter={() => setHighlight(index)}
                  className={`flex cursor-pointer items-start gap-3 px-4 py-2.5 text-sm ${
                    active ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-slate-900">{suggestion.value}</div>
                    <div className="truncate text-xs text-slate-500">{formatLocationMeta(suggestion)}</div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
