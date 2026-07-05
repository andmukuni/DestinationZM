import { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon, UserGroupIcon } from '~/components/icons'
import { fieldName } from './field_bridge'
import TravelerNameModal from './traveler_name_modal'

function ensureTravelerNames(names: string[], count: number) {
  const next = [...names]
  while (next.length < count) {
    next.push('')
  }
  return next.slice(0, count)
}

function firstMissingTravelerIndex(names: string[], count: number) {
  for (let index = 0; index < count; index += 1) {
    if (!names[index]?.trim()) {
      return index
    }
  }
  return -1
}

type RoomGuestPopoverProps = {
  rooms: number
  adults: number
  children: number
  onChange: (value: { rooms: number; adults: number; children: number }) => void
  variant?: 'boxed' | 'inline'
}

export default function RoomGuestPopover({
  rooms,
  adults,
  children,
  onChange,
  variant = 'boxed',
}: RoomGuestPopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

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

  const summary = `${rooms} room${rooms === 1 ? '' : 's'}, ${adults} adult${adults === 1 ? '' : 's'}, ${children} child${children === 1 ? '' : 'ren'}`
  const triggerClass =
    variant === 'inline'
      ? 'flex h-full min-h-[64px] w-full items-center gap-3 px-5 text-left transition hover:bg-slate-50'
      : 'flex h-full min-h-[72px] w-full items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 text-left transition hover:border-slate-300'

  function stepper(label: string, value: number, onUpdate: (next: number) => void, min = 0) {
    return (
      <div className="flex items-center justify-between gap-4 py-2">
        <span className="text-sm text-slate-700">{label}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onUpdate(Math.max(min, value - 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-semibold">{value}</span>
          <button
            type="button"
            onClick={() => onUpdate(value + 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            +
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <input type="hidden" name={fieldName('rooms')} value={rooms} />
      <input type="hidden" name={fieldName('adults')} value={adults} />
      <input type="hidden" name={fieldName('children')} value={children} />

      <button type="button" onClick={() => setOpen((current) => !current)} className={triggerClass}>
        <UserGroupIcon className="h-5 w-5 shrink-0 text-slate-400" />
        <span className="min-w-0 flex-1 text-sm font-semibold text-slate-900">{summary}</span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-[100] w-full min-w-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl md:w-[360px]">
          <div className="border-b border-slate-100 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            Rooms and guests
          </div>
          <div className="p-4">
            {stepper('Rooms', rooms, (next) => onChange({ rooms: next, adults, children }), 1)}
            {stepper('Adults', adults, (next) => onChange({ rooms, adults: next, children }), 1)}
            {stepper('Children', children, (next) => onChange({ rooms, adults, children: next }))}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

type PassengerClassPopoverProps = {
  passengers: number
  travelClass: string
  classOptions: string[]
  onChange: (value: { passengers: number; travelClass: string }) => void
  variant?: 'boxed' | 'inline'
  enableTravelerNames?: boolean
}

export function PassengerClassPopover({
  passengers,
  travelClass,
  classOptions,
  onChange,
  variant = 'boxed',
  enableTravelerNames = false,
}: PassengerClassPopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pendingCloseRef = useRef(false)
  const [open, setOpen] = useState(false)
  const [travelerNames, setTravelerNames] = useState<string[]>([''])
  const [namePromptIndex, setNamePromptIndex] = useState<number | null>(null)

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

  const classShort =
    travelClass === 'Premium economy' ? 'Premium' : travelClass === 'Business' ? 'Business' : travelClass
  const summary = `${passengers} · ${classShort}`
  const namedTravelers = enableTravelerNames
    ? ensureTravelerNames(travelerNames, passengers).filter((name) => name.trim())
    : []
  const triggerClass =
    variant === 'inline'
      ? 'flex h-full min-h-[64px] w-full items-center gap-3 px-5 text-left transition hover:bg-slate-50'
      : 'flex h-full min-h-[72px] w-full items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 text-left transition hover:border-slate-300'

  function openNamePrompt(index: number, closePopoverWhenComplete = false) {
    pendingCloseRef.current = closePopoverWhenComplete
    setNamePromptIndex(index)
  }

  function saveTravelerName(index: number, name: string) {
    const nextNames = ensureTravelerNames(travelerNames, passengers)
    nextNames[index] = name
    setTravelerNames(nextNames)
    setNamePromptIndex(null)

    if (!pendingCloseRef.current) {
      return
    }

    const missingIndex = firstMissingTravelerIndex(nextNames, passengers)
    if (missingIndex >= 0) {
      setNamePromptIndex(missingIndex)
      return
    }

    pendingCloseRef.current = false
    setOpen(false)
  }

  function handleDone() {
    if (!enableTravelerNames) {
      setOpen(false)
      return
    }

    const missingIndex = firstMissingTravelerIndex(ensureTravelerNames(travelerNames, passengers), passengers)
    if (missingIndex >= 0) {
      openNamePrompt(missingIndex, true)
      return
    }

    setOpen(false)
  }

  function handleAddPassenger() {
    const nextCount = passengers + 1
    setTravelerNames((current) => ensureTravelerNames(current, nextCount))
    onChange({ passengers: nextCount, travelClass })

    if (enableTravelerNames) {
      openNamePrompt(nextCount - 1, false)
    }
  }

  function handleRemovePassenger() {
    const nextCount = Math.max(1, passengers - 1)
    setTravelerNames((current) => ensureTravelerNames(current, nextCount))
    onChange({ passengers: nextCount, travelClass })
    if (namePromptIndex !== null && namePromptIndex >= nextCount) {
      setNamePromptIndex(null)
      pendingCloseRef.current = false
    }
  }

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <input type="hidden" name={fieldName('passengers')} value={passengers} />
      <input type="hidden" name={fieldName('travel_class')} value={travelClass} />
      {enableTravelerNames ? (
        <input
          type="hidden"
          name={fieldName('traveler_names')}
          value={ensureTravelerNames(travelerNames, passengers)
            .map((name) => name.trim())
            .filter(Boolean)
            .join(', ')}
        />
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={triggerClass}
      >
        <UserGroupIcon className="h-5 w-5 shrink-0 text-slate-400" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{summary}</span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-[100] w-full min-w-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl md:w-[360px]">
          <div className="border-b border-slate-100 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            Passengers and class
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between gap-4 py-2">
              <span className="text-sm text-slate-700">Adults</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRemovePassenger}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold">{passengers}</span>
                <button
                  type="button"
                  onClick={handleAddPassenger}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200"
                >
                  +
                </button>
              </div>
            </div>
            {enableTravelerNames ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const missingIndex = firstMissingTravelerIndex(
                      ensureTravelerNames(travelerNames, passengers),
                      passengers
                    )
                    openNamePrompt(missingIndex >= 0 ? missingIndex : 0, false)
                  }}
                  className="mt-1 w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:border-[#2563eb] hover:bg-blue-50 hover:text-[#1d4ed8]"
                >
                  Add names of the subjects travelling
                </button>
                {namedTravelers.length ? (
                  <ul className="mt-2 space-y-1 rounded-lg bg-slate-50 px-3 py-2">
                    {ensureTravelerNames(travelerNames, passengers).map((name, index) =>
                      name.trim() ? (
                        <li key={index} className="text-xs text-slate-600">
                          Traveler {index + 1}: {name.trim()}
                        </li>
                      ) : null
                    )}
                  </ul>
                ) : null}
              </>
            ) : null}
            <label className="mt-2 block text-sm text-slate-700">
              Class
              <select
                value={travelClass}
                onChange={(event) => onChange({ passengers, travelClass: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              >
                {classOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={handleDone}
              className="mt-3 w-full rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}

      {enableTravelerNames && namePromptIndex !== null ? (
        <TravelerNameModal
          open
          travelerNumber={namePromptIndex + 1}
          initialValue={ensureTravelerNames(travelerNames, passengers)[namePromptIndex] ?? ''}
          onSave={(name) => saveTravelerName(namePromptIndex, name)}
          onCancel={() => {
            setNamePromptIndex(null)
            pendingCloseRef.current = false
          }}
        />
      ) : null}
    </div>
  )
}

type TripDetailsPopoverProps = {
  rooms: number
  adults: number
  children: number
  travelClass: string
  classOptions: string[]
  onChange: (value: { rooms: number; adults: number; children: number; travelClass: string }) => void
}

export function TripDetailsPopover({
  rooms,
  adults,
  children,
  travelClass,
  classOptions,
  onChange,
}: TripDetailsPopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

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

  const summary = `${rooms} room, ${adults} adult${adults === 1 ? '' : 's'}, ${travelClass}`

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <input type="hidden" name={fieldName('rooms')} value={rooms} />
      <input type="hidden" name={fieldName('adults')} value={adults} />
      <input type="hidden" name={fieldName('children')} value={children} />
      <input type="hidden" name={fieldName('travel_class')} value={travelClass} />

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-full min-h-[72px] w-full flex-col justify-center rounded-xl border border-slate-300 px-4 py-3 text-left transition hover:border-slate-300"
      >
        <span className="text-xs text-slate-500">Trip details</span>
        <span className="truncate text-sm font-semibold text-slate-900">{summary}</span>
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-[100] w-full min-w-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl md:w-[360px]">
          <div className="border-b border-slate-100 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            Trip details
          </div>
          <div className="p-4">
            {[
              ['Rooms', rooms, 1],
              ['Adults', adults, 1],
              ['Children', children, 0],
            ].map(([label, value, min]) => (
              <div key={label as string} className="flex items-center justify-between gap-4 py-2">
                <span className="text-sm text-slate-700">{label as string}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        rooms: label === 'Rooms' ? Math.max(min as number, (value as number) - 1) : rooms,
                        adults: label === 'Adults' ? Math.max(min as number, (value as number) - 1) : adults,
                        children:
                          label === 'Children' ? Math.max(min as number, (value as number) - 1) : children,
                        travelClass,
                      })
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{value as number}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        rooms: label === 'Rooms' ? (value as number) + 1 : rooms,
                        adults: label === 'Adults' ? (value as number) + 1 : adults,
                        children: label === 'Children' ? (value as number) + 1 : children,
                        travelClass,
                      })
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            <label className="mt-2 block text-sm text-slate-700">
              Class
              <select
                value={travelClass}
                onChange={(event) => onChange({ rooms, adults, children, travelClass: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              >
                {classOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
