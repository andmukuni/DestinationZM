import { useEffect, useState } from 'react'
import DateRangePicker from '../shared/date_range_picker'
import {
  defaultDateOffset,
  fieldError,
  fieldName,
  getField,
  type TripFormProps,
} from '../shared/field_bridge'
import LocationCombobox from '../shared/location_combobox'
import AccommodationNameCombobox from '../shared/accommodation_name_combobox'
import RoomGuestPopover from '../shared/room_guest_popover'
import SearchButton from '../shared/search_button'
import { TripSearchBarAction, TripSearchBarSection } from '../shared/trip_search_bar'
import { ChevronDownIcon } from '~/components/icons'

const STAR_OPTIONS = ['Any', '5 star', '4 star', '3 star', '2 star', '1 star'] as const

export default function HotelsEnquiryForm({ fields, errors, minDate }: TripFormProps) {
  const locationField = getField(fields, 'location')
  const accommodationField = getField(fields, 'accommodation_name')
  const starField = getField(fields, 'star_rating')

  const [location, setLocation] = useState('')
  const [accommodationName, setAccommodationName] = useState('')
  const [starRating, setStarRating] = useState('Any')
  const [checkIn, setCheckIn] = useState(defaultDateOffset(1))
  const [checkOut, setCheckOut] = useState(defaultDateOffset(2))
  const [rooms, setRooms] = useState(1)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  useEffect(() => {
    setAccommodationName('')
  }, [location, starRating])

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-slate-300 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:border-b lg:border-slate-300">
          <TripSearchBarSection className="lg:flex-[1.1]">
            <LocationCombobox
              fieldKey="location"
              value={location}
              onChange={setLocation}
              kinds={['city', 'attraction']}
              label={locationField?.label ?? 'Location'}
              placeholder={locationField?.placeholder ?? 'City or region'}
              required={Boolean(locationField?.required)}
              variant="inline"
              className="min-w-0 flex-1"
            />
          </TripSearchBarSection>

          <TripSearchBarSection className="lg:flex-[1.35]">
            <AccommodationNameCombobox
              fieldKey="accommodation_name"
              location={location}
              starRating={starRating}
              value={accommodationName}
              onChange={setAccommodationName}
              label={accommodationField?.label ?? 'Accommodation'}
              placeholder={accommodationField?.placeholder ?? 'Hotel, lodge, or apartment'}
              variant="inline"
              className="min-w-0 flex-1"
            />
          </TripSearchBarSection>

          <TripSearchBarSection className="lg:max-w-[180px] lg:flex-none">
            <div className="min-w-0 flex-1">
              <span className="block text-xs text-slate-500">
                {starField?.label ?? 'Star rating'}
              </span>
              <div className="relative mt-0.5">
                <select
                  name={fieldName('star_rating')}
                  value={starRating}
                  onChange={(event) => setStarRating(event.target.value)}
                  className="w-full appearance-none border-0 bg-transparent py-0 pr-6 text-sm font-semibold text-slate-900 outline-none"
                >
                  {STAR_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </TripSearchBarSection>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-stretch">
          <TripSearchBarSection className="px-0 lg:flex-[1.45] xl:flex-[1.5]">
            <DateRangePicker
              startKey="check_in"
              endKey="check_out"
              startValue={checkIn}
              endValue={checkOut}
              onStartChange={setCheckIn}
              onEndChange={setCheckOut}
              minDate={minDate}
              variant="inline"
            />
          </TripSearchBarSection>

          <TripSearchBarSection className="px-0 lg:flex-[1.2] xl:flex-[1.25]">
            <RoomGuestPopover
              variant="inline"
              rooms={rooms}
              adults={adults}
              children={children}
              onChange={({ rooms: nextRooms, adults: nextAdults, children: nextChildren }) => {
                setRooms(nextRooms)
                setAdults(nextAdults)
                setChildren(nextChildren)
              }}
            />
          </TripSearchBarSection>

          <TripSearchBarAction>
            <SearchButton integrated />
          </TripSearchBarAction>
        </div>
      </div>

      {fieldError(errors, 'location') ? (
        <p className="text-sm text-red-600">{fieldError(errors, 'location')}</p>
      ) : null}
      {fieldError(errors, 'accommodation_name') ? (
        <p className="text-sm text-red-600">{fieldError(errors, 'accommodation_name')}</p>
      ) : null}
      {fieldError(errors, 'star_rating') ? (
        <p className="text-sm text-red-600">{fieldError(errors, 'star_rating')}</p>
      ) : null}
    </div>
  )
}
