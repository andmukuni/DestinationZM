import { Link } from '@adonisjs/inertia/react'

export function AuthLegalLinks() {
  return (
    <p className="text-center text-xs text-slate-400">
      <Link route="legal.eula" className="hover:text-slate-600">
        End-User License Agreement
      </Link>
      <span aria-hidden className="mx-1.5">
        ·
      </span>
      <Link route="legal.privacy" className="hover:text-slate-600">
        Privacy Policy
      </Link>
    </p>
  )
}
