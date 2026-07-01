import type { ReactNode } from 'react'

type IconLinkProps = {
  href: string
  label: string
  children: ReactNode
  onClick?: (event: React.MouseEvent) => void
}

const iconLinkClassName =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'

export function IconLink({ href, label, children, onClick }: IconLinkProps) {
  return (
    <a href={href} className={iconLinkClassName} aria-label={label} title={label} onClick={onClick}>
      {children}
    </a>
  )
}
