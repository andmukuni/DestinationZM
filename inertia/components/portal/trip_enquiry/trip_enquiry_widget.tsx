import { router, usePage } from '@inertiajs/react'
import { useCallback, useEffect, useRef, useState, type ComponentType, type FormEvent } from 'react'
import EnquiryCartPanel, { type EnquiryCartItem } from '~/components/portal/enquiry_cart_panel'
import { client } from '~/client'
import type { PortalBookingFieldDefinition } from '#types/portal_booking_type'
import AncillariesEnquiryForm from './forms/ancillaries_enquiry_form'
import CarsEnquiryForm from './forms/cars_enquiry_form'
import FlightsEnquiryForm from './forms/flights_enquiry_form'
import HotelsEnquiryForm from './forms/hotels_enquiry_form'
import TripCategoryTabs, { TripSearchPanel, TripSearchShell } from './trip_category_tabs'
import TripHero from './trip_hero'

export type BookingTypeOption = {
  id: number
  slug: string
  name: string
  tabLabel: string | null
  iconKey: string | null
  description: string | null
  sortOrder: number
  fields: PortalBookingFieldDefinition[]
}

type TripEnquiryWidgetProps = {
  bookingTypes: BookingTypeOption[]
  initialType: string | null
  defaultBranchId: number
  organizationName: string
  cartItems: EnquiryCartItem[]
}

const formBySlug: Record<
  string,
  ComponentType<{ fields: PortalBookingFieldDefinition[]; errors?: Record<string, string>; minDate?: string }>
> = {
  accommodation: HotelsEnquiryForm,
  flight: FlightsEnquiryForm,
  car_hire: CarsEnquiryForm,
  ancillaries: AncillariesEnquiryForm,
}

