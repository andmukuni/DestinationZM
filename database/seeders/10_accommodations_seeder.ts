import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Accommodation from '#models/accommodation'
import { ACCOMMODATION_SEED_DATA } from '#database/data/accommodations_seed'

export default class extends BaseSeeder {
  async run() {
    for (const entry of ACCOMMODATION_SEED_DATA) {
      await Accommodation.updateOrCreate(
        {
          name: entry.name,
          city: entry.city,
          country: entry.country,
        },
        {
          kind: entry.kind,
          region: entry.region ?? null,
          keywords: entry.keywords ?? null,
          active: true,
        }
      )
    }

    console.log(`Seeded ${ACCOMMODATION_SEED_DATA.length} accommodations`)
  }
}
