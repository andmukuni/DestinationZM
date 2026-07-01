import UserActivityService from '#services/user_activity_service'
import { passwordUpdateValidator } from '#validators/user_validator'
import { ROLE_LABELS, type UserRole } from '#types/user_roles'
import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'

async function profilePayload(user: Awaited<ReturnType<typeof loadProfileUser>>) {
  const role = user.role as UserRole

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    initials: user.initials,
    roleLabel: ROLE_LABELS[role] ?? role,
    branchName: user.branch?.name ?? '—',
    createdAt: user.createdAt.toFormat('dd LLL yyyy'),
    lastAccessedAt: UserActivityService.formatLastAccessed(user.lastAccessedAt),
  }
}

async function loadProfileUser(auth: HttpContext['auth']) {
  const user = auth.use("web").getUserOrFail()
  await user.load('branch')
  return user
}

export default class ProfileController {
  async show({ auth, inertia }: HttpContext) {
    const user = await loadProfileUser(auth)

    return inertia.render('profile/index', {
      profile: await profilePayload(user),
      pageTitle: 'Profile',
      pageDescription: 'Your account profile',
    })
  }

  async settings({ inertia }: HttpContext) {
    return inertia.render('user_settings/index', {
      pageTitle: 'User Settings',
      pageDescription: 'Personal account preferences',
    })
  }

  async updatePassword({ auth, request, response, session }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    const payload = await request.validateUsing(passwordUpdateValidator)

    const isValid = await hash.verify(user.password, payload.currentPassword)
    if (!isValid) {
      session.flash('error', 'Current password is incorrect')
      return response.redirect().back()
    }

    user.password = payload.password
    await user.save()

    session.flash('success', 'Password updated successfully')
    return response.redirect().back()
  }
}
