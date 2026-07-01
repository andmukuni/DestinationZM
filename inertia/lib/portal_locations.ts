export type LocationKind = 'city' | 'airport' | 'station' | 'attraction'

export type LocationSuggestion = {
  value: string
  kind: LocationKind
  region?: string
  code?: string
  keywords?: string[]
}

export const LOCATION_SUGGESTIONS: LocationSuggestion[] = [
  // Zambian cities
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

  // Southern / East Africa cities
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
  { value: 'Kigali', kind: 'city', region: 'Rwanda' },
  { value: 'Addis Ababa', kind: 'city', region: 'Ethiopia' },
  { value: 'Kinshasa', kind: 'city', region: 'DR Congo' },
  { value: 'Lubumbashi', kind: 'city', region: 'DR Congo' },
  { value: 'Lilongwe', kind: 'city', region: 'Malawi' },
  { value: 'Blantyre', kind: 'city', region: 'Malawi' },

  // International hub cities
  { value: 'Dubai', kind: 'city', region: 'UAE' },
  { value: 'Doha', kind: 'city', region: 'Qatar' },
  { value: 'London', kind: 'city', region: 'United Kingdom' },
  { value: 'Paris', kind: 'city', region: 'France' },
  { value: 'Istanbul', kind: 'city', region: 'Türkiye' },
  { value: 'Mumbai', kind: 'city', region: 'India' },
  { value: 'Guangzhou', kind: 'city', region: 'China' },

  // Airports — Zambia
  { value: 'Kenneth Kaunda International Airport', kind: 'airport', region: 'Lusaka, Zambia', code: 'LUN' },
  { value: 'Harry Mwanga Nkumbula International Airport', kind: 'airport', region: 'Livingstone, Zambia', code: 'LVI' },
  { value: 'Simon Mwansa Kapwepwe International Airport', kind: 'airport', region: 'Ndola, Zambia', code: 'NLA' },
  { value: 'Mfuwe Airport', kind: 'airport', region: 'South Luangwa, Zambia', code: 'MFU' },
  { value: 'Solwezi Airport', kind: 'airport', region: 'Solwezi, Zambia', code: 'SLI' },
  { value: 'Mongu Airport', kind: 'airport', region: 'Mongu, Zambia', code: 'MNR' },

  // Airports — regional & international hubs
  { value: 'OR Tambo International Airport', kind: 'airport', region: 'Johannesburg, South Africa', code: 'JNB' },
  { value: 'Cape Town International Airport', kind: 'airport', region: 'Cape Town, South Africa', code: 'CPT' },
  { value: 'Dubai International Airport', kind: 'airport', region: 'Dubai, UAE', code: 'DXB' },
  { value: 'Hamad International Airport', kind: 'airport', region: 'Doha, Qatar', code: 'DOH' },
  { value: 'Bole International Airport', kind: 'airport', region: 'Addis Ababa, Ethiopia', code: 'ADD' },
  { value: 'Jomo Kenyatta International Airport', kind: 'airport', region: 'Nairobi, Kenya', code: 'NBO' },
  { value: 'Julius Nyerere International Airport', kind: 'airport', region: 'Dar es Salaam, Tanzania', code: 'DAR' },
  { value: 'Maun Airport', kind: 'airport', region: 'Maun, Botswana', code: 'MUB' },
  { value: 'Sir Seretse Khama International Airport', kind: 'airport', region: 'Gaborone, Botswana', code: 'GBE' },
  { value: 'Robert Mugabe International Airport', kind: 'airport', region: 'Harare, Zimbabwe', code: 'HRE' },
  { value: 'Victoria Falls Airport', kind: 'airport', region: 'Victoria Falls, Zimbabwe', code: 'VFA' },
  { value: 'Hosea Kutako International Airport', kind: 'airport', region: 'Windhoek, Namibia', code: 'WDH' },
  { value: 'Heathrow Airport', kind: 'airport', region: 'London, United Kingdom', code: 'LHR' },
  { value: 'Istanbul Airport', kind: 'airport', region: 'Istanbul, Türkiye', code: 'IST' },

  // Rail stations
  { value: 'Lusaka Railway Station', kind: 'station', region: 'Lusaka, Zambia' },
  { value: 'Livingstone Railway Station', kind: 'station', region: 'Livingstone, Zambia' },
  { value: 'Kitwe Railway Station', kind: 'station', region: 'Kitwe, Zambia' },
  { value: 'Ndola Railway Station', kind: 'station', region: 'Ndola, Zambia' },
  { value: 'Kapiri Mposhi TAZARA Station', kind: 'station', region: 'Kapiri Mposhi, Zambia', keywords: ['tazara'] },
  { value: 'Mpika TAZARA Station', kind: 'station', region: 'Mpika, Zambia', keywords: ['tazara'] },
  { value: 'Kasama TAZARA Station', kind: 'station', region: 'Kasama, Zambia', keywords: ['tazara'] },
  { value: 'Dar es Salaam TAZARA Station', kind: 'station', region: 'Dar es Salaam, Tanzania', keywords: ['tazara'] },
  { value: 'Park Station Johannesburg', kind: 'station', region: 'Johannesburg, South Africa' },

  // Attractions
  { value: 'Victoria Falls', kind: 'attraction', region: 'Livingstone, Zambia' },
  { value: 'Mosi-oa-Tunya National Park', kind: 'attraction', region: 'Livingstone, Zambia' },
  { value: 'Devil’s Pool', kind: 'attraction', region: 'Victoria Falls, Zambia' },
  { value: 'South Luangwa National Park', kind: 'attraction', region: 'Eastern, Zambia' },
  { value: 'Lower Zambezi National Park', kind: 'attraction', region: 'Lusaka, Zambia' },
  { value: 'Kafue National Park', kind: 'attraction', region: 'Central, Zambia' },
  { value: 'North Luangwa National Park', kind: 'attraction', region: 'Northern, Zambia' },
  { value: 'Kasanka National Park', kind: 'attraction', region: 'Central, Zambia' },
  { value: 'Bangweulu Wetlands', kind: 'attraction', region: 'Luapula, Zambia' },
  { value: 'Lake Kariba', kind: 'attraction', region: 'Siavonga, Zambia' },
  { value: 'Lake Tanganyika', kind: 'attraction', region: 'Mpulungu, Zambia' },
  { value: 'Blue Lagoon National Park', kind: 'attraction', region: 'Central, Zambia' },
  { value: 'Lochinvar National Park', kind: 'attraction', region: 'Southern, Zambia' },
  { value: 'Nsumbu National Park', kind: 'attraction', region: 'Northern, Zambia' },
  { value: 'Chobe National Park', kind: 'attraction', region: 'Botswana' },
  { value: 'Kruger National Park', kind: 'attraction', region: 'South Africa' },
]

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function filterLocations(
  query: string,
  kinds: LocationKind[],
  limit = 8
): LocationSuggestion[] {
  const kindSet = new Set(kinds)
  const pool = LOCATION_SUGGESTIONS.filter((item) => kindSet.has(item.kind))

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

export function formatLocationMeta(item: LocationSuggestion): string {
  const parts: string[] = []
  if (item.kind === 'airport' && item.code) {
    parts.push(`Airport · ${item.code}`)
  } else if (item.kind === 'airport') {
    parts.push('Airport')
  } else if (item.kind === 'city') {
    parts.push('City')
  } else if (item.kind === 'station') {
    parts.push('Station')
  } else if (item.kind === 'attraction') {
    parts.push('Attraction')
  }
  if (item.region) parts.push(item.region)
  return parts.join(' · ')
}
