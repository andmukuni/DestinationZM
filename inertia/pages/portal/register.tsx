import { Form, Link } from '@adonisjs/inertia/react'
import { AuthLegalLinks } from '~/components/auth_legal_links'
import { AuthTurnstile } from '~/components/auth_turnstile'
import { Button } from '~/components/ui/button'

const fieldClass =
  'h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-600 focus:ring-2 focus:ring-orange-100'

export default function PortalRegister({
  turnstile,
}: {
  turnstile?: {
    enabled: boolean
    siteKey: string
  }
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Request portal access</h1>
        <p className="mt-2 text-sm text-slate-500">
          Submit your details and our team will review your request for a client portal account.
        </p>
      </div>

      <Form route="portal.register.store" className="space-y-5">
        {({ errors }) => (
          <>
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-600">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                autoComplete="name"
                placeholder="Jane Doe"
                className={`${fieldClass} ${errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
              />
              {errors.fullName ? <p className="text-sm text-red-600">{errors.fullName}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-600">
                Work email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={`${fieldClass} ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
              />
              {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="company" className="block text-sm font-medium text-slate-600">
                Company <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="company"
                type="text"
                name="company"
                autoComplete="organization"
                placeholder="Your organization"
                className={`${fieldClass} ${errors.company ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
              />
              {errors.company ? <p className="text-sm text-red-600">{errors.company}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-sm font-medium text-slate-600">
                Phone <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="+260 ..."
                className={`${fieldClass} ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
              />
              {errors.phone ? <p className="text-sm text-red-600">{errors.phone}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="message" className="block text-sm font-medium text-slate-600">
                Message <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                placeholder="Tell us about your travel needs or existing enquiries..."
                className={`${fieldClass} min-h-[96px] py-3 ${errors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
              />
              {errors.message ? <p className="text-sm text-red-600">{errors.message}</p> : null}
            </div>

            {turnstile?.enabled && turnstile.siteKey ? (
              <AuthTurnstile siteKey={turnstile.siteKey} />
            ) : null}

            <Button
              type="submit"
              loadingLabel="Submitting…"
              className="h-12 w-full rounded-lg border-transparent bg-orange-600 text-base font-semibold hover:bg-orange-700"
            >
              Submit request
            </Button>
          </>
        )}
      </Form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link route="portal.login" className="font-medium text-orange-600 hover:text-orange-700">
          Sign in
        </Link>
      </p>

      <AuthLegalLinks />
    </div>
  )
}
