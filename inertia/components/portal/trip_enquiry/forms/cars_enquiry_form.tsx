import { useState } from 'react'
import { CalendarIcon } from '~/components/icons'
import DateRangeCalendar from '../shared/date_range_calendar'
import {
  defaultDateOffset,
  fieldError,
  fieldName,
  formatTripDate,
  getField,
  type TripFormProps,
} from '../shared/field_bridge'
import LocationCombobox from '../shared/location_combobox'
import SearchButton from '../shared/search_button'
import TimeSelect, { defaultTimeValue } from '../shared/time_select'
import { TripSearchBar, TripSearchBarAction, TripSearchBarSection } from '../shared/trip_search_bar'

export default function CarsEnquiryForm({ fields, errors, minDate }: TripFormProps) {
  const serviceField = getField(fields, 'service_type')
  const licenseField = getField(fields, 'license_country')
  const ageField = getField(fields, 'driver_age')
  const serviceOptions = serviceField?.options ?? ['Car Rentals', 'Airport Transfers']
  const licenseOptions = licenseField?.options ?? ['Zambia']
  const ageOptions = ageField?.options ?? ['30-60']

  const [serviceType, setServiceType] = useState(serviceOptions[0] ?? 'Car Rentals')
  const [differentDropoff, setDifferentDropoff] = useState(false)
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')
  const [pickupDate, setPickupDate] = useState(defaultDateOffset(3))
  const [pickupTime, setPickupTime] = useState(defaultTimeValue())
  const [returnDate, setReturnDate] = useState(defaultDateOffset(6))
  const [returnTime, setReturnTime] = useState(defaultTimeValue())
  const [licenseCountry, setLicenseCountry] = useState(licenseOptions[0] ?? 'Zambia')
  const [driverAge, setDriverAge] = useState(ageOptions[0] ?? '30-60')

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-slate-100 pb-2.5">
        <div className="flex gap-4">
          {serviceOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setServiceType(option)}
              className={`border-b-2 pb-1.5 text-sm font-semibold transition ${
                serviceType === option
                  ? 'border-[#2563eb] text-[#2563eb]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {option}
            </button>
          ))}
          <input type="hidden" name={fieldName('service_type')} value={serviceType} />
        </div>

        <label className="ml-auto inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            name={fieldName('different_dropoff')}
            value="Yes"
            checked={differentDropoff}
            onChange={(event) => setDifferentDropoff(event.target.checked)}
            className="rounded border-slate-300 text-[#2563eb]"
          />
          Drop off at a different location
        </label>
      </div>

      <TripSearchBar>
        <TripSearchBarSection className="lg:flex-[1.25] xl:flex-[1.3]">
          <LocationCombobox
            fieldKey="pickup_location"
            value={pickupLocation}
            onChange={setPickupLocation}
            kinds={['airport', 'city']}
            label="Pick-up"
            placeholder="Airport, city, region…"
            required
            variant="inline"
            className="min-w-0 flex-1"
          />
        </TripSearchBarSection>

        <TripSearchBarSection className="px-0 lg:flex-[1.1]">
          <DateTimeInline
            dateKey="pickup_date"
            timeKey="pickup_time"
            label="Pick-up"
            date={pickupDate}
            time={pickupTime}
            onDateChange={setPickupDate}
            onTimeChange={setPickupTime}
            minDate={minDate}
            dateLabel="Pick-up date"
            timeLabel="Pick-up time"
          />
        </TripSearchBarSection>

        <TripSearchBarSection className="px-0 lg:flex-[1.1]">
          <DateTimeInline
            dateKey="return_date"
            timeKey="return_time"
            label="Drop-off"
            date={returnDate}
            time={returnTime}
            onDateChange={setReturnDate}
            onTimeChange={setReturnTime}
            minDate={pickupDate || minDate}
            dateLabel="Drop-off date"
            timeLabel="Drop-off time"
          />
        </TripSearchBarSection>

        <TripSearchBarAction>
          <SearchButton integrated />
        </TripSearchBarAction>
      </TripSearchBar>

      {differentDropoff ? (
        <div className="rounded-xl border border-slate-300 px-4 py-2.5">
          <LocationCombobox
            fieldKey="dropoff_location"
            value={dropoffLocation}
            onChange={setDropoffLocation}
            kinds={['airport', 'city']}
            label="Drop-off location"
            placeholder="Same as pick-up if blank"
          />
        </div>
      ) : (
        <input type="hidden" name={fieldName('dropoff_location')} value="" />
      )}

      <div className="flex flex-wrap gap-4 pt-1">
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          Driver&apos;s license country/region
          <select
            name={fieldName('license_country')}
            value={licenseCountry}
            onChange={(event) => setLicenseCountry(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          >
            {licenseOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          Age
          <select
            name={fieldName('driver_age')}
            value={driverAge}
            onChange={(event) => setDriverAge(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          >
            {ageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {fieldError(errors, 'pickup_location') ? (
        <p className="text-sm text-red-600">{fieldError(errors, 'pickup_location')}</p>
      ) : null}
    </div>
  )
}

type DateTimeInlineProps = {
  dateKey: string
  timeKey: string
  label: string
  date: string
  time: string
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
  minDate?: string
  dateLabel: string
  timeLabel: string
}

function DateTimeInline({
  dateKey,
  timeKey,
  label,
  date,
  time,
  onDateChange,
  onTimeChange,
  minDate,
  dateLabel,
  timeLabel,
}: DateTimeInlineProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 pr-3">
      <input type="hidden" name={fieldName(dateKey)} value={date} />
      <DateRangeCalendar
        startValue={date}
        endValue=""
        showEnd={false}
        minDate={minDate}
        startLabel={dateLabel}
        onChange={({ start }) => onDateChange(start)}
      >
        {({ toggle }) => (
          <button
            type="button"
            onClick={toggle}
            className="flex min-w-0 flex-1 items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-50"
          >
            <CalendarIcon className="h-5 w-5 shrink-0 text-slate-400" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-slate-500">{label}</span>
              <span className="block truncate text-sm font-semibold text-slate-900">
                {date ? formatTripDate(date) : 'Select date'}
              </span>
            </span>
          </button>
        )}
      </DateRangeCalendar>
      <TimeSelect name={fieldName(timeKey)} value={time} onChange={onTimeChange} label={timeLabel} />
    </div>
  )
}
