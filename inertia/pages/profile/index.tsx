import { Link } from '@adonisjs/inertia/react'
import { Badge } from '~/components/ui/badge'
import { Card, CardBody } from '~/components/ui/card'
import { UserAvatar } from '~/components/ui/user_avatar'

type ProfileIndexProps = {
  profile: {
    id: number
    fullName: string | null
    email: string
    initials: string
    roleLabel: string
    branchName: string
    createdAt: string
    lastAccessedAt: string
  }
  pageTitle?: string
  pageDescription?: string
}

export default function ProfileIndex({ profile }: ProfileIndexProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-600">Your account details and activity.</p>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <UserAvatar initials={profile.initials} size="lg" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold text-slate-900">{profile.fullName}</h2>
                  <Badge tone="info">{profile.roleLabel}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{profile.email}</p>
              </div>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2 sm:gap-x-8">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Office</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">{profile.branchName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Role</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">{profile.roleLabel}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Member since</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">{profile.createdAt}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last accessed</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">{profile.lastAccessedAt}</dd>
              </div>
            </dl>
          </div>
        </CardBody>
      </Card>

      <p className="text-sm text-slate-600">
        Account details are managed by an administrator.{' '}
        <Link route="user_settings" className="font-medium text-slate-900 underline hover:text-slate-700">
          Change password
        </Link>
      </p>
    </div>
  )
}
