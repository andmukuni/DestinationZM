import { Form, Link } from '@adonisjs/inertia/react'
import { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon, LogOutIcon, SettingsIcon, UserCircleIcon } from '~/components/icons'
import { Button } from '~/components/ui/button'
import { UserAvatar } from '~/components/ui/user_avatar'
import { type Data } from '@generated/data'

type SharedUser = NonNullable<Data.SharedProps['user']>

function menuItemClassName() {
  return 'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900'
}

export function UserMenu({ user }: { user: SharedUser }) {
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

  const closeMenu = () => setOpen(false)

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg px-1 py-1 transition hover:bg-slate-50 sm:px-2"
      >
        <div className="hidden max-w-[9.5rem] text-right sm:block">
          <p className="truncate text-xs font-medium leading-tight text-slate-900">{user.fullName}</p>
          <p className="truncate text-[11px] leading-tight text-slate-500">
            {user.roleLabel}
            {user.branchName ? ` · ${user.branchName}` : ''}
          </p>
        </div>
        <UserAvatar initials={user.initials} />
        <ChevronDownIcon
          className={`hidden h-3.5 w-3.5 shrink-0 text-slate-400 transition sm:block ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <Link route="user_settings" className={menuItemClassName()} onClick={closeMenu} role="menuitem">
            <SettingsIcon />
            User Settings
          </Link>
          <Link route="profile" className={menuItemClassName()} onClick={closeMenu} role="menuitem">
            <UserCircleIcon />
            Profile
          </Link>
          <Form route="session.destroy" className="border-t border-slate-200 pt-1">
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
                Logout
              </Button>
            )}
          </Form>
        </div>
      ) : null}
    </div>
  )
}
