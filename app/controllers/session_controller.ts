import User from '#models/user'
import AuthorizationService from '#services/authorization_service'
import UserActivityService from '#services/user_activity_service'
import { loginValidator } from '#validators/user'
import { errors } from '@adonisjs/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, response, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(email, password)
      await user.load('branch')

      if (!AuthorizationService.hasRequiredBranch(user)) {
        session.flash('error', 'Your account is not linked to a branch. Contact an administrator.')
        return response.redirect().back()
      }

      await UserActivityService.touchLastAccessed(user, true)
      await auth.use('web').login(user)
      return response.redirect().toRoute('dashboard')
    } catch (error) {
      if (error instanceof errors.E_INVALID_CREDENTIALS) {
        session.flash('error', 'Invalid email or password')
        return response.redirect().back()
      }

      throw error
    }
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('session.create')
  }
}
