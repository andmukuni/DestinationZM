import ClientAccount from '#models/client_account'
import PortalContextService from '#services/portal_context_service'
import PortalOrganizationUserService from '#services/portal_organization_user_service'
import PortalPrivilegeService from '#services/portal_privilege_service'
import { portalUserStoreValidator, portalUserUpdateValidator } from '#validators/portal_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class PortalUsersController {
  async index({ auth, inertia, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.hasAny(account, ['view_team', 'manage_users'])) {
      return response.forbidden()
    }

    const context = await PortalContextService.fromAccount(account)
    const accounts = await PortalOrganizationUserService.listForOrganization(context.organizationCustomerId)
    const canManageUsers = PortalOrganizationUserService.canManageUsers(account.role)

    return inertia.render('portal/users/index', {
      pageTitle: 'User management',
      pageDescription: `${context.organization.name} portal users`,
      canManageUsers,
      users: accounts.map((member) => {
        const summary = PortalPrivilegeService.privilegeSummary(member)
        const canEdit = PortalOrganizationUserService.canManageTarget(account, member)
        return {
          id: member.id,
          fullName: member.fullName ?? member.email,
          email: member.email,
          role: member.role,
          roleLabel: PortalOrganizationUserService.roleLabel(member.role),
          isActive: member.isActive,
          lastLoginAt: member.lastLoginAt?.toFormat('dd LLL yyyy HH:mm') ?? 'Never',
          initials: member.initials,
          isSelf: member.id === account.id,
          isOrganizationOwner: member.role === 'owner',
          canEdit,
          manageUrl: canManageUsers && canEdit ? `/portal/users/${member.id}/edit` : null,
          resetPasswordUrl: PortalOrganizationUserService.canChangePassword(account, member)
            ? `/portal/users/${member.id}/edit#password`
            : null,
          privilegeCount: summary.total,
          privilegeMax: summary.max,
          privilegePreview: summary.labels,
        }
      }),
    })
  }

  async create({ auth, inertia, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalOrganizationUserService.canManageUsers(account.role)) {
      return response.forbidden()
    }

    const context = await PortalContextService.fromAccount(account)
    const assignableRoles = PortalOrganizationUserService.assignableRoles(account.role)

    return inertia.render('portal/users/create', {
      pageTitle: 'Add user',
      pageDescription: context.organization.name,
      roles: assignableRoles.map((role) => ({
        value: role,
        label: PortalOrganizationUserService.roleLabel(role),
        defaultPrivileges: PortalPrivilegeService.defaultForRole(role),
      })),
      privilegeGroups: PortalPrivilegeService.groupsForAccount(account),
      presets: PortalPrivilegeService.presetsForUi(),
      assignablePrivileges: PortalPrivilegeService.assignablePrivileges(account),
    })
  }

  async edit({ auth, inertia, params, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalOrganizationUserService.canManageUsers(account.role)) {
      return response.forbidden()
    }

    const target = await PortalOrganizationUserService.findInOrganization(account.customerId, Number(params.id))
    if (!target || !PortalOrganizationUserService.canManageTarget(account, target)) {
      return response.notFound()
    }

    const context = await PortalContextService.fromAccount(account)
    const assignableRoles = PortalOrganizationUserService.assignableRoles(account.role)
    const resolved = PortalPrivilegeService.resolvePrivileges(target)

    return inertia.render('portal/users/edit', {
      pageTitle: target.fullName ?? target.email,
      pageDescription: 'Manage role and portal privileges',
      organizationName: context.organization.name,
      isManager: PortalOrganizationUserService.canManageUsers(account.role),
      member: {
        id: target.id,
        fullName: target.fullName ?? target.email,
        email: target.email,
        role: target.role,
        roleLabel: PortalOrganizationUserService.roleLabel(target.role),
        isActive: target.isActive,
        initials: target.initials,
        isOrganizationOwner: target.role === 'owner',
        isSelf: target.id === account.id,
        canChangePassword:
          PortalOrganizationUserService.canChangePassword(account, target) ||
          (target.id === account.id && (target.role === 'owner' || target.role === 'admin')),
      },
      roles: assignableRoles.map((role) => ({
        value: role,
        label: PortalOrganizationUserService.roleLabel(role),
      })),
      privileges: resolved,
      privilegeGroups: PortalPrivilegeService.groupsForAccount(target),
      presets: PortalPrivilegeService.presetsForUi(),
      assignablePrivileges: PortalPrivilegeService.assignablePrivileges(account),
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalOrganizationUserService.canManageUsers(account.role)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(portalUserStoreValidator)
    if (!PortalOrganizationUserService.canAssignRole(account.role, payload.role)) {
      session.flash('error', 'You cannot assign that role.')
      return response.redirect().back()
    }

    const existing = await ClientAccount.findBy('email', payload.email)
    if (existing) {
      session.flash('error', 'An account with this email already exists.')
      return response.redirect().back()
    }

    const draft = new ClientAccount()
    draft.role = payload.role
    const privileges =
      payload.role === 'owner'
        ? null
        : PortalPrivilegeService.sanitizeAssignment(account, draft, payload.privileges ?? PortalPrivilegeService.defaultForRole(payload.role))

    await ClientAccount.create({
      customerId: account.customerId,
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      privileges,
      isActive: true,
    })

    session.flash('success', 'User added with assigned privileges.')
    return response.redirect().toRoute('portal.users')
  }

  async update({ auth, params, request, response, session }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalOrganizationUserService.canManageUsers(account.role)) {
      return response.forbidden()
    }

    const target = await PortalOrganizationUserService.findInOrganization(account.customerId, Number(params.id))
    if (!target) {
      return response.notFound()
    }

    const payload = await request.validateUsing(portalUserUpdateValidator)

    try {
      if (payload.role && payload.role !== target.role) {
        await PortalOrganizationUserService.assertCanChangeRole(account, target, payload.role)
        target.role = payload.role
      }

      if (payload.fullName && payload.fullName !== target.fullName) {
        if (!PortalOrganizationUserService.canManageTarget(account, target)) {
          throw new Error('You cannot manage this user.')
        }
        target.fullName = payload.fullName
      }

      if (payload.isActive !== undefined && payload.isActive !== target.isActive) {
        await PortalOrganizationUserService.assertCanToggleActive(account, target, payload.isActive)
        target.isActive = payload.isActive
      }

      if (payload.privileges && target.role !== 'owner') {
        target.privileges = PortalPrivilegeService.sanitizeAssignment(account, target, payload.privileges)
      }

      if (target.role === 'owner') {
        target.privileges = null
      }

      if (payload.password) {
        if (payload.password !== payload.passwordConfirmation) {
          session.flash('error', 'Password confirmation does not match.')
          return response.redirect().back()
        }
        PortalOrganizationUserService.assertCanChangePassword(account, target)
        target.password = payload.password
      }

      await target.save()
    } catch (error) {
      session.flash('error', error instanceof Error ? error.message : 'Unable to update user.')
      return response.redirect().back()
    }

    session.flash(
      'success',
      payload.password
        ? target.id === account.id
          ? 'Your password has been updated.'
          : 'User updated and password reset.'
        : 'User access updated.'
    )
    return response.redirect().toRoute('portal.users.edit', { id: target.id })
  }
}
