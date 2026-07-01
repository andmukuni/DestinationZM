import { randomUUID } from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import type { PortalBookingTypeDefinition } from '#types/portal_booking_type'
import PortalBookingTypeService, { type MappedPortalEnquiry } from '#services/portal_booking_type_service'

type SessionStore = HttpContext['session']

export type PortalEnquiryCartItem = {
  id: string
  bookingTypeId: number
  typeName: string
  tabLabel: string
  slug: string
  destination: string
  departDate: string
  returnDate: string | null
  pax: number
  productType: string
  notes: string | null
  enquiryData: Record<string, string | number | null>
  estimatedBudget: number
  summaryLines: Array<{ label: string; value: string }>
}

const SESSION_KEY = 'portal_enquiry_cart'

export default class PortalEnquiryCartService {
  static list(session: SessionStore): PortalEnquiryCartItem[] {
    const items = session.get(SESSION_KEY) as PortalEnquiryCartItem[] | undefined
    return Array.isArray(items) ? items : []
  }

  static serializeForPortal(items: PortalEnquiryCartItem[]) {
    return items.map((item) => ({
      id: item.id,
      typeName: item.typeName,
      tabLabel: item.tabLabel,
      destination: item.destination,
      departDate: item.departDate,
      returnDate: item.returnDate,
      pax: item.pax,
      estimatedBudget: item.estimatedBudget,
      travelerNames: this.travelerNamesFromEnquiryData(item.enquiryData),
      summaryLines: item.summaryLines,
    }))
  }

  private static travelerNamesFromEnquiryData(
    enquiryData: Record<string, string | number | null>
  ): string | null {
    const raw = enquiryData.traveler_names
    if (raw === null || raw === undefined || String(raw).trim() === '') {
      return null
    }
    return String(raw).trim()
  }

  static addFromSubmission(
    session: SessionStore,
    type: PortalBookingTypeDefinition,
    mapped: MappedPortalEnquiry,
    estimatedBudget: number
  ) {
    const summaryLines = PortalBookingTypeService.formatEnquiryForDisplay(
      type.name,
      type.fields,
      mapped.enquiryData
    )

    const items = this.list(session)
    items.push({
      id: randomUUID(),
      bookingTypeId: type.id,
      typeName: type.name,
      tabLabel: type.tabLabel ?? type.name,
      slug: type.slug,
      destination: mapped.destination,
      departDate: mapped.departDate.toISODate() ?? '',
      returnDate: mapped.returnDate?.toISODate() ?? null,
      pax: mapped.pax,
      productType: mapped.productType,
      notes: mapped.notes,
      enquiryData: mapped.enquiryData,
      estimatedBudget,
      summaryLines,
    })
    session.put(SESSION_KEY, items)
  }

  static remove(session: SessionStore, itemId: string) {
    session.put(
      SESSION_KEY,
      this.list(session).filter((item) => item.id !== itemId)
    )
  }

  static updateBudget(session: SessionStore, itemId: string, estimatedBudget: number) {
    const items = this.list(session)
    const index = items.findIndex((item) => item.id === itemId)
    if (index === -1) {
      return false
    }

    items[index]!.estimatedBudget = estimatedBudget
    session.put(SESSION_KEY, items)
    return true
  }

  static clear(session: SessionStore) {
    session.forget(SESSION_KEY)
  }
}
