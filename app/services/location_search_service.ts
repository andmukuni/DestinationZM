import Accommodation from '#models/accommodation'
import {
  filterStaticLocations,
  type StaticLocationKind,
  type StaticLocationSuggestion,
} from '#data/portal_location_suggestions'
import type { AccommodationKind } from '#types/accommodation'

export type LocationSearchKind =
  | StaticLocationKind
  | AccommodationKind

export type LocationSearchResult = {
  value: string
  kind: LocationSearchKind
  region?: string
  code?: string
  keywords?: string[]
  accommodationId?: number
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

    const results: LocationSearchResult[] = []

    if (staticKinds.length > 0) {
      results.push(...filterStaticLocations(query, staticKinds, limit).map(toStaticResult))
    }

    if (accommodationKinds.length > 0) {
      const trimmed = query.trim()
      const needle = trimmed ? normalize(trimmed) : ''

      let accommodationQuery = Accommodation.query().where('active', true).whereIn('kind', accommodationKinds)

      if (needle) {
        const pattern = `%${trimmed}%`
        accommodationQuery = accommodationQuery.where((builder) => {
          builder
            .whereILike('name', pattern)
            .orWhereILike('city', pattern)
            .orWhereILike('region', pattern)
            .orWhereILike('country', pattern)
        })
      }

      const accommodations = await accommodationQuery.limit(60)

      const ranked = accommodations
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

      results.push(...ranked)
    }

    const seen = new Set<string>()
    const deduped: LocationSearchResult[] = []

    for (const item of results) {
      const key = `${item.kind}:${item.value}:${item.region ?? ''}`
      if (seen.has(key)) continue
      seen.add(key)
      deduped.push(item)
      if (deduped.length >= limit) break
    }

    return deduped
  }
}
