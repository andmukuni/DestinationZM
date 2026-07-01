import { Form, Link } from '@adonisjs/inertia/react'
import { useState } from 'react'
import { EyeIcon } from '~/components/icons'
import { Button } from '~/components/ui/button'

function EyeSlashIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.092 1.093a4 4 0 0 0-5.558-5.558Z"
        clipRule="evenodd"
      />
      <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
    </svg>
  )
}

const fieldClass =
  'h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-600 focus:ring-2 focus:ring-orange-100'

export default function PortalLogin({
  allowPortalRegistration = false,
}: {
  allowPortalRegistration?: boolean
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Client portal</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to review quotations, confirm reports, and pay invoices.
        </p>
      </div>

      <Form route="portal.login.store" className="space-y-5">
        {({ errors }) => (
          <>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-600">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="username"
                placeholder="you@example.com"
                className={`${fieldClass} ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
              />
              {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-600">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  className={`${fieldClass} pr-12 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {errors.password ? <p className="text-sm text-red-600">{errors.password}</p> : null}
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-lg border-transparent bg-orange-600 text-base font-semibold hover:bg-orange-700"
            >
              Sign in
            </Button>

            {allowPortalRegistration ? (
              <p className="text-center text-sm text-slate-500">
                Need portal access?{' '}
                <Link
                  route="portal.register"
                  className="font-medium text-orange-600 hover:text-orange-700"
                >
                  Request an account
                </Link>
              </p>
            ) : null}
          </>
        )}
      </Form>
    </div>
  )
}
