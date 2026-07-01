import { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { Spinner } from '~/components/ui/spinner'

export type TableIconButtonVariant = 'primary' | 'secondary' | 'danger'

const variantClasses: Record<TableIconButtonVariant, string> = {
  primary: 'border-transparent bg-orange-600 text-white hover:bg-orange-700',
  secondary: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900',
  danger: 'border-red-200 bg-white text-red-600 hover:bg-red-50',
}

export function tableIconButtonClass(variant: TableIconButtonVariant = 'secondary', className = '') {
  return [
    'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

type TableIconButtonProps = {
  label: string
  variant?: TableIconButtonVariant
  className?: string
  loading?: boolean
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export function TableIconButton({
  label,
  variant = 'secondary',
  className = '',
  loading = false,
  children,
  type = 'button',
  disabled,
  ...props
}: TableIconButtonProps) {
  return (
    <button
      type={type}
      title={label}
      aria-label={label}
      aria-busy={loading ? true : undefined}
      disabled={disabled || loading}
      className={tableIconButtonClass(variant, className)}
      {...props}
    >
      {loading ? <Spinner size="sm" tone={variant === 'primary' ? 'light' : 'dark'} /> : children}
    </button>
  )
}

export function TableActions({
  children,
  className = '',
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`inline-flex flex-nowrap items-center justify-end gap-1.5 ${className}`} {...props}>
      {children}
    </div>
  )
}
