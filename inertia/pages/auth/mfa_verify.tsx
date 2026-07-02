import { Form } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { brandButtonPrimaryClass, brandInputFocusClass } from '~/lib/brand_theme'

const fieldClass = `h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-center text-lg tracking-[0.35em] text-slate-900 outline-none transition placeholder:text-slate-400 placeholder:tracking-normal ${brandInputFocusClass}`

export default function MfaVerify() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Two-factor authentication
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter the 6-digit code from your authenticator app to finish signing in.
        </p>
      </div>

      <Form action="/login/mfa" method="post" className="space-y-5">
        {({ errors }) => (
          <>
            <Input
              label="Authentication code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              error={errors.code}
              className={fieldClass}
            />
            <Button type="submit" className={`h-12 w-full ${brandButtonPrimaryClass}`}>
              Verify and continue
            </Button>
          </>
        )}
      </Form>
    </div>
  )
}
