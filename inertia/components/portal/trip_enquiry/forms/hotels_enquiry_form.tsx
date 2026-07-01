import { useState } from 'react'
import DateRangePicker from '../shared/date_range_picker'
import {
  defaultDateOffset,
  fieldError,
  getField,
  type TripFormProps,
} from '../shared/field_bridge'
import LocationCombobox from '../shared/location_combobox'
import RoomGuestPopover from '../shared/room_guest_popover'
import SearchButton from '../shared/search_button'
import { TripSearchBar, TripSearchBarAction, TripSearchBarSection } from '../shared/trip_search_bar'

export default function HotelsEnquiryForm({ fields, errors, minDate }: TripFormProps) {
  const locationField = getField(fields, 'location')
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState(defaultDateOffset(1))
  const [checkOut, setCheckOut] = useState(defaultDateOffset(2))
  const [rooms, setRooms] = useState(1)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  return (
    <div className="space-y-2">
      <TripSearchBar>
        <TripSearchBarSection className="lg:flex-[1.25] xl:flex-[1.3]">
          <LocationCombobox
            fieldKey="location"
            value={location}
            onChange={setLocation}
            kinds={['city', 'attraction']}
            label={locationField?.label ?? 'Where to?'}
            placeholder={locationField?.placeholder ?? 'City, hotel, or region'}
            required={Boolean(locationField?.required)}
            variant="inline"
            className="min-w-0 flex-1"
          />
        </TripSearchBarSection>

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
      </TripSearchBar>

      {fieldError(errors, 'location') ? (
        <p className="text-sm text-red-600">{fieldError(errors, 'location')}</p>
      ) : null}
    </div>
  )
}
