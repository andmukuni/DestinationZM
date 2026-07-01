import { Link } from '@adonisjs/inertia/react'
import { useState } from 'react'
import { ArrowPathIcon, FunnelIcon, PlusIcon } from '~/components/icons'
import { useRouterLoading } from '~/hooks/use_router_loading'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'

type UsersIndexProps = {
  filters: {
    search: string
    role: string | null
    branchId: number | null
  }
  branches: Array<{ id: number; name: string }>
  branchLabel: string
  roleLabel: string
  roles: Array<{ value: string; label: string }>
  users: Array<{
    id: number
    fullName: string | null
    email: string
    role: string
    roleLabel: string
    branch: string
    branchId: number | null
    lastAccessedAt: string
    initials: string
  }>
}

function buildQuery(filters: UsersIndexProps['filters']) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.role) params.set('role', filters.role)
  if (filters.branchId !== null) params.set('branchId', String(filters.branchId))
  return params.toString()
}

function UsersFilters({
  search,
  role,
  branchId,
  branches,
  roles,
  onSearchChange,
  onRoleChange,
  onBranchChange,
  onReset,
  applyLoading = false,
}: {
  search: string
  role: string | null
  branchId: number | null
  branches: Array<{ id: number; name: string }>
  roles: Array<{ value: string; label: string }>
  onSearchChange: (value: string) => void
  onRoleChange: (role: string | null) => void
  onBranchChange: (branchId: number | null) => void
  onReset: () => void
  applyLoading?: boolean
}) {
  const showOfficeFilter = branches.length > 0

  return (
    <div className="flex flex-wrap items-end gap-3">
      {showOfficeFilter ? (
        <div className="min-w-[8.5rem] flex-1 basis-[8.5rem]">
          <label htmlFor="office" className="mb-1 block text-sm font-medium text-slate-700">
            Office
          </label>
          <select
            id="office"
            name="branchId"
            value={branchId === null ? '' : String(branchId)}
            onChange={(event) => onBranchChange(event.target.value ? Number(event.target.value) : null)}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
          >
            <option value="">All offices</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="min-w-[8.5rem] flex-1 basis-[8.5rem]">
        <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
          Role
        </label>
        <select
          id="role"
          name="role"
          value={role ?? ''}
          onChange={(event) => onRoleChange(event.target.value || null)}
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
        >
          <option value="">All roles</option>
          {roles.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[10rem] flex-1 basis-[10rem]">
        <Input
          label="Search"
          name="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Name or email"
        />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button type="submit" className="gap-2" loading={applyLoading}>
          <FunnelIcon />
          Apply filters
        </Button>
        <Button type="button" variant="secondary" className="gap-2" onClick={onReset}>
          <ArrowPathIcon />
          Reset
        </Button>
        <Link
          route="users.create"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-transparent bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <PlusIcon />
          Create
        </Link>
      </div>
    </div>
  )
}

export default function UsersIndex({
  filters,
  branches,
  branchLabel,
  roleLabel,
  roles,
  users,
}: UsersIndexProps) {
  const [search, setSearch] = useState(filters.search)
  const [role, setRole] = useState<string | null>(filters.role)
  const [branchId, setBranchId] = useState<number | null>(filters.branchId)
  const { loading: filterLoading, get } = useRouterLoading()

  const filterSummary = [
    branches.length > 0 ? branchLabel : null,
    roleLabel,
    search ? `"${search}"` : 'All users',
  ]
    .filter(Boolean)
    .join(' · ')

  function applyFilters(next: Partial<UsersIndexProps['filters']>) {
    const merged = {
      search: next.search ?? search,
      role: next.role !== undefined ? next.role : role,
      branchId: next.branchId !== undefined ? next.branchId : branchId,
    }
    setSearch(merged.search)
    setRole(merged.role)
    setBranchId(merged.branchId)
    const query = buildQuery(merged)
    get(query ? `/users?${query}` : '/users')
  }

  function handleApply(event?: React.FormEvent) {
    event?.preventDefault()
    applyFilters({ search: search.trim() })
  }

  function handleReset() {
    setSearch('')
    setRole(null)
    setBranchId(null)
    applyFilters({ search: '', role: null, branchId: null })
  }

  const filterProps = {
    search,
    role,
    branchId,
    branches,
    roles,
    onSearchChange: setSearch,
    onRoleChange: (value: string | null) => applyFilters({ role: value }),
    onBranchChange: (value: number | null) => applyFilters({ branchId: value }),
    onReset: handleReset,
    applyLoading: filterLoading,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-600">
          {users.length} user{users.length === 1 ? '' : 's'} · {filterSummary}
        </p>
      </div>

      <form
        method="get"
        action="/users"
        className="rounded-lg border border-slate-200 bg-white p-4"
        onSubmit={handleApply}
      >
        <UsersFilters {...filterProps} />
      </form>

      {users.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No users match these filters.{' '}
          <Link route="users.create" className="font-medium text-slate-900 underline">
            Create a user
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Email</TH>
                <TH>Role</TH>
                <TH>Office</TH>
                <TH>Last accessed</TH>
              </TR>
            </THead>
            <TBody>
              {users.map((user) => (
                <TR key={user.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                        {user.initials}
                      </span>
                      <span className="font-medium text-slate-900">{user.fullName}</span>
                    </div>
                  </TD>
                  <TD className="text-slate-600">{user.email}</TD>
                  <TD>{user.roleLabel}</TD>
                  <TD>
                    {user.branchId ? (
                      user.branch
                    ) : (
                      <Badge tone="warning">No office</Badge>
                    )}
                  </TD>
                  <TD className="text-slate-600">{user.lastAccessedAt}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  )
}
