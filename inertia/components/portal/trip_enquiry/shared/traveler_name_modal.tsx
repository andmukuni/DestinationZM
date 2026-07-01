import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type TravelerNameModalProps = {
  open: boolean
  travelerNumber: number
  initialValue: string
  onSave: (name: string) => void
  onCancel: () => void
}

export default function TravelerNameModal({
  open,
  travelerNumber,
  initialValue,
  onSave,
  onCancel,
}: TravelerNameModalProps) {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setValue(initialValue)
      window.requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open, initialValue, travelerNumber])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open || typeof document === 'undefined') {
    return null
  }

  function submit() {
    const trimmed = value.trim()
    if (trimmed) {
      onSave(trimmed)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="traveler-name-title"
        className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
      >
        <h3 id="traveler-name-title" className="text-base font-semibold text-slate-900">
          Traveler {travelerNumber} name
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Enter the full name of the person travelling, as it should appear on the ticket.
        </p>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Full name"
          className="mt-4 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              submit()
            }
          }}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim()}
            className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
