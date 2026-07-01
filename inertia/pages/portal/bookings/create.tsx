import { Head } from '@inertiajs/react'
import TripEnquiryWidget from '~/components/portal/trip_enquiry/trip_enquiry_widget'
import { PORTAL_ENQUIRY_HERO_IMAGE } from '~/components/portal/trip_enquiry/trip_hero'
import type { EnquiryCartItem } from '~/components/portal/enquiry_cart_panel'
import type { PortalBookingFieldDefinition } from '#types/portal_booking_type'

type BookingTypeOption = {
  id: number
  slug: string
  name: string
  tabLabel: string | null
  iconKey: string | null
  description: string | null
  sortOrder: number
  fields: PortalBookingFieldDefinition[]
}

type PortalBookingsCreateProps = {
  pageTitle?: string
  pageDescription?: string
  organization: { name: string }
  submittedBy: { name: string; email: string }
  defaultBranchId: number
  bookingTypes: BookingTypeOption[]
  initialType: string | null
  cartItems: EnquiryCartItem[]
}

export default function PortalBookingsCreate({
  organization,
  defaultBranchId,
  bookingTypes,
  initialType,
  cartItems = [],
}: PortalBookingsCreateProps) {
  return (
    <>
      <Head>
        <link rel="preload" as="image" href={PORTAL_ENQUIRY_HERO_IMAGE} type="image/jpeg" />
      </Head>
      <div className="-mx-4 -mt-4 min-w-0 md:-mx-6 md:-mt-6">
        <TripEnquiryWidget
          bookingTypes={bookingTypes}
          initialType={initialType}
          defaultBranchId={defaultBranchId}
          organizationName={organization.name}
          cartItems={cartItems}
        />
      </div>
    </>
  )
}
