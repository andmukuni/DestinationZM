import type { AccommodationKind } from '#types/accommodation'

export type AccommodationSeed = {
  name: string
  kind: AccommodationKind
  city: string
  region?: string
  country: string
  keywords?: string[]
  starRating?: number | null
}

export function inferAccommodationStarRating(
  kind: AccommodationKind,
  name: string
): number | null {
  const label = name.toLowerCase()

  if (kind === 'hotel') {
    if (
      /radisson|intercontinental|taj|one&only|royal livingstone|table bay|atlantis|four seasons|hilton|fairmont/i.test(
        label
      )
    ) {
      return 5
    }
    if (
      /protea|avani|southern sun|best western|hyatt|serena|marriott|garden court|michelangelo|hemingways|mika convention/i.test(
        label
      )
    ) {
      return 4
    }
    return 3
  }

  if (kind === 'lodge') {
    if (/andbeyond|royal|bush camp|safari lodge & spa|manor house|island lodge/i.test(label)) {
      return 5
    }
    return 4
  }

  if (kind === 'apartment') {
    return 3
  }

  return null
}

export const ACCOMMODATION_SEED_DATA: AccommodationSeed[] = [
  // Lusaka — hotels
  { name: 'Radisson Blu Hotel Lusaka', kind: 'hotel', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia', keywords: ['radisson', 'cbd'] },
  { name: 'InterContinental Lusaka', kind: 'hotel', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia', keywords: ['intercontinental', 'cbd'] },
  { name: 'Protea Hotel by Marriott Lusaka', kind: 'hotel', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia', keywords: ['marriott', 'protea'] },
  { name: 'Taj Pamodzi Hotel', kind: 'hotel', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia', keywords: ['taj', 'pamodzi'] },
  { name: 'Avani Lusaka Hotel', kind: 'hotel', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia', keywords: ['avani'] },
  { name: 'Best Western Plus Lusaka', kind: 'hotel', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia' },
  { name: 'Southern Sun Ridgeway Hotel', kind: 'hotel', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia', keywords: ['ridgeway'] },
  { name: 'Mika Convention Centre', kind: 'hotel', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia', keywords: ['mika', 'convention'] },
  { name: 'Cresta Golfview Hotel', kind: 'hotel', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia', keywords: ['golfview'] },
  { name: 'Lusaka Hotel', kind: 'hotel', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia' },
  { name: 'Royal Zambezi Lodge', kind: 'lodge', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia', keywords: ['zambezi'] },
  { name: 'Chaminuka Lodge', kind: 'lodge', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia', keywords: ['chaminuka', 'nature'] },
  { name: 'Lilayi Lodge', kind: 'lodge', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia', keywords: ['lilayi', 'elephant'] },
  { name: 'Pioneer Lodge', kind: 'lodge', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia' },
  { name: 'Woodlands Executive Apartments', kind: 'apartment', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia', keywords: ['woodlands', 'executive'] },
  { name: 'Kabulonga Serviced Apartments', kind: 'apartment', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia', keywords: ['kabulonga'] },
  { name: 'Roma Park Apartments', kind: 'apartment', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia', keywords: ['roma park'] },
  { name: 'Longacres Furnished Apartments', kind: 'apartment', city: 'Lusaka', region: 'Lusaka Province', country: 'Zambia', keywords: ['longacres'] },

  // Livingstone / Victoria Falls — hotels & lodges
  { name: 'Avani Victoria Falls Resort', kind: 'hotel', city: 'Livingstone', region: 'Southern Province', country: 'Zambia', keywords: ['avani', 'vic falls', 'victoria falls'] },
  { name: 'Royal Livingstone Victoria Falls Hotel', kind: 'hotel', city: 'Livingstone', region: 'Southern Province', country: 'Zambia', keywords: ['royal livingstone', 'vic falls'] },
  { name: 'Protea Hotel Livingstone', kind: 'hotel', city: 'Livingstone', region: 'Southern Province', country: 'Zambia', keywords: ['protea', 'marriott'] },
  { name: 'Zambezi Sun Hotel', kind: 'hotel', city: 'Livingstone', region: 'Southern Province', country: 'Zambia', keywords: ['zambezi sun', 'sun international'] },
  { name: 'David Livingstone Safari Lodge & Spa', kind: 'lodge', city: 'Livingstone', region: 'Southern Province', country: 'Zambia', keywords: ['david livingstone', 'spa'] },
  { name: 'Maramba River Lodge', kind: 'lodge', city: 'Livingstone', region: 'Southern Province', country: 'Zambia', keywords: ['maramba'] },
  { name: 'The River Club', kind: 'lodge', city: 'Livingstone', region: 'Southern Province', country: 'Zambia', keywords: ['river club', 'zambezi'] },
  { name: 'Tongabezi Lodge', kind: 'lodge', city: 'Livingstone', region: 'Southern Province', country: 'Zambia', keywords: ['tongabezi', 'zambezi'] },
  { name: 'Sindabezi Island Lodge', kind: 'lodge', city: 'Livingstone', region: 'Southern Province', country: 'Zambia', keywords: ['sindabezi', 'island'] },
  { name: 'Toka Leya Camp', kind: 'lodge', city: 'Livingstone', region: 'Southern Province', country: 'Zambia', keywords: ['toka leya', 'andbeyond'] },
  { name: 'Thorntree River Lodge', kind: 'lodge', city: 'Livingstone', region: 'Southern Province', country: 'Zambia', keywords: ['thorntree'] },
  { name: 'Waterberry Zambezi Lodge', kind: 'lodge', city: 'Livingstone', region: 'Southern Province', country: 'Zambia', keywords: ['waterberry'] },
  { name: 'Livingstone Safari Lodge', kind: 'lodge', city: 'Livingstone', region: 'Southern Province', country: 'Zambia' },
  { name: 'Fallsview Apartments Livingstone', kind: 'apartment', city: 'Livingstone', region: 'Southern Province', country: 'Zambia', keywords: ['fallsview'] },
  { name: 'Zambezi Waterfront Apartments', kind: 'apartment', city: 'Livingstone', region: 'Southern Province', country: 'Zambia', keywords: ['waterfront'] },

  // Victoria Falls, Zimbabwe
  { name: 'Victoria Falls Hotel', kind: 'hotel', city: 'Victoria Falls Town', region: 'Matabeleland North', country: 'Zimbabwe', keywords: ['vic falls', 'victoria falls'] },
  { name: 'Ilala Lodge', kind: 'lodge', city: 'Victoria Falls Town', region: 'Matabeleland North', country: 'Zimbabwe', keywords: ['ilala'] },
  { name: 'The Elephant Camp', kind: 'lodge', city: 'Victoria Falls Town', region: 'Matabeleland North', country: 'Zimbabwe', keywords: ['elephant camp'] },
  { name: 'Matetsi Victoria Falls', kind: 'lodge', city: 'Victoria Falls Town', region: 'Matabeleland North', country: 'Zimbabwe', keywords: ['matetsi'] },

  // South Luangwa
  { name: 'Mfuwe Lodge', kind: 'lodge', city: 'Mfuwe', region: 'Eastern Province', country: 'Zambia', keywords: ['south luangwa', 'safari'] },
  { name: 'Chinzombo Camp', kind: 'lodge', city: 'Mfuwe', region: 'Eastern Province', country: 'Zambia', keywords: ['chinzombo', 'norman carr'] },
  { name: 'Kakuli Bush Camp', kind: 'lodge', city: 'Mfuwe', region: 'Eastern Province', country: 'Zambia', keywords: ['kakuli', 'bush camp'] },
  { name: 'Nsefu Camp', kind: 'lodge', city: 'Mfuwe', region: 'Eastern Province', country: 'Zambia', keywords: ['nsefu'] },
  { name: 'Flatdogs Camp', kind: 'lodge', city: 'Mfuwe', region: 'Eastern Province', country: 'Zambia', keywords: ['flatdogs'] },
  { name: 'Kafunta River Lodge', kind: 'lodge', city: 'Mfuwe', region: 'Eastern Province', country: 'Zambia', keywords: ['kafunta'] },
  { name: 'Trackers Safari Lodge', kind: 'lodge', city: 'Mfuwe', region: 'Eastern Province', country: 'Zambia', keywords: ['trackers'] },
  { name: 'Puku Ridge Camp', kind: 'lodge', city: 'Mfuwe', region: 'Eastern Province', country: 'Zambia', keywords: ['puku ridge'] },
  { name: 'Tafika Camp', kind: 'lodge', city: 'Mfuwe', region: 'Eastern Province', country: 'Zambia', keywords: ['tafika', 'remote africa'] },

  // Lower Zambezi
  { name: 'Chiawa Camp', kind: 'lodge', city: 'Lower Zambezi', region: 'Lusaka Province', country: 'Zambia', keywords: ['chiawa', 'zambezi'] },
  { name: 'Old Mondoro Bush Camp', kind: 'lodge', city: 'Lower Zambezi', region: 'Lusaka Province', country: 'Zambia', keywords: ['old mondoro'] },
  { name: 'Sausage Tree Camp', kind: 'lodge', city: 'Lower Zambezi', region: 'Lusaka Province', country: 'Zambia', keywords: ['sausage tree'] },
  { name: 'Anabezi Camp', kind: 'lodge', city: 'Lower Zambezi', region: 'Lusaka Province', country: 'Zambia', keywords: ['anabezi'] },
  { name: 'Baines River Camp', kind: 'lodge', city: 'Lower Zambezi', region: 'Lusaka Province', country: 'Zambia', keywords: ['baines'] },
  { name: 'Royal Zambezi Lodge', kind: 'lodge', city: 'Lower Zambezi', region: 'Lusaka Province', country: 'Zambia', keywords: ['royal zambezi'] },
  { name: 'Kasaka River Lodge', kind: 'lodge', city: 'Lower Zambezi', region: 'Lusaka Province', country: 'Zambia', keywords: ['kasaka'] },

  // Kafue National Park
  { name: 'Busanga Bush Camp', kind: 'lodge', city: 'Kafue National Park', region: 'Central Province', country: 'Zambia', keywords: ['busanga', 'wilderness'] },
  { name: 'Shumba Camp', kind: 'lodge', city: 'Kafue National Park', region: 'Central Province', country: 'Zambia', keywords: ['shumba'] },
  { name: 'Ila Safari Lodge', kind: 'lodge', city: 'Kafue National Park', region: 'Central Province', country: 'Zambia', keywords: ['ila', 'kafue river'] },
  { name: 'Konkamoya Lodge', kind: 'lodge', city: 'Kafue National Park', region: 'Central Province', country: 'Zambia', keywords: ['konkamoya'] },
  { name: 'Mukambi Safari Lodge', kind: 'lodge', city: 'Kafue National Park', region: 'Central Province', country: 'Zambia', keywords: ['mukambi'] },
  { name: 'Mayukuyuku Bush Camp', kind: 'lodge', city: 'Kafue National Park', region: 'Central Province', country: 'Zambia', keywords: ['mayukuyuku'] },

  // Lake Kariba / Siavonga
  { name: 'Kariba Inn', kind: 'hotel', city: 'Siavonga', region: 'Southern Province', country: 'Zambia', keywords: ['kariba'] },
  { name: 'Lake Kariba Hotel', kind: 'hotel', city: 'Siavonga', region: 'Southern Province', country: 'Zambia', keywords: ['kariba'] },
  { name: 'Spurwing Island Lodge', kind: 'lodge', city: 'Siavonga', region: 'Southern Province', country: 'Zambia', keywords: ['spurwing', 'island'] },
  { name: 'Chikanka Island Lodge', kind: 'lodge', city: 'Siavonga', region: 'Southern Province', country: 'Zambia', keywords: ['chikanka'] },
  { name: 'Kariba Lakeside Apartments', kind: 'apartment', city: 'Siavonga', region: 'Southern Province', country: 'Zambia', keywords: ['lakeside'] },

  // Copperbelt — Ndola & Kitwe
  { name: 'Mpelembe Lodge', kind: 'lodge', city: 'Ndola', region: 'Copperbelt Province', country: 'Zambia', keywords: ['mpelembe'] },
  { name: 'Urban Hotel Ndola', kind: 'hotel', city: 'Ndola', region: 'Copperbelt Province', country: 'Zambia' },
  { name: 'Michelangelo Hotel Ndola', kind: 'hotel', city: 'Ndola', region: 'Copperbelt Province', country: 'Zambia', keywords: ['michelangelo'] },
  { name: 'Garden Court Kitwe', kind: 'hotel', city: 'Kitwe', region: 'Copperbelt Province', country: 'Zambia', keywords: ['garden court'] },
  { name: 'Moba Hotel & Convention Centre', kind: 'hotel', city: 'Kitwe', region: 'Copperbelt Province', country: 'Zambia', keywords: ['moba'] },
  { name: 'Sherbourne Hotel Kitwe', kind: 'hotel', city: 'Kitwe', region: 'Copperbelt Province', country: 'Zambia', keywords: ['sherbourne'] },
  { name: 'Copperbelt Executive Apartments', kind: 'apartment', city: 'Kitwe', region: 'Copperbelt Province', country: 'Zambia' },

  // North-Western — Solwezi
  { name: 'Kansanshi Hotel', kind: 'hotel', city: 'Solwezi', region: 'North-Western Province', country: 'Zambia', keywords: ['kansanshi', 'mining'] },
  { name: 'Royal Solwezi Hotel', kind: 'hotel', city: 'Solwezi', region: 'North-Western Province', country: 'Zambia' },
  { name: 'Mwinilunga Lodge', kind: 'lodge', city: 'Solwezi', region: 'North-Western Province', country: 'Zambia' },

  // Eastern — Chipata
  { name: 'Protea Hotel Chipata', kind: 'hotel', city: 'Chipata', region: 'Eastern Province', country: 'Zambia', keywords: ['protea'] },
  { name: 'Katuta Lodge', kind: 'lodge', city: 'Chipata', region: 'Eastern Province', country: 'Zambia', keywords: ['katuta'] },
  { name: 'Chipata Central Apartments', kind: 'apartment', city: 'Chipata', region: 'Eastern Province', country: 'Zambia' },

  // Northern — Kasama
  { name: 'Kasama Hotel', kind: 'hotel', city: 'Kasama', region: 'Northern Province', country: 'Zambia' },
  { name: 'Shiwa Ngandu Manor House', kind: 'lodge', city: 'Kasama', region: 'Northern Province', country: 'Zambia', keywords: ['shiwa ngandu', 'heritage'] },
  { name: 'Mutinondo Wilderness Lodge', kind: 'lodge', city: 'Kasama', region: 'Northern Province', country: 'Zambia', keywords: ['mutinondo'] },

  // Western — Mongu
  { name: 'Ngulu Sun Hotel', kind: 'hotel', city: 'Mongu', region: 'Western Province', country: 'Zambia', keywords: ['ngulu'] },
  { name: 'Barotse Floodplain Lodge', kind: 'lodge', city: 'Mongu', region: 'Western Province', country: 'Zambia', keywords: ['barotse', 'floodplain'] },

  // Regional — Johannesburg
  { name: 'Sandton Sun', kind: 'hotel', city: 'Johannesburg', region: 'Gauteng', country: 'South Africa', keywords: ['sandton'] },
  { name: 'Radisson Blu Gautrain Sandton', kind: 'hotel', city: 'Johannesburg', region: 'Gauteng', country: 'South Africa', keywords: ['radisson', 'sandton'] },
  { name: 'The Maslow Hotel Sandton', kind: 'hotel', city: 'Johannesburg', region: 'Gauteng', country: 'South Africa', keywords: ['maslow'] },
  { name: 'Rosebank Apartments Johannesburg', kind: 'apartment', city: 'Johannesburg', region: 'Gauteng', country: 'South Africa', keywords: ['rosebank'] },

  // Regional — Cape Town
  { name: 'Table Bay Hotel', kind: 'hotel', city: 'Cape Town', region: 'Western Cape', country: 'South Africa', keywords: ['v&a waterfront'] },
  { name: 'One&Only Cape Town', kind: 'hotel', city: 'Cape Town', region: 'Western Cape', country: 'South Africa', keywords: ['one and only'] },
  { name: 'Waterfront Apartments Cape Town', kind: 'apartment', city: 'Cape Town', region: 'Western Cape', country: 'South Africa', keywords: ['waterfront'] },

  // Regional — Botswana
  { name: 'Maun Lodge', kind: 'lodge', city: 'Maun', region: 'North-West District', country: 'Botswana', keywords: ['okavango gateway'] },
  { name: 'Thamalakane River Lodge', kind: 'lodge', city: 'Maun', region: 'North-West District', country: 'Botswana', keywords: ['thamalakane'] },
  { name: 'Chobe Game Lodge', kind: 'lodge', city: 'Kasane', region: 'Chobe District', country: 'Botswana', keywords: ['chobe'] },
  { name: 'Elephant Valley Lodge', kind: 'lodge', city: 'Kasane', region: 'Chobe District', country: 'Botswana', keywords: ['elephant valley'] },

  // Regional — Kenya / Tanzania
  { name: 'Serena Hotel Nairobi', kind: 'hotel', city: 'Nairobi', region: 'Nairobi County', country: 'Kenya', keywords: ['serena'] },
  { name: 'Hemingways Nairobi', kind: 'hotel', city: 'Nairobi', region: 'Nairobi County', country: 'Kenya', keywords: ['hemingways'] },
  { name: 'Hyatt Regency Dar es Salaam', kind: 'hotel', city: 'Dar es Salaam', region: 'Dar es Salaam', country: 'Tanzania', keywords: ['hyatt'] },
  { name: 'Sea Cliff Hotel Dar es Salaam', kind: 'hotel', city: 'Dar es Salaam', region: 'Dar es Salaam', country: 'Tanzania', keywords: ['sea cliff'] },
  { name: 'Zanzibar Serena Hotel', kind: 'hotel', city: 'Stone Town', region: 'Zanzibar', country: 'Tanzania', keywords: ['zanzibar', 'serena'] },

  // Regional — Dubai / Doha (common transit)
  { name: 'Atlantis The Palm', kind: 'hotel', city: 'Dubai', region: 'Dubai', country: 'UAE', keywords: ['palm jumeirah'] },
  { name: 'Jumeirah Beach Hotel', kind: 'hotel', city: 'Dubai', region: 'Dubai', country: 'UAE', keywords: ['jumeirah'] },
  { name: 'Marriott Marquis City Centre Doha', kind: 'hotel', city: 'Doha', region: 'Doha', country: 'Qatar', keywords: ['marriott'] },
]
