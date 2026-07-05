import type { HttpContext } from '@adonisjs/core/http'
import LocationSearchService, { type LocationSearchKind } from '#services/location_search_service'
import { ACCOMMODATION_KINDS } from '#types/accommodation'

const STATIC_KINDS = ['city', 'airport', 'station', 'attraction'] as const
const ALL_KINDS = [...STATIC_KINDS, ...ACCOMMODATION_KINDS] as const

function parseKinds(raw: string | undefined): LocationSearchKind[] {
  if (!raw?.trim()) {
    return [...ALL_KINDS]
  }

  const allowed = new Set<string>(ALL_KINDS)
  const parsed = raw
    .split(',')
    .map((kind) => kind.trim())
    .filter((kind): kind is LocationSearchKind => allowed.has(kind))

  return parsed.length > 0 ? parsed : [...ALL_KINDS]
}

export default class PortalLocationsController {
  async search({ request, response }: HttpContext) {
    const q = String(request.input('q', ''))
    const kinds = parseKinds(request.input('kinds'))
    const limit = Math.min(Math.max(Number(request.input('limit', 12)) || 12, 1), 30)

    const service = new LocationSearchService()
    const suggestions = await service.search(q, kinds, limit)

    return response.ok({ suggestions })
  }

  async accommodations({ request, response }: HttpContext) {
    const location = String(request.input('location', '')).trim()
    const q = String(request.input('q', ''))
    const starsRaw = request.input('stars')
    const stars =
      starsRaw === undefined || starsRaw === null || starsRaw === ''
        ? null
        : Number(starsRaw)
    const limit = Math.min(Math.max(Number(request.input('limit', 20)) || 20, 1), 40)

    if (!location) {
      return response.ok({ accommodations: [] })
    }

    const service = new LocationSearchService()
    const accommodations = await service.listAccommodationsForLocation({
      location,
      query: q,
      starRating: Number.isFinite(stars) && stars! >= 1 && stars! <= 5 ? stars : null,
      limit,
    })

    return response.ok({ accommodations })
  }
}
