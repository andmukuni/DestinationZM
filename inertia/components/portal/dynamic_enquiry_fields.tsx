import type { PortalBookingFieldDefinition } from '#types/portal_booking_type'

const fieldClass =
  'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100'

type DynamicEnquiryFieldsProps = {
  fields: PortalBookingFieldDefinition[]
  errors?: Record<string, string>
  minDate?: string
}

function errorKey(fieldKey: string) {
  return `fields.${fieldKey}`
}

export default function DynamicEnquiryFields({
  fields,
  errors = {},
  minDate,
}: DynamicEnquiryFieldsProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((field) => {
        const name = `fields[${field.fieldKey}]`
        const error = errors[errorKey(field.fieldKey)]

        return (
          <div
            key={field.id}
            className={`space-y-1.5 ${field.fieldType === 'textarea' ? 'sm:col-span-2' : ''}`}
          >
            <label htmlFor={field.fieldKey} className="text-sm font-medium text-slate-600">
              {field.label}
              {field.required ? <span className="text-red-600"> *</span> : null}
            </label>

            {field.fieldType === 'textarea' ? (
              <textarea
                id={field.fieldKey}
                name={name}
                rows={4}
                placeholder={field.placeholder ?? undefined}
                required={field.required}
                className={`${fieldClass} h-auto py-2`}
              />
            ) : field.fieldType === 'select' ? (
              <select id={field.fieldKey} name={name} required={field.required} className={fieldClass}>
                <option value="">Select…</option>
                {(field.options ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.fieldKey}
                name={name}
                type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                min={field.fieldType === 'number' ? 0 : field.fieldType === 'date' ? minDate : undefined}
                placeholder={field.placeholder ?? undefined}
                required={field.required}
                className={fieldClass}
              />
            )}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
        )
      })}
    </div>
  )
}
