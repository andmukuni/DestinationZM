import './css/app.css'
import { type ReactElement } from 'react'
import { client } from './client'
import AppLayout from '~/layouts/app_layout'
import AuthLayout from '~/layouts/auth_layout'
import PortalLayout from '~/layouts/portal_layout'
import { type Data } from '@generated/data'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

const appName = import.meta.env.VITE_APP_NAME || 'DestinationZM'

const authPages = new Set(['auth/login', 'portal/login', 'portal/maintenance', 'portal/register'])
const legalPages = new Set(['legal/eula', 'legal/privacy'])

function resolveLayout(name: string, page: ReactElement<Data.SharedProps>) {
  if (legalPages.has(name)) {
    return <AuthLayout wide children={page} />
  }
  if (authPages.has(name)) {
    return <AuthLayout children={page} />
  }
  if (name.startsWith('portal/')) {
    return <PortalLayout children={page} />
  }
  return <AppLayout children={page} />
}

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: (name) => {
    return resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob('./pages/**/*.tsx'),
      (page: ReactElement<Data.SharedProps>) => resolveLayout(name, page)
    )
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <TuyauProvider client={client}>
        <App {...props} />
      </TuyauProvider>
    )
  },
  progress: false,
})
