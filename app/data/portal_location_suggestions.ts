export type StaticLocationKind = 'city' | 'airport' | 'station' | 'attraction'

export type StaticLocationSuggestion = {
  value: string
  kind: StaticLocationKind
  region?: string
  code?: string
  keywords?: string[]
}

export const STATIC_LOCATION_SUGGESTIONS: StaticLocationSuggestion[] = [
  { value: 'Lusaka', kind: 'city', region: 'Zambia', keywords: ['capital'] },
  { value: 'Livingstone', kind: 'city', region: 'Zambia', keywords: ['vic falls'] },
  { value: 'Kitwe', kind: 'city', region: 'Zambia' },
  { value: 'Ndola', kind: 'city', region: 'Zambia' },
  { value: 'Solwezi', kind: 'city', region: 'Zambia' },
  { value: 'Chipata', kind: 'city', region: 'Zambia' },
  { value: 'Mongu', kind: 'city', region: 'Zambia' },
  { value: 'Kasama', kind: 'city', region: 'Zambia' },
  { value: 'Mansa', kind: 'city', region: 'Zambia' },
  { value: 'Kabwe', kind: 'city', region: 'Zambia' },
  { value: 'Choma', kind: 'city', region: 'Zambia' },
  { value: 'Mazabuka', kind: 'city', region: 'Zambia' },
  { value: 'Kafue', kind: 'city', region: 'Zambia' },
  { value: 'Kapiri Mposhi', kind: 'city', region: 'Zambia' },
  { value: 'Mpika', kind: 'city', region: 'Zambia' },
  { value: 'Sesheke', kind: 'city', region: 'Zambia' },
  { value: 'Siavonga', kind: 'city', region: 'Zambia' },
  { value: 'Harare', kind: 'city', region: 'Zimbabwe' },
  { value: 'Victoria Falls Town', kind: 'city', region: 'Zimbabwe' },
  { value: 'Bulawayo', kind: 'city', region: 'Zimbabwe' },
  { value: 'Johannesburg', kind: 'city', region: 'South Africa' },
  { value: 'Cape Town', kind: 'city', region: 'South Africa' },
  { value: 'Durban', kind: 'city', region: 'South Africa' },
  { value: 'Gaborone', kind: 'city', region: 'Botswana' },
  { value: 'Maun', kind: 'city', region: 'Botswana' },
  { value: 'Windhoek', kind: 'city', region: 'Namibia' },
  { value: 'Nairobi', kind: 'city', region: 'Kenya' },
  { value: 'Dar es Salaam', kind: 'city', region: 'Tanzania' },
  { value: 'Victoria Falls', kind: 'attraction', region: 'Livingstone, Zambia' },
  { value: 'South Luangwa National Park', kind: 'attraction', region: 'Eastern, Zambia' },
  { value: 'Lower Zambezi National Park', kind: 'attraction', region: 'Lusaka, Zambia' },
  { value: 'Kafue National Park', kind: 'attraction', region: 'Central, Zambia' },
  { value: 'Lake Kariba', kind: 'attraction', region: 'Siavonga, Zambia' },
]

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function filterStaticLocations(
  query: string,
  kinds: StaticLocationKind[],
  limit = 8
): StaticLocationSuggestion[] {
  const kindSet = new Set(kinds)
  const pool = STATIC_LOCATION_SUGGESTIONS.filter((item) => kindSet.has(item.kind))
  const trimmed = query.trim()

  if (!trimmed) {
    return pool.slice(0, limit)
  }

  const needle = normalize(trimmed)

  const ranked = pool
    .map((item) => {
      const haystack = normalize(
        [item.value, item.region ?? '', item.code ?? '', ...(item.keywords ?? [])].join(' ')
      )
      const valueLc = normalize(item.value)

      let score = -1
      if (valueLc.startsWith(needle)) score = 0
      else if (valueLc.includes(needle)) score = 1
      else if (haystack.includes(needle)) score = 2

      return { item, score }
    })
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => a.score - b.score || a.item.value.localeCompare(b.item.value))

  return ranked.slice(0, limit).map((entry) => entry.item)
}
