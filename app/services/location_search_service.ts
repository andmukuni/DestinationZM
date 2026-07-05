import Accommodation from '#models/accommodation'
import {
  filterStaticLocations,
  type StaticLocationKind,
  type StaticLocationSuggestion,
} from '#data/portal_location_suggestions'
import type { AccommodationKind } from '#types/accommodation'
  | StaticLocationKind
  | AccommodationKind

export type LocationSearchResult = {
  value: string
  kind: LocationSearchKind
  region?: string
  code?: string
  keywords?: string[]
  accommodationId?: number
  starRating?: number | null
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

const STATIC_KINDS = new Set<StaticLocationKind>(['city', 'airport', 'station', 'attraction'])
const ACCOMMODATION_KINDS = new Set<AccommodationKind>(['hotel', 'lodge', 'apartment'])

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function toStaticResult(item: StaticLocationSuggestion): LocationSearchResult {
  return {
    value: item.value,
    kind: item.kind,
    region: item.region,
    code: item.code,
    keywords: item.keywords,
  }
}

function toAccommodationResult(record: Accommodation): LocationSearchResult {
  const regionParts = [record.city, record.region, record.country].filter(Boolean)
  return {
    value: record.name,
    kind: record.kind,
    region: regionParts.join(', '),
    keywords: record.keywords ?? undefined,
    accommodationId: record.id,
    starRating: record.starRating,
  }
}

function rankAccommodation(record: Accommodation, needle: string): number {
  const name = normalize(record.name)
  const city = normalize(record.city)
  const region = normalize(record.region ?? '')
  const country = normalize(record.country)
  const keywords = (record.keywords ?? []).map(normalize).join(' ')

  if (name.startsWith(needle)) return 0
  if (name.includes(needle)) return 1
  if (city.startsWith(needle)) return 2
  if (city.includes(needle)) return 3
  if (region.includes(needle) || country.includes(needle)) return 4
  if (keywords.includes(needle)) return 5
  return 6
}

export default class LocationSearchService {
  async search(query: string, kinds: LocationSearchKind[], limit = 12): Promise<LocationSearchResult[]> {
    const staticKinds = kinds.filter((kind): kind is StaticLocationKind => STATIC_KINDS.has(kind as StaticLocationKind))
    const accommodationKinds = kinds.filter((kind): kind is AccommodationKind =>
      ACCOMMODATION_KINDS.has(kind as AccommodationKind)
    )

    const trimmed = query.trim()
    const accommodationLimit = accommodationKinds.length > 0 ? Math.min(Math.max(limit, 8), 20) : 0
    const staticLimit = staticKinds.length > 0 ? Math.min(6, limit) : 0

    const accommodations =
      accommodationKinds.length > 0
        ? await this.searchAccommodations(trimmed, accommodationKinds, accommodationLimit)
        : []

    const staticResults =
      staticKinds.length > 0
        ? filterStaticLocations(trimmed, staticKinds, staticLimit).map(toStaticResult)
        : []

    if (accommodationKinds.length > 0) {
      return this.mergeAccommodationFirst(accommodations, staticResults, limit)
    }

    return staticResults.slice(0, limit)
  }

  private async searchAccommodations(
    query: string,
    kinds: AccommodationKind[],
    limit: number
  ): Promise<LocationSearchResult[]> {
    const needle = query ? normalize(query) : ''

    let accommodationQuery = Accommodation.query().where('active', true).whereIn('kind', kinds)

    if (needle) {
      const pattern = `%${query}%`
      accommodationQuery = accommodationQuery.where((builder) => {
        builder
          .whereILike('name', pattern)
          .orWhereILike('city', pattern)
          .orWhereILike('region', pattern)
          .orWhereILike('country', pattern)
      })
    }

    const records = await accommodationQuery.limit(needle ? 60 : 40)

    return records
      .map((record) => ({
        record,
        score: needle ? rankAccommodation(record, needle) : 0,
      }))
      .sort(
        (a, b) =>
          a.score - b.score ||
          a.record.name.localeCompare(b.record.name) ||
          a.record.city.localeCompare(b.record.city)
      )
      .slice(0, limit)
      .map((entry) => toAccommodationResult(entry.record))
  }

  private mergeAccommodationFirst(
    accommodations: LocationSearchResult[],
    staticResults: LocationSearchResult[],
    limit: number
  ) {
    const seen = new Set<string>()
    const merged: LocationSearchResult[] = []

    for (const item of [...accommodations, ...staticResults]) {
      const key = `${item.kind}:${item.value}:${item.region ?? ''}`
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(item)
      if (merged.length >= limit) break
    }

    return merged
  }

  async listAccommodationsForLocation(input: {
    location: string
    query?: string
    starRating?: number | null
    limit?: number
  }): Promise<AccommodationOption[]> {
    const location = input.location.trim()
    if (!location) {
      return []
    }

    const limit = Math.min(Math.max(input.limit ?? 20, 1), 40)
    const needle = input.query?.trim() ?? ''
    const pattern = `%${location}%`

    let accommodationQuery = Accommodation.query().where('active', true).where((builder) => {
      builder
        .whereILike('city', pattern)
        .orWhereILike('region', pattern)
        .orWhereILike('country', pattern)
    })

    if (needle) {
      const namePattern = `%${needle}%`
      accommodationQuery = accommodationQuery.whereILike('name', namePattern)
    }

    if (input.starRating && input.starRating >= 1 && input.starRating <= 5) {
      accommodationQuery = accommodationQuery.where('star_rating', input.starRating)
    }

    const records = await accommodationQuery
      .orderBy('star_rating', 'desc')
      .orderBy('name', 'asc')
      .limit(limit)

    return records.map((record) => ({
      id: record.id,
      name: record.name,
      kind: record.kind,
      city: record.city,
      region: record.region,
      country: record.country,
      starRating: record.starRating,
    }))
  }
}
