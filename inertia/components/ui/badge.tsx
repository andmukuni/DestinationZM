import { type ReactNode } from 'react'

type Tone = 'default' | 'success' | 'warning' | 'danger' | 'info'

const toneClasses: Record<Tone, string> = {
  default: 'bg-slate-100 text-slate-700 ring-slate-200',
  success: 'bg-orange-50 text-orange-800 ring-orange-200',
  warning: 'bg-amber-50 text-amber-900 ring-amber-200',
  danger: 'bg-red-50 text-red-800 ring-red-200',
  info: 'bg-sky-50 text-sky-800 ring-sky-200',
}

export function Badge({
  children,
  tone = 'default',
  className = '',
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
