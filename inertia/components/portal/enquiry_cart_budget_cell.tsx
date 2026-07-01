import { Form } from '@adonisjs/inertia/react'
import { useEffect, useRef, useState } from 'react'
import { CheckCircleIcon, PencilIcon, XMarkIcon } from '~/components/icons'
import type { EnquiryCartItem } from '~/components/portal/enquiry_cart_panel'

type EnquiryCartBudgetCellProps = {
  item: EnquiryCartItem
}

export default function EnquiryCartBudgetCell({ item }: EnquiryCartBudgetCellProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(item.estimatedBudget > 0 ? String(item.estimatedBudget) : '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue(item.estimatedBudget > 0 ? String(item.estimatedBudget) : '')
  }, [item.estimatedBudget])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  if (editing) {
    return (
      <Form
        route="portal.bookings.cart.budget"
        routeParams={{ itemId: item.id }}
        transform={(data) => ({
          ...data,
          estimatedBudget: value,
        })}
        options={{ preserveScroll: true }}
        onSuccess={() => setEditing(false)}
        className="flex flex-wrap items-center gap-1.5"
      >
        {({ processing }) => (
          <>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                ZMW
              </span>
              <input
                ref={inputRef}
                name="estimatedBudget"
                type="number"
                min={0}
                step={1}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                className="h-8 w-[7.5rem] rounded-md border border-slate-300 bg-white pl-10 pr-2 text-sm text-slate-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
                aria-label={`Budget estimate for ${item.tabLabel}`}
              />
            </div>
            <button
              type="submit"
              disabled={processing}
              title="Save budget estimate"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-orange-600 text-white transition hover:bg-orange-700 disabled:opacity-60"
              aria-label="Save budget estimate"
            >
              <CheckCircleIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={processing}
              onClick={() => {
                setValue(item.estimatedBudget > 0 ? String(item.estimatedBudget) : '')
                setEditing(false)
              }}
              title="Cancel"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60"
              aria-label="Cancel editing budget estimate"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </>
        )}
      </Form>
    )
  }

  if (item.estimatedBudget > 0) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group inline-flex max-w-full items-center gap-1.5 rounded-md px-1 py-0.5 text-left text-slate-700 transition hover:bg-slate-100"
        title="Click to update budget estimate"
      >
        <span className="font-medium">ZMW {item.estimatedBudget.toLocaleString()}</span>
        <PencilIcon className="h-3.5 w-3.5 shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
        <span className="sr-only">Edit budget estimate</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="inline-flex w-full min-w-0 flex-col items-start gap-0.5 rounded-md border border-dashed border-slate-300 bg-slate-50 px-2.5 py-2 text-left transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700"
      title="Click to add an optional budget estimate for this service"
    >
      <span className="text-xs font-medium leading-tight text-slate-600">Add estimate</span>
      <span className="text-[10px] font-normal leading-tight text-slate-400">Optional</span>
    </button>
  )
}
