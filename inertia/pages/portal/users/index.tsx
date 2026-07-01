import { Form, Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { type Data } from '@generated/data'
import { CheckCircleIcon, LockClosedIcon, PencilIcon, PlusIcon, XMarkIcon } from '~/components/icons'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardHeader } from '~/components/ui/card'
import { portalTableIconPrimaryClass } from '~/lib/portal_theme'
import { TableActions, TableIconButton, tableIconButtonClass } from '~/components/ui/table_icon_button'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'
import { stopRowClickProps } from '~/lib/table_row'
import { UserAvatar } from '~/components/ui/user_avatar'

type PortalUsersIndexProps = {
  pageTitle?: string
  pageDescription?: string
  canManageUsers: boolean
  users: Array<{
    id: number
    fullName: string
    email: string
    role: string
    roleLabel: string
    isActive: boolean
    lastLoginAt: string
    initials: string
    isSelf: boolean
    isOrganizationOwner: boolean
    canEdit: boolean
    manageUrl: string | null
    resetPasswordUrl: string | null
    privilegeCount: number
    privilegeMax: number
    privilegePreview: string[]
  }>
}

const thClass = 'whitespace-nowrap align-middle'
const tdClass = 'align-middle'

export default function PortalUsersIndex({ canManageUsers, users }: PortalUsersIndexProps) {
  const { props } = usePage<Data.SharedProps>()
  const isManager =
    canManageUsers ||
    props.portalClient?.canManageUsers === true ||
    props.portalClient?.user?.role === 'owner' ||
    props.portalClient?.user?.role === 'admin'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-600">
            {isManager
              ? 'Click any row to manage a user, or use the action icons in the Actions column.'
              : 'People in your organization who can access the portal. Contact your organization owner to change access.'}
          </p>
        </div>
        {isManager ? (
          <Link href="/portal/users/create">
            <Button className="gap-2">
              <PlusIcon />
              Add user
            </Button>
          </Link>
        ) : null}
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="Organization users"
          description={`${users.length} portal user${users.length === 1 ? '' : 's'}`}
        />
        {users.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-slate-600">No portal users yet.</p>
            {isManager ? (
              <Link
                href="/portal/users/create"
                className="mt-2 inline-block text-sm font-medium text-orange-600 hover:underline"
              >
                Add your first user
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table scrollContainer={false} className="w-full min-w-[1080px] table-fixed">
              <colgroup>
                <col style={{ width: isManager ? '20%' : '22%' }} />
                <col style={{ width: isManager ? '18%' : '20%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: isManager ? '14%' : '18%' }} />
                <col style={{ width: isManager ? '10%' : '12%' }} />
                {isManager ? <col style={{ width: '22%' }} /> : null}
              </colgroup>
              <THead>
                <TR>
                  <TH className={thClass}>User</TH>
                  <TH className={thClass}>Email</TH>
                  <TH className={thClass}>Role</TH>
                  <TH className={thClass}>Status</TH>
                  <TH className={thClass}>Privileges</TH>
                  <TH className={thClass}>Last sign-in</TH>
                  {isManager ? <TH className={`${thClass} text-right`}>Actions</TH> : null}
                </TR>
              </THead>
              <TBody>
                {users.map((member) => {
                  const extraPrivileges = member.privilegeCount - member.privilegePreview.length

                  return (
                    <TR key={member.id} href={member.manageUrl ?? undefined}>
                      <TD className={tdClass}>
                        <div className="flex items-center gap-3">
                          <UserAvatar initials={member.initials} className="h-9 w-9 shrink-0 bg-slate-900 text-xs" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {member.fullName}
                              {member.isSelf ? (
                                <span className="ml-1 text-xs font-normal text-slate-500">(you)</span>
                              ) : null}
                            </p>
                            {member.isOrganizationOwner ? (
                              <p className="truncate text-xs text-sky-700">Full organization access</p>
                            ) : (
                              <p className="truncate text-xs text-slate-500 md:hidden">{member.email}</p>
                            )}
                          </div>
                        </div>
                      </TD>
                      <TD className={`${tdClass} hidden text-slate-600 md:table-cell`}>
                        <span className="block truncate">{member.email}</span>
                      </TD>
                      <TD className={tdClass}>
                        <Badge tone={member.isOrganizationOwner ? 'info' : 'default'}>{member.roleLabel}</Badge>
                      </TD>
                      <TD className={tdClass}>
                        <Badge tone={member.isActive ? 'success' : 'default'}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TD>
                      <TD className={tdClass}>
                        <p className="text-sm font-medium text-slate-900">
                          {member.privilegeCount} of {member.privilegeMax}
                        </p>
                        {member.privilegePreview.length > 0 ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {member.privilegePreview.slice(0, 2).map((label) => (
                              <span
                                key={label}
                                className="inline-block max-w-full truncate rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                              >
                                {label}
                              </span>
                            ))}
                            {extraPrivileges > 0 ? (
                              <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                                +{extraPrivileges}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </TD>
                      <TD className={`${tdClass} whitespace-nowrap text-slate-600`}>{member.lastLoginAt}</TD>
                      {isManager ? (
                        <TD className={`${tdClass} text-right`} {...stopRowClickProps}>
                          <TableActions>
                            {member.manageUrl ? (
                              <>
                                <Link
                                  href={member.manageUrl}
                                  className={portalTableIconPrimaryClass}
                                  title="Manage user"
                                  aria-label="Manage user"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Link>
                                {member.resetPasswordUrl ? (
                                  <Link
                                    href={member.resetPasswordUrl}
                                    className={tableIconButtonClass('secondary')}
                                    title="Reset password"
                                    aria-label="Reset password"
                                  >
                                    <LockClosedIcon className="h-4 w-4" />
                                  </Link>
                                ) : null}
                                {!member.isSelf ? (
                                  <Form action={`/portal/users/${member.id}`} method="post">
                                    {({ processing }) => (
                                      <>
                                        <input type="hidden" name="isActive" value={member.isActive ? '0' : '1'} />
                                        <TableIconButton
                                          type="submit"
                                          label={member.isActive ? 'Deactivate user' : 'Activate user'}
                                          variant={member.isActive ? 'danger' : 'secondary'}
                                          loading={processing}
                                        >
                                          {member.isActive ? (
                                            <XMarkIcon className="h-4 w-4" />
                                          ) : (
                                            <CheckCircleIcon className="h-4 w-4" />
                                          )}
                                        </TableIconButton>
                                      </>
                                    )}
                                  </Form>
                                ) : null}
                              </>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </TableActions>
                        </TD>
                      ) : null}
                    </TR>
                  )
                })}
              </TBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}
