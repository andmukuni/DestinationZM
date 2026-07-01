import { useEffect, useRef, useState } from 'react'
import { BellIcon } from '~/components/icons'

type NotificationItem = {
  id: number
  title: string
  body: string | null
  createdAtLabel: string
  isUnread: boolean
  actionUrl: string | null
}

type NotificationSummary = {
  unreadCount: number
  recent: NotificationItem[]
}

export function NotificationBell({ notifications }: { notifications: NotificationSummary }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const unreadCount = notifications.unreadCount

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
        aria-label="Notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
      >
        <BellIcon className="h-[18px] w-[18px]" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
          </div>
          {notifications.recent.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">No notifications yet.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notifications.recent.map((item) => (
                <li key={item.id} className="border-b border-slate-50 last:border-0">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    {item.body ? <p className="mt-0.5 text-sm text-slate-600">{item.body}</p> : null}
                    <p className="mt-1 text-xs text-slate-400">{item.createdAtLabel}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
