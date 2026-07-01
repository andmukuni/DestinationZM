import { useFormContext } from '@inertiajs/react'
import { useRef, useState, type ReactNode } from 'react'
import { ConfirmDialog } from '~/components/ui/confirm_dialog'
import { Spinner } from '~/components/ui/spinner'
import { dropdownMenuItemClassName } from '~/components/ui/dropdown_menu'

type ConfirmDropdownSubmitProps = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'primary' | 'danger'
  tone?: 'default' | 'primary' | 'danger'
  icon?: ReactNode
  loading?: boolean
  children: ReactNode
}

export function ConfirmDropdownSubmit({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  tone = 'primary',
  icon,
  loading: loadingProp,
  children,
}: ConfirmDropdownSubmitProps) {
  const [open, setOpen] = useState(false)
  const submitRef = useRef<HTMLButtonElement>(null)
  const formContext = useFormContext()
  const loading = loadingProp ?? formContext?.processing === true

  function handleConfirm() {
    submitRef.current?.click()
  }

  return (
    <>
      <button ref={submitRef} type="submit" className="hidden" tabIndex={-1} aria-hidden />
      <button
        type="button"
        role="menuitem"
        disabled={loading}
        aria-busy={loading || undefined}
        className={dropdownMenuItemClassName(tone)}
        onClick={(event) => {
          event.stopPropagation()
          setOpen(true)
        }}
      >
        {loading ? (
          <Spinner size="sm" tone="dark" />
        ) : icon ? (
          <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">{icon}</span>
        ) : null}
        {loading ? 'Processing…' : children}
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        variant={confirmVariant}
        loading={loading}
      />
    </>
  )
}
