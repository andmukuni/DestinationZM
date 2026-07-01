import { client } from '~/client'
import { type ReactElement } from 'react'
import AppLayout from '~/layouts/app_layout'
import AuthLayout from '~/layouts/auth_layout'
import PortalLayout from '~/layouts/portal_layout'
import { type Data } from '@generated/data'
import ReactDOMServer from 'react-dom/server'
import { createInertiaApp } from '@inertiajs/react'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

const authPages = new Set(['auth/login', 'portal/login', 'portal/maintenance', 'portal/register'])

function resolveLayout(name: string, page: ReactElement<Data.SharedProps>) {
  if (authPages.has(name)) {
    return <AuthLayout children={page} />
  }
  if (name.startsWith('portal/')) {
    return <PortalLayout children={page} />
  }
  return <AppLayout children={page} />
}

export default function render(page: any) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      return resolvePageComponent(
        `./pages/${name}.tsx`,
        import.meta.glob('./pages/**/*.tsx', { eager: true }),
        (resolvedPage: ReactElement<Data.SharedProps>) => resolveLayout(name, resolvedPage)
      )
    },
    setup: ({ App, props }) => {
      return (
        <TuyauProvider client={client}>
          <App {...props} />
        </TuyauProvider>
      )
    },
  })
}
