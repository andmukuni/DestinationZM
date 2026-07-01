import { type ReactNode } from 'react'
import { Link } from '@adonisjs/inertia/react'

type LegalDocumentProps = {
  title: string
  lastUpdated: string
  children: ReactNode
}

export function LegalDocument({ title, lastUpdated, children }: LegalDocumentProps) {
  return (
    <article className="space-y-6">
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-orange-600">Legal</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        <p className="text-sm text-slate-500">Last updated: {lastUpdated}</p>
      </header>

      <div className="space-y-4 text-sm leading-relaxed text-slate-600 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-900 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_a]:font-medium [&_a]:text-orange-600 [&_a]:hover:text-orange-700">
        {children}
      </div>

      <footer className="border-t border-slate-200 pt-6 text-sm text-slate-500">
        Return to{' '}
        <Link route="session.create" className="font-medium text-orange-600 hover:text-orange-700">
          staff sign in
        </Link>{' '}
        or{' '}
        <Link route="portal.login" className="font-medium text-orange-600 hover:text-orange-700">
          client portal
        </Link>
      </footer>
    </article>
  )
}
