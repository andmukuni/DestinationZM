import { useState } from 'react'
import DateRangePicker from '../shared/date_range_picker'
import {
  defaultDateOffset,
  fieldError,
  fieldName,
  getField,
  type TripFormProps,
} from '../shared/field_bridge'
import LocationCombobox from '../shared/location_combobox'
import { PassengerClassPopover } from '../shared/room_guest_popover'
import SearchButton from '../shared/search_button'
import SwapButton from '../shared/swap_button'
import { TripSearchBar, TripSearchBarAction, TripSearchBarSection } from '../shared/trip_search_bar'

export default function FlightsEnquiryForm({ fields, errors, minDate }: TripFormProps) {
  const tripTypeField = getField(fields, 'trip_type')
  const classField = getField(fields, 'travel_class')
  const tripOptions = tripTypeField?.options ?? ['Round-trip', 'One-way', 'Multi-city']
  const classOptions = classField?.options ?? ['Economy', 'Premium economy', 'Business', 'First']

  const [tripType, setTripType] = useState(tripOptions[0] ?? 'Round-trip')
  const [nonstop, setNonstop] = useState(false)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departDate, setDepartDate] = useState(defaultDateOffset(3))
  const [returnDate, setReturnDate] = useState(defaultDateOffset(5))
  const [passengers, setPassengers] = useState(1)
  const [travelClass, setTravelClass] = useState(classOptions[0] ?? 'Economy')

  const showReturn = tripType !== 'One-way'

  function swapOriginDestination() {
    setOrigin(destination)
    setDestination(origin)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-slate-100 pb-2.5">
        <div className="flex flex-wrap gap-4">
          {tripOptions.map((option) => (
            <label key={option} className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name={fieldName('trip_type')}
                value={option}
                checked={tripType === option}
                onChange={() => setTripType(option)}
                className="text-[#2563eb]"
              />
              {option}
            </label>
          ))}
        </div>
        <label className="ml-auto inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name={fieldName('nonstop')}
            value="Yes"
            checked={nonstop}
            onChange={(event) => setNonstop(event.target.checked)}
            className="rounded border-slate-300 text-[#2563eb]"
          />
          Nonstop only
        </label>
      </div>

      <TripSearchBar>
        <TripSearchBarSection className="lg:flex-[1.25]">
          <LocationCombobox
            fieldKey="origin"
            value={origin}
            onChange={setOrigin}
            kinds={['airport', 'city']}
            label="From"
            placeholder="City or airport"
            required
            variant="inline"
            className="min-w-0 flex-1"
          />
          <div className="relative -ml-3 mr-[-30px] hidden h-9 w-9 shrink-0 items-center justify-center lg:flex">
            <SwapButton onSwap={swapOriginDestination} />
          </div>
        </TripSearchBarSection>

        <TripSearchBarSection className="lg:flex-[1.25]">
          <LocationCombobox
            fieldKey="destination"
            value={destination}
            onChange={setDestination}
            kinds={['airport', 'city']}
            label="To"
            placeholder="City or airport"
            required
            variant="inline"
            className="min-w-0 flex-1"
          />
        </TripSearchBarSection>

        <TripSearchBarSection className="px-0 lg:flex-[1.4]">
          <DateRangePicker
            startKey="depart_date"
            endKey="return_date"
            startValue={departDate}
            endValue={returnDate}
            onStartChange={setDepartDate}
            onEndChange={setReturnDate}
            minDate={minDate}
            showEnd={showReturn}
            endPlaceholder={showReturn ? 'Add return' : 'One-way'}
            variant="inline"
          />
        </TripSearchBarSection>

        <TripSearchBarSection className="px-0 lg:flex-[1.5]">
          <PassengerClassPopover
            variant="inline"
            enableTravelerNames
            passengers={passengers}
            travelClass={travelClass}
            classOptions={classOptions}
            onChange={({ passengers: nextPassengers, travelClass: nextClass }) => {
              setPassengers(nextPassengers)
              setTravelClass(nextClass)
            }}
          />
        </TripSearchBarSection>

        <TripSearchBarAction>
          <SearchButton integrated />
        </TripSearchBarAction>
      </TripSearchBar>

      <div className="flex justify-center lg:hidden">
        <SwapButton onSwap={swapOriginDestination} />
      </div>

      {(fieldError(errors, 'origin') || fieldError(errors, 'destination')) && (
        <p className="text-sm text-red-600">
          {fieldError(errors, 'origin') ?? fieldError(errors, 'destination')}
        </p>
      )}
    </div>
  )
}
