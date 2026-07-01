import { CalendarIcon } from '~/components/icons'
import DateRangeCalendar from './date_range_calendar'
import { fieldName, formatTripDate } from './field_bridge'
import TimeSelect from './time_select'

type DateRangePickerProps = {
  startKey: string
  endKey: string
  startValue: string
  endValue: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  minDate?: string
  showEnd?: boolean
  endPlaceholder?: string
  variant?: 'boxed' | 'inline'
}

export default function DateRangePicker({
  startKey,
  endKey,
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  minDate,
  showEnd = true,
  endPlaceholder = 'Add return trip',
  variant = 'boxed',
}: DateRangePickerProps) {
  return (
    <div className="flex min-w-0 flex-1 items-stretch">
      <input type="hidden" name={fieldName(startKey)} value={startValue} />
      {showEnd ? <input type="hidden" name={fieldName(endKey)} value={endValue} /> : null}

      <DateRangeCalendar
        startValue={startValue}
        endValue={endValue}
        showEnd={showEnd}
        minDate={minDate}
        startLabel={variant === 'inline' ? 'Check-in' : 'Depart'}
        endLabel={variant === 'inline' ? 'Check-out' : 'Return'}
        onChange={({ start, end }) => {
          onStartChange(start)
          onEndChange(end)
        }}
      >
        {({ toggle, nightsLabel }) => {
          const shellClass =
            variant === 'inline'
              ? 'flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-5 py-3 text-left'
              : 'flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 text-left'

          const inlineTopLabel = showEnd ? 'Dates' : 'Date'
          const inlineDateText = showEnd
            ? startValue && endValue
              ? `${formatTripDate(startValue)} - ${formatTripDate(endValue)}`
              : 'Select dates'
            : startValue
              ? formatTripDate(startValue)
              : 'Select date'

          return (
            <button type="button" onClick={toggle} className={shellClass}>
              <CalendarIcon className="h-5 w-5 shrink-0 text-slate-400" />
              {variant === 'inline' ? (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{inlineTopLabel}</span>
                    {nightsLabel ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {nightsLabel}
                      </span>
                    ) : null}
                  </div>
                  <span className="mt-0.5 block truncate text-sm font-semibold text-slate-900">
                    {inlineDateText}
                  </span>
                </div>
              ) : (
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <div className="min-w-[120px]">
                    <span className="block text-xs text-slate-500">Depart</span>
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {startValue ? formatTripDate(startValue) : 'Select date'}
                    </span>
                  </div>
                  {showEnd ? (
                    <>
                      <span className="text-slate-300">—</span>
                      <div className="min-w-[120px]">
                        <span className="block text-xs text-slate-500">Return</span>
                        <span className="block truncate text-sm font-semibold text-slate-900">
                          {endValue ? formatTripDate(endValue) : endPlaceholder}
                        </span>
                      </div>
                      {nightsLabel ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {nightsLabel}
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </div>
              )}
            </button>
          )
        }}
      </DateRangeCalendar>
    </div>
  )
}

type DateTimeRangeProps = {
  startDateKey: string
  startTimeKey: string
  endDateKey: string
  endTimeKey: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  onStartDateChange: (value: string) => void
  onStartTimeChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onEndTimeChange: (value: string) => void
  minDate?: string
  showReturn?: boolean
}

export function DateTimeRangeRow({
  startDateKey,
  startTimeKey,
  endDateKey,
  endTimeKey,
  startDate,
  startTime,
  endDate,
  endTime,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  minDate,
  showReturn = true,
}: DateTimeRangeProps) {
  return (
    <>
      <input type="hidden" name={fieldName(startDateKey)} value={startDate} />
      <input type="hidden" name={fieldName(startTimeKey)} value={startTime} />
      {showReturn ? (
        <>
          <input type="hidden" name={fieldName(endDateKey)} value={endDate} />
          <input type="hidden" name={fieldName(endTimeKey)} value={endTime} />
        </>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col justify-center rounded-xl border border-slate-300 px-4 py-3">
        <span className="text-xs text-slate-500">Pick-up</span>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <DateRangeCalendar
            startValue={startDate}
            endValue=""
            showEnd={false}
            minDate={minDate}
            startLabel="Pick-up date"
            onChange={({ start }) => onStartDateChange(start)}
          >
            {({ toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className="text-sm font-semibold text-slate-900 hover:text-[#2563eb]"
              >
                {startDate ? formatTripDate(startDate) : 'Select date'}
              </button>
            )}
          </DateRangeCalendar>
          <TimeSelect
            name={fieldName(startTimeKey)}
            value={startTime}
            onChange={onStartTimeChange}
            label="Pick-up time"
          />
        </div>
      </div>

      {showReturn ? (
        <div className="flex min-w-0 flex-1 flex-col justify-center rounded-xl border border-slate-300 px-4 py-3">
          <span className="text-xs text-slate-500">Drop-off</span>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <DateRangeCalendar
              startValue={endDate}
              endValue=""
              showEnd={false}
              minDate={startDate || minDate}
              startLabel="Drop-off date"
              onChange={({ start }) => onEndDateChange(start)}
            >
              {({ toggle }) => (
                <button
                  type="button"
                  onClick={toggle}
                  className="text-sm font-semibold text-slate-900 hover:text-[#2563eb]"
                >
                  {endDate ? formatTripDate(endDate) : 'Select date'}
                </button>
              )}
            </DateRangeCalendar>
            <TimeSelect
              name={fieldName(endTimeKey)}
              value={endTime}
              onChange={onEndTimeChange}
              label="Drop-off time"
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
