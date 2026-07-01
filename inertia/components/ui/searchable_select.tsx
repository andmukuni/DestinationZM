import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDownIcon } from '~/components/icons'

export type SearchableSelectOption = {
  value: string | number
  label: string
}

type SearchableSelectProps = {
  name: string
  label?: string
  placeholder?: string
  searchPlaceholder?: string
  options: SearchableSelectOption[]
  defaultValue?: string | number | null
  required?: boolean
  error?: string
  emptyMessage?: string
}

export function SearchableSelect({
  name,
  label,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  options,
  defaultValue = '',
  required,
  error,
  emptyMessage = 'No matches found',
}: SearchableSelectProps) {
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState(() => (defaultValue ? String(defaultValue) : ''))
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selectedOption = options.find((option) => String(option.value) === selected)
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(query.trim().toLowerCase())
  )

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    if (open) {
      searchRef.current?.focus()
    }
  }, [open])

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label ? (
        <label htmlFor={`${listboxId}-trigger`} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}

      <input type="hidden" name={name} value={selected} required={required} />

      <div className="relative">
        <button
          id={`${listboxId}-trigger`}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={`flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-left text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 ${
            error ? 'border-red-500' : 'border-slate-300'
          } ${selectedOption ? 'text-slate-900' : 'text-slate-500'}`}
        >
          <span className="truncate">{selectedOption?.label ?? placeholder}</span>
          <ChevronDownIcon className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
        </button>

        {open ? (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-200 p-2">
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <ul
              id={listboxId}
              role="listbox"
              className="max-h-60 overflow-y-auto py-1"
              aria-label={label ?? name}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const value = String(option.value)
                  const isSelected = value === selected

                  return (
                    <li key={value} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(value)
                          setOpen(false)
                          setQuery('')
                        }}
                        className={`flex w-full px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                          isSelected ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    </li>
                  )
                })
              ) : (
                <li className="px-3 py-2 text-sm text-slate-500">{emptyMessage}</li>
              )}
            </ul>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
