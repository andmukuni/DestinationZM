import { useFormContext } from '@inertiajs/react'
import { type ButtonHTMLAttributes } from 'react'
import { Spinner } from '~/components/ui/spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800 border-transparent',
  secondary: 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-700 border-transparent hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

const spinnerTone: Record<Variant, 'light' | 'dark'> = {
  primary: 'light',
  secondary: 'dark',
  ghost: 'dark',
  danger: 'light',
}

const spinnerSize: Record<Size, 'sm' | 'md'> = {
  sm: 'sm',
  md: 'md',
  lg: 'md',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading: loadingProp,
  disabled,
  type = 'button',
  className = '',
  children,
  ...props
}: Props) {
  const formContext = useFormContext()
  const loading = loadingProp ?? (type === 'submit' && formContext?.processing === true)

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Spinner size={spinnerSize[size]} tone={spinnerTone[variant]} />
      ) : null}
      {children}
    </button>
  )
}
