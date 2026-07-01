import Branch from '#models/branch'
import User from '#models/user'
import AuthorizationService from '#services/authorization_service'
import UserActivityService from '#services/user_activity_service'
import { userStoreValidator } from '#validators/user_validator'
import { ROLE_LABELS, type UserRole } from '#types/user_roles'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.canManageUsers(user)) {
      return response.forbidden()
    }

    const search = String(request.qs().search ?? '').trim()
    const roleFilter = request.qs().role ? String(request.qs().role) : null
    const userBranchId = AuthorizationService.branchIdFor(user)
    const filterBranchId = request.qs().branchId ? Number(request.qs().branchId) : null
    const branchId = userBranchId ?? filterBranchId ?? null

    const query = User.query().preload('branch').orderBy('full_name', 'asc')

    if (userBranchId) {
      query.where('branch_id', userBranchId)
    } else if (branchId) {
      query.where('branch_id', branchId)
    }

    if (roleFilter && roleFilter in ROLE_LABELS) {
      query.where('role', roleFilter)
    }

    if (search) {
      query.where((userQuery) => {
        userQuery.whereILike('full_name', `%${search}%`).orWhereILike('email', `%${search}%`)
      })
    }

    const users = await query

    const branches = userBranchId
      ? []
      : await Branch.query().orderBy('name', 'asc').select('id', 'name')

    const branchLabel =
      branchId !== null
        ? (branches.find((branch) => branch.id === branchId)?.name ?? 'Office')
        : 'All offices'

    const roleLabel =
      roleFilter && roleFilter in ROLE_LABELS
        ? ROLE_LABELS[roleFilter as keyof typeof ROLE_LABELS]
        : 'All roles'

    return inertia.render('users/index', {
      filters: {
        search,
        role: roleFilter,
        branchId: branchId ?? null,
      },
      branches: branches.map((b) => ({ id: b.id, name: b.name })),
      branchLabel,
      roleLabel,
      roles: Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
      users: users.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        roleLabel: ROLE_LABELS[u.role as keyof typeof ROLE_LABELS],
        branch: u.branch?.name ?? '—',
        branchId: u.branchId,
        lastAccessedAt: UserActivityService.formatLastAccessed(u.lastAccessedAt),
        initials: u.initials,
      })),
    })
  }

  async create({ auth, inertia, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.canManageUsers(user)) {
      return response.forbidden()
    }

    const branchId = AuthorizationService.branchIdFor(user)
    const branches = await Branch.query().orderBy('name', 'asc')
    const scopedBranches = branchId ? branches.filter((b) => b.id === branchId) : branches

    const assignableRoles = Object.entries(ROLE_LABELS)
      .filter(([value]) => value !== 'admin' || AuthorizationService.isAdmin(user))
      .map(([value, label]) => ({ value, label }))

    return inertia.render('users/create', {
      canCreateAdmin: AuthorizationService.isAdmin(user),
      branches: scopedBranches.map((b) => ({ id: b.id, name: b.name })),
      roles: assignableRoles,
      defaultBranchId: branchId,
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.canManageUsers(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(userStoreValidator)

    if (payload.role === 'admin' && !AuthorizationService.isAdmin(user)) {
      session.flash('error', 'Only administrators can create admin users')
      return response.redirect().back()
    }

    const role = payload.role as UserRole
    const userBranchId = AuthorizationService.branchIdFor(user)
    const branchId = AuthorizationService.requiresBranch(role)
      ? (payload.branchId ?? userBranchId)
      : (payload.branchId ?? null)

    if (AuthorizationService.requiresBranch(role) && !branchId) {
      session.flash('error', 'Office is required for this role')
      return response.redirect().back()
    }

    if (userBranchId && branchId && branchId !== userBranchId) {
      session.flash('error', 'You can only assign users to your office')
      return response.redirect().back()
    }

    await User.create({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      branchId: branchId ?? null,
    })

    session.flash('success', 'User created successfully')
    return response.redirect().toRoute('users')
  }
}
