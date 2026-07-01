import { Form, Link } from '@adonisjs/inertia/react'
import { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon, LogOutIcon, UsersIcon } from '~/components/icons'
import { Button } from '~/components/ui/button'
import { UserAvatar } from '~/components/ui/user_avatar'

type PortalSession = {
  organization: { id: number; name: string; company: string | null }
  user: {
    name: string
    email: string
    role: string
    roleLabel: string
    initials: string
  }
  privileges?: string[]
  canManageUsers?: boolean
}

export function PortalUserMenu({ client }: { client: PortalSession }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg px-1 py-1 transition hover:bg-slate-50 sm:px-2"
      >
        <div className="hidden max-w-[11rem] text-right sm:block">
          <p className="truncate text-xs font-medium leading-tight text-slate-900">{client.user.name}</p>
          <p className="truncate text-[11px] leading-tight text-slate-500">{client.organization.name}</p>
        </div>
        <UserAvatar initials={client.user.initials} className="bg-slate-900" />
        <ChevronDownIcon
          className={`hidden h-3.5 w-3.5 shrink-0 text-slate-400 transition sm:block ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-slate-100 px-3 py-2 sm:hidden">
            <p className="text-sm font-medium text-slate-900">{client.user.name}</p>
            <p className="truncate text-xs text-slate-500">{client.user.email}</p>
            <p className="mt-0.5 truncate text-[11px] text-slate-400">{client.organization.name}</p>
          </div>
          {client.canManageUsers || client.privileges?.includes('view_team') ? (
            <Link
              route="portal.users"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm font-normal text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              <UsersIcon className="h-4 w-4 shrink-0 text-slate-400" />
              User management
            </Link>
          ) : null}
          <Form route="portal.logout" className="border-t border-slate-100 pt-1">
            {({ processing }) => (
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                loading={processing}
                className="h-auto w-full justify-start rounded-none border-0 px-3 py-2 text-sm font-normal text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                role="menuitem"
              >
                <LogOutIcon />
                Sign out
              </Button>
            )}
          </Form>
        </div>
      ) : null}
    </div>
  )
}
