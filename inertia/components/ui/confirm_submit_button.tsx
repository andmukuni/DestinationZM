import { useFormContext } from '@inertiajs/react'
import { useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Button } from '~/components/ui/button'
import { ConfirmDialog } from '~/components/ui/confirm_dialog'

type ConfirmSubmitButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick'> & {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  confirmVariant?: 'primary' | 'danger'
  loading?: boolean
  loadingLabel?: string
  children: ReactNode
}

export function ConfirmSubmitButton({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  confirmVariant,
  loading: loadingProp,
  loadingLabel,
  children,
  disabled,
  className = '',
  size = 'md',
  ...props
}: ConfirmSubmitButtonProps) {
  const [open, setOpen] = useState(false)
  const submitRef = useRef<HTMLButtonElement>(null)
  const formContext = useFormContext()
  const loading = loadingProp ?? formContext?.processing === true
  const resolvedConfirmVariant = confirmVariant ?? (variant === 'danger' ? 'danger' : 'primary')

  function handleConfirm() {
    submitRef.current?.click()
  }

  return (
    <>
      <button ref={submitRef} type="submit" className="hidden" tabIndex={-1} aria-hidden />
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={disabled || loading}
        loadingLabel={loadingLabel}
        onClick={() => setOpen(true)}
        {...props}
      >
        {children}
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        variant={resolvedConfirmVariant}
        loading={loading}
      />
    </>
  )
}
