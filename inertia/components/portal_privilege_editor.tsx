import { useMemo, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'

type PrivilegeGroup = {
  id: string
  label: string
  description: string
  privileges: Array<{
    key: string
    label: string
    description: string
    enabled: boolean
  }>
}

type Preset = {
  id: string
  label: string
  description: string
  privileges: string[]
}

type PortalPrivilegeEditorProps = {
  groups: PrivilegeGroup[]
  presets: Preset[]
  selected: string[]
  assignable: string[]
  disabled?: boolean
  readOnlyMessage?: string
}

function Toggle({
  checked,
  disabled,
  onChange,
  label,
  description,
}: {
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
  label: string
  description: string
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition ${
        checked ? 'border-orange-200 bg-orange-50/60' : 'border-slate-200 bg-white hover:border-slate-300'
      } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{description}</span>
      </span>
    </label>
  )
}

export function PortalPrivilegeEditor({
  groups,
  presets,
  selected,
  assignable,
  disabled = false,
  readOnlyMessage,
}: PortalPrivilegeEditorProps) {
  const assignableSet = useMemo(() => new Set(assignable), [assignable])
  const [privileges, setPrivileges] = useState<string[]>(selected)

  function togglePrivilege(key: string, enabled: boolean) {
    if (disabled || !assignableSet.has(key)) {
      return
    }
    setPrivileges((current) =>
      enabled ? [...new Set([...current, key])] : current.filter((item) => item !== key)
    )
  }

  function applyPreset(preset: Preset) {
    if (disabled) return
    setPrivileges(preset.privileges.filter((key) => assignableSet.has(key)))
  }

  return (
    <div className="space-y-6">
      {readOnlyMessage ? (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          {readOnlyMessage}
        </div>
      ) : null}

      {!disabled ? (
        <div>
          <p className="text-sm font-medium text-slate-900">Quick presets</p>
          <p className="mt-1 text-xs text-slate-500">Apply a common access profile, then fine-tune below.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button key={preset.id} type="button" size="sm" variant="secondary" onClick={() => applyPreset(preset)}>
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {privileges.map((privilege) => (
        <input key={privilege} type="hidden" name="privileges[]" value={privilege} />
      ))}

      {groups.map((group) => (
        <Card key={group.id}>
          <CardHeader title={group.label} description={group.description} />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            {group.privileges.map((privilege) => {
              const canAssign = assignableSet.has(privilege.key)
              const checked = disabled ? privilege.enabled : privileges.includes(privilege.key)

              return (
                <Toggle
                  key={privilege.key}
                  checked={checked}
                  disabled={disabled || !canAssign}
                  onChange={(enabled) => togglePrivilege(privilege.key, enabled)}
                  label={privilege.label}
                  description={privilege.description}
                />
              )
            })}
          </CardBody>
        </Card>
      ))}

      {!disabled ? (
        <p className="text-xs text-slate-500">
          {privileges.length} privilege{privileges.length === 1 ? '' : 's'} selected
        </p>
      ) : null}
    </div>
  )
}
