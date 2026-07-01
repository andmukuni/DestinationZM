import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  async index({ auth, response }: HttpContext) {
    if (auth.user) {
      return response.redirect().toRoute('dashboard')
    }

    return response.redirect().toRoute('session.create')
  }
}
