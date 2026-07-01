import { Form } from '@adonisjs/inertia/react'
import { useState } from 'react'
import { EyeIcon } from '~/components/icons'
import { brandButtonPrimaryClass, brandInputFocusClass } from '~/lib/brand_theme'
import { Button } from '~/components/ui/button'

function EyeSlashIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
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
  `h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${brandInputFocusClass}`

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to your staff account to continue.</p>
      </div>

      <Form route="session.store" className="space-y-5">
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
                aria-invalid={errors.email ? true : undefined}
              />
              {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-600">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  className={`${fieldClass} pr-12 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
                  aria-invalid={errors.password ? true : undefined}
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
              className={`h-12 w-full rounded-lg border-transparent text-base font-semibold text-white ${brandButtonPrimaryClass}`}
            >
              Sign in
            </Button>
          </>
        )}
      </Form>
    </div>
  )
}
