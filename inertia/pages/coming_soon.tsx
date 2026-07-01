import { Link } from '@adonisjs/inertia/react'
import { DashboardIcon } from '~/components/icons'
import { Button } from '~/components/ui/button'
import { Card, CardBody } from '~/components/ui/card'

type ComingSoonProps = {
  title: string
  description: string
  pageTitle?: string
  pageDescription?: string
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>

      <Card>
        <CardBody className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-slate-900">Coming soon</p>
            <p className="text-sm text-slate-600">
              This module is part of the DestinationZM travel agency template and will be available
              in a future release.
            </p>
          </div>
          <Link route="dashboard">
            <Button variant="secondary" className="gap-2">
              <DashboardIcon />
              Back to dashboard
            </Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  )
}
