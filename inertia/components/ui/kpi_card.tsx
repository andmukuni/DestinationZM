import { Link } from '@adonisjs/inertia/react'
import { type ComponentType, type ReactNode } from 'react'

type KpiCardVariant = 'accent' | 'dark'

type KpiCardProps = {
  label: string
  value: ReactNode
  subValue?: ReactNode
  trend?: string
  icon: ComponentType<{ className?: string }>
  variant?: KpiCardVariant
  contextTone?: 'default' | 'warning' | 'danger'
  href?: string
}

const variantStyles: Record<
  KpiCardVariant,
  { card: string; icon: string; context: string; contextWarning: string; contextDanger: string }
> = {
  accent: {
    card: 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm shadow-orange-500/20',
    icon: 'bg-white text-orange-600',
    context: 'text-white/90',
    contextWarning: 'text-orange-100',
    contextDanger: 'text-orange-50',
  },
  dark: {
    card: 'bg-slate-900 shadow-sm shadow-slate-900/20',
    icon: 'bg-white text-slate-900',
    context: 'text-white/80',
    contextWarning: 'text-amber-300',
    contextDanger: 'text-rose-300',
  },
}

function contextClassName(variant: KpiCardVariant, tone: KpiCardProps['contextTone']) {
  const styles = variantStyles[variant]
  if (tone === 'warning') return styles.contextWarning
  if (tone === 'danger') return styles.contextDanger
  return styles.context
}

function KpiCardContent({
  label,
  value,
  subValue,
  trend,
  icon: Icon,
  variant = 'dark',
  contextTone = 'default',
}: Omit<KpiCardProps, 'href'>) {
  const styles = variantStyles[variant]
  const context = trend ?? subValue

  return (
    <div className={`relative flex h-full min-h-[5.75rem] flex-col rounded-xl p-3.5 ${styles.card}`}>
      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${styles.icon}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        {context ? (
          <span className={`pt-0.5 text-right text-xs font-semibold ${contextClassName(variant, contextTone)}`}>
            {context}
          </span>
        ) : null}
      </div>

      <div className="mt-auto pt-2">
        <p className="text-xl font-bold tracking-tight text-white">{value}</p>
        <p className="mt-0.5 text-xs font-medium text-white/85">{label}</p>
      </div>
    </div>
  )
}

export function KpiCard({
  label,
  value,
  subValue,
  trend,
  icon,
  variant = 'dark',
  contextTone = 'default',
  href,
}: KpiCardProps) {
  if (href) {
    return (
      <Link
        href={href}
        className="group block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
      >
        <div className="h-full transition group-hover:scale-[1.01] group-hover:shadow-md">
          <KpiCardContent
            label={label}
            value={value}
            subValue={subValue}
            trend={trend}
            icon={icon}
            variant={variant}
            contextTone={contextTone}
          />
        </div>
      </Link>
    )
  }

  return (
    <KpiCardContent
      label={label}
      value={value}
      subValue={subValue}
      trend={trend}
      icon={icon}
      variant={variant}
      contextTone={contextTone}
    />
  )
}
