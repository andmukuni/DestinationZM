import { useState } from 'react'
import { CalendarIcon, ChevronDownIcon, UserGroupIcon } from '~/components/icons'
import DateRangeCalendar from '../shared/date_range_calendar'
import {
  fieldError,
  fieldName,
  formatTripDate,
  getField,
  type TripFormProps,
} from '../shared/field_bridge'
import LocationCombobox from '../shared/location_combobox'
import SearchButton from '../shared/search_button'
import { TripSearchBar, TripSearchBarAction, TripSearchBarSection } from '../shared/trip_search_bar'

const DEFAULT_SERVICE_OPTIONS = [
  'Attractions & Tours',
  'Airport Transfers',
  'Travel Insurance',
  'Visa Assistance',
  'Lounge Access',
  'Excess Baggage',
  'Other',
]

export default function AncillariesEnquiryForm({ fields, errors, minDate }: TripFormProps) {
  const serviceField = getField(fields, 'service_type')
  const searchField = getField(fields, 'search_query')
  const serviceOptions = serviceField?.options ?? DEFAULT_SERVICE_OPTIONS

  const [serviceType, setServiceType] = useState(serviceOptions[0] ?? 'Attractions & Tours')
  const [searchQuery, setSearchQuery] = useState('')
  const [visitDate, setVisitDate] = useState('')
  const [passengers, setPassengers] = useState(1)
  const [notes, setNotes] = useState('')

  return (
    <div className="space-y-3">
      <TripSearchBar>
        <TripSearchBarSection className="lg:flex-[1.1]">
          <label className="relative flex min-w-0 flex-1 items-center gap-3">
            <ChevronDownIcon className="absolute right-0 h-4 w-4 text-slate-400" aria-hidden />
            <div className="min-w-0 flex-1">
              <span className="block text-xs text-slate-500">{serviceField?.label ?? 'Service type'}</span>
              <select
                name={fieldName('service_type')}
                value={serviceType}
                onChange={(event) => setServiceType(event.target.value)}
                className="mt-0.5 w-full appearance-none border-0 bg-transparent p-0 pr-5 text-sm font-semibold text-slate-900 outline-none"
              >
                {serviceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </TripSearchBarSection>

        <TripSearchBarSection className="lg:flex-[1.7]">
          <LocationCombobox
            fieldKey="search_query"
            value={searchQuery}
            onChange={setSearchQuery}
            kinds={['attraction', 'city', 'airport']}
            label={searchField?.label ?? 'Where / what'}
            placeholder={searchField?.placeholder ?? 'Destination, supplier, or service detail'}
            required
            variant="inline"
            className="min-w-0 flex-1"
          />
        </TripSearchBarSection>

        <TripSearchBarSection className="px-0 lg:flex-[1.1]">
          <DateInline
            label="Preferred date"
            value={visitDate}
            onChange={setVisitDate}
            minDate={minDate}
            dateKey="visit_date"
          />
        </TripSearchBarSection>

        <TripSearchBarSection className="lg:flex-[0.85]">
          <label className="flex min-w-0 flex-1 items-center gap-3">
            <UserGroupIcon className="h-5 w-5 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1">
              <span className="block text-xs text-slate-500">Travellers</span>
              <input
                type="number"
                min={1}
                name={fieldName('passengers')}
                value={passengers}
                onChange={(event) => setPassengers(Number(event.target.value))}
                className="mt-0.5 w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none"
              />
            </div>
          </label>
        </TripSearchBarSection>

        <TripSearchBarAction>
          <SearchButton integrated />
        </TripSearchBarAction>
      </TripSearchBar>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Additional notes</span>
        <textarea
          name={fieldName('notes')}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Pickup location, policy preferences, special requests…"
          rows={2}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
        />
      </label>

      {fieldError(errors, 'service_type') ? (
        <p className="text-sm text-red-600">{fieldError(errors, 'service_type')}</p>
      ) : null}
      {fieldError(errors, 'search_query') ? (
        <p className="text-sm text-red-600">{fieldError(errors, 'search_query')}</p>
      ) : null}
    </div>
  )
}

type DateInlineProps = {
  label: string
  value: string
  onChange: (value: string) => void
  minDate?: string
  dateKey: string
}

function DateInline({ label, value, onChange, minDate, dateKey }: DateInlineProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center">
      <input type="hidden" name={fieldName(dateKey)} value={value} />
      <DateRangeCalendar
        startValue={value}
        endValue=""
        showEnd={false}
        minDate={minDate}
        startLabel={label}
        onChange={({ start }) => onChange(start)}
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
                {value ? formatTripDate(value) : 'Any date'}
              </span>
            </span>
          </button>
        )}
      </DateRangeCalendar>
    </div>
  )
}
