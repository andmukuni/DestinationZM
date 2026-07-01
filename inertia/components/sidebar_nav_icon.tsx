import { type ComponentType } from 'react'

type SidebarNavIconProps = {
  icon: ComponentType<{ className?: string }>
  active?: boolean
}

export function SidebarNavIcon({ icon: Icon, active = false }: SidebarNavIconProps) {
  return (
    <span
      className={[
        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors',
        active ? 'bg-orange-600' : 'group-hover:bg-orange-600',
      ].join(' ')}
    >
      <Icon
        className={[
          'h-[18px] w-[18px] transition-colors',
          active ? 'text-white' : 'text-slate-900 group-hover:text-white',
        ].join(' ')}
      />
    </span>
  )
}
