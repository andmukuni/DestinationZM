import { Link } from '@adonisjs/inertia/react'
import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { ChevronDownIcon } from '~/components/icons'
import { Button } from '~/components/ui/button'

function menuItemClassName(tone: 'default' | 'primary' | 'danger' = 'default') {
  return [
    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition',
    tone === 'danger'
      ? 'text-red-700 hover:bg-red-50 hover:text-red-800'
      : tone === 'primary'
        ? 'font-medium text-orange-700 hover:bg-orange-50 hover:text-orange-800'
        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
  ].join(' ')
}

type DropdownMenuProps = {
  label?: string
  align?: 'left' | 'right'
  children: ReactNode
}

export function DropdownMenu({ label = 'Actions', align = 'left', children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const closeMenu = () => setOpen(false)

  return (
    <div ref={menuRef} className="relative inline-flex">
      <Button
        type="button"
        variant="secondary"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        className="gap-1.5"
      >
        {label}
        <ChevronDownIcon className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className={[
            'absolute top-full z-30 mt-1 min-w-[12rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
          ].join(' ')}
          onClick={closeMenu}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

export function DropdownMenuItem({
  icon,
  children,
  tone = 'default',
  ...props
}: {
  icon?: ReactNode
  children: ReactNode
  tone?: 'default' | 'danger'
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" role="menuitem" className={menuItemClassName(tone)} {...props}>
      {icon ? <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">{icon}</span> : null}
      {children}
    </button>
  )
}

type DropdownMenuLinkProps = {
  icon?: ReactNode
  tone?: 'default' | 'primary' | 'danger'
  children: ReactNode
} & (
  | { href: string; route?: never; routeParams?: never }
  | { href?: never; route: string; routeParams?: Record<string, string | number> }
)

export function DropdownMenuLink({
  href,
  route,
  routeParams,
  icon,
  tone = 'default',
  children,
}: DropdownMenuLinkProps) {
  const className = menuItemClassName(tone)
  const content = (
    <>
      {icon ? (
        <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">{icon}</span>
      ) : null}
      {children}
    </>
  )

  if (route) {
    return (
      <Link route={route} routeParams={routeParams} role="menuitem" className={className}>
        {content}
      </Link>
    )
  }

  return (
    <a href={href} role="menuitem" className={className}>
      {content}
    </a>
  )
}

export function DropdownMenuSeparator() {
  return <div role="separator" className="my-1 border-t border-slate-200" />
}

export function dropdownMenuItemClassName(tone: 'default' | 'primary' | 'danger' = 'default') {
  return menuItemClassName(tone)
}

export function dropdownMenuFormItemClassName(tone: 'default' | 'danger' = 'default') {
  return [
    'h-auto w-full justify-start rounded-none border-0 px-3 py-2 text-sm font-normal shadow-none',
    tone === 'danger'
      ? 'text-red-700 hover:bg-red-50 hover:text-red-800'
      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
  ].join(' ')
}
