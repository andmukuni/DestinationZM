import { useFormContext } from '@inertiajs/react'
import { useRef, useState, type ReactNode } from 'react'
import { ConfirmDialog } from '~/components/ui/confirm_dialog'
import { TableIconButton, type TableIconButtonVariant } from '~/components/ui/table_icon_button'

type ConfirmTableIconSubmitProps = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'primary' | 'danger'
  label: string
  variant?: TableIconButtonVariant
  loading?: boolean
  children: ReactNode
}

export function ConfirmTableIconSubmit({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  label,
  variant = 'secondary',
  loading: loadingProp,
  children,
}: ConfirmTableIconSubmitProps) {
  const [open, setOpen] = useState(false)
  const submitRef = useRef<HTMLButtonElement>(null)
  const formContext = useFormContext()
  const loading = loadingProp ?? formContext?.processing === true

  return (
    <>
      <button ref={submitRef} type="submit" className="hidden" tabIndex={-1} aria-hidden />
      <TableIconButton
        type="button"
        label={label}
        variant={variant}
        loading={loading}
        onClick={() => setOpen(true)}
      >
        {children}
      </TableIconButton>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => submitRef.current?.click()}
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