export default function TripEnquiryWidget({
  bookingTypes,
  initialType,
  defaultBranchId,
  organizationName,
  cartItems = [],
}: TripEnquiryWidgetProps) {
  const pageErrors = (usePage().props.errors ?? {}) as Record<string, string>
  const today = new Date().toISOString().slice(0, 10)
  const defaultTab = initialType ?? bookingTypes[0]?.slug ?? 'accommodation'
  const [activeTypeSlug, setActiveTypeSlug] = useState(defaultTab)
  const [formKey, setFormKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const cartRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const stickySentinelRef = useRef<HTMLDivElement>(null)
  const [formIsPinned, setFormIsPinned] = useState(false)
  const [pinnedHeight, setPinnedHeight] = useState(0)
  const [pinnedLayout, setPinnedLayout] = useState<{
    formBottom: number
    mainLeft: number
    mainWidth: number
    mainTop: number
    headerStickTop: number
  } | null>(null)
  const [mainBounds, setMainBounds] = useState({ top: 0, left: 0, width: 0 })
  const errors = pageErrors

  const syncPinnedLayout = useCallback(() => {
    const main = formRef.current?.closest('main') ?? stickySentinelRef.current?.closest('main')
    if (!main) return

    const mainRect = main.getBoundingClientRect()
    setMainBounds({ top: mainRect.top, left: mainRect.left, width: mainRect.width })

    if (formRef.current && formIsPinned) {
      const formRect = formRef.current.getBoundingClientRect()
      setPinnedHeight(formRef.current.offsetHeight)
      setPinnedLayout({
        formBottom: formRect.bottom,
        mainLeft: mainRect.left,
        mainWidth: mainRect.width,
        mainTop: mainRect.top,
        headerStickTop: Math.max(0, formRect.bottom - mainRect.top),
      })
    } else {
      setPinnedLayout(null)
    }
  }, [formIsPinned])

  useEffect(() => {
    const sentinel = stickySentinelRef.current
    const main = sentinel?.closest('main')
    if (!sentinel || !main) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const pinned = !entry.isIntersecting
        setFormIsPinned(pinned)
      },
      { root: main, threshold: 0 }
    )
    observer.observe(sentinel)

    syncPinnedLayout()
    main.addEventListener('scroll', syncPinnedLayout, { passive: true })
    window.addEventListener('resize', syncPinnedLayout)

    return () => {
      observer.disconnect()
      main.removeEventListener('scroll', syncPinnedLayout)
      window.removeEventListener('resize', syncPinnedLayout)
    }
  }, [syncPinnedLayout])

  useEffect(() => {
    syncPinnedLayout()
  }, [formIsPinned, activeTypeSlug, errors, syncPinnedLayout])

  useEffect(() => {
    const form = formRef.current
    if (!form) return

    const resizeObserver = new ResizeObserver(() => {
      syncPinnedLayout()
    })
    resizeObserver.observe(form)
    return () => resizeObserver.disconnect()
  }, [syncPinnedLayout])

  const activeType = bookingTypes.find((type) => type.slug === activeTypeSlug) ?? bookingTypes[0]
  const ActiveForm = activeType ? formBySlug[activeType.slug] : null

  if (!bookingTypes.length || !activeType || !ActiveForm) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        No booking enquiry types are available yet. Please contact DestinationZM to configure your portal forms.
      </div>
    )
  }

  const tabs = bookingTypes.map((type) => ({
    slug: type.slug,
    tabLabel: type.tabLabel ?? type.name,
    iconKey: type.iconKey,
  }))

  const errorMessages = Object.values(errors).filter(Boolean)
  const hasErrors = errorMessages.length > 0

  function handleTabChange(slug: string) {
    setActiveTypeSlug(slug)
    setFormKey((current) => current + 1)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const formData = new FormData(event.currentTarget)
    const url = client.getRoute('portal.bookings.cart.add').url
    const cartCountBefore = cartItems.length

    setSubmitting(true)
    router.post(url, formData, {
      preserveScroll: true,
      preserveState: true,
      only: ['cartItems', 'flash', 'errors'],
      onSuccess: (page) => {
        const incomingErrors = (page.props?.errors ?? {}) as Record<string, string>
        const hadErrors = Object.keys(incomingErrors).length > 0
        const incomingItems = (page.props?.cartItems ?? []) as EnquiryCartItem[]
        const cartGrew = incomingItems.length > cartCountBefore

        if (!hadErrors && cartGrew) {
          setFormKey((current) => current + 1)
          window.requestAnimationFrame(() => {
            cartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          })
        }
      },
      onFinish: () => setSubmitting(false),
    })
  }

  return (
    <div className="min-w-0 pb-8">
      <TripHero />
      <div ref={stickySentinelRef} className="h-px" aria-hidden />

      {formIsPinned && pinnedHeight > 0 ? (
        <div aria-hidden style={{ height: pinnedHeight }} />
      ) : null}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        style={
          formIsPinned
            ? {
                position: 'fixed',
                top: mainBounds.top,
                left: mainBounds.left,
                width: mainBounds.width,
                zIndex: 40,
                overflow: 'visible',
              }
            : undefined
        }
        className={[
          'w-full min-w-0 transition-shadow',
          formIsPinned
            ? 'bg-slate-100/95 px-2 shadow-md backdrop-blur-sm md:px-4'
            : 'pb-4',
        ].join(' ')}
      >
        <input type="hidden" name="branchId" value={defaultBranchId} />
        <input type="hidden" name="currency" value="ZMW" />
        <input type="hidden" name="bookingTypeId" value={activeType.id} />

        <TripSearchShell
          stuck={formIsPinned}
          tabs={<TripCategoryTabs tabs={tabs} activeSlug={activeTypeSlug} onChange={handleTabChange} />}
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <label htmlFor="estimatedBudget" className="text-sm font-medium text-slate-700">
                  Budget estimate
                </label>
                <p className="text-xs text-slate-500">Optional — helps us prepare a tailored quotation</p>
              </div>
              <div className="relative w-full shrink-0 sm:w-[220px]">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                  ZMW
                </span>
                <input
                  id="estimatedBudget"
                  name="estimatedBudget"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          }
        >
          <TripSearchPanel>
            <ActiveForm
              key={`${activeType.slug}-${formKey}`}
              fields={activeType.fields}
              errors={errors}
              minDate={today}
            />
          </TripSearchPanel>
        </TripSearchShell>

        {(errors.bookingTypeId || hasErrors) ? (
          <div className={`mx-auto mt-3 max-w-6xl space-y-2 px-2 md:px-4 ${formIsPinned ? '' : 'md:mx-6'}`}>
            {errors.bookingTypeId ? (
              <p className="text-sm text-red-600">{errors.bookingTypeId}</p>
            ) : null}

            {hasErrors ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p className="font-semibold">Please complete the required fields before adding to your enquiry.</p>
                <ul className="mt-1 list-inside list-disc text-red-700">
                  {errorMessages.slice(0, 4).map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </form>

      <div ref={cartRef} className="scroll-mt-56">
        <EnquiryCartPanel
          items={cartItems}
          defaultBranchId={defaultBranchId}
          organizationName={organizationName}
          pinnedLayout={pinnedLayout}
        />
      </div>
    </div>
  )
}
