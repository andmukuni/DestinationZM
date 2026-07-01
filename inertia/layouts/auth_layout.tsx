import { type ReactElement } from 'react'
import { type Data } from '@generated/data'
import { FlashListener } from '~/components/flash_listener'

function BrandingTitle({ compact = false }: { compact?: boolean }) {
  return (
    <div className="text-center">
      <h1
        className={`font-serif font-bold tracking-tight text-white ${
          compact ? 'text-2xl sm:text-3xl' : 'text-4xl xl:text-5xl'
        }`}
      >
        DestinationZM
      </h1>
      <p
        className={`mt-2 font-medium uppercase tracking-widest text-white/75 ${
          compact ? 'text-[10px] sm:text-xs' : 'text-sm'
        }`}
      >
        Tour & Travel Management
      </p>
    </div>
  )
}

export default function AuthLayout({ children }: { children: ReactElement<Data.SharedProps> }) {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="relative hidden min-h-screen overflow-hidden lg:flex lg:w-1/2">
        <div
          className="absolute inset-0 bg-gradient-to-br from-orange-900 via-slate-900 to-amber-900"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-slate-950/50" aria-hidden />
        <div className="relative flex w-full flex-col items-center justify-center p-12 xl:p-16">
          <BrandingTitle />
        </div>
      </aside>

      <main className="flex min-h-screen flex-1 flex-col justify-center bg-[#fafaf9] px-6 py-12 sm:px-10 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="relative mb-10 overflow-hidden rounded-2xl lg:hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900 via-slate-900 to-amber-900" aria-hidden />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <BrandingTitle compact />
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>

      <FlashListener />
    </div>
  )
}
