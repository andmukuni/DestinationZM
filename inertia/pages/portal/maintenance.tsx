import { Link } from '@adonisjs/inertia/react'

export default function PortalMaintenance() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-7 w-7"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Zm8.25-3.75a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Zm0 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Portal under maintenance
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          The client portal is temporarily unavailable while we perform scheduled maintenance.
          Please check back soon or contact your travel agent if you need urgent assistance.
        </p>
      </div>
      <p className="text-xs text-slate-400">Staff can continue using the admin area as usual.</p>
    </div>
  )
}
