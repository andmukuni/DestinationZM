import DashboardService from '#services/dashboard_service'
import type { UserRole } from '#types/user_roles'
import type { HttpContext } from '@adonisjs/core/http'

export default class DashboardController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    await user.load('branch')
    const role = user.role as UserRole
    const officeName = user.branch?.name ?? null

    const [stats, recentBookings, popularDestinations, upcomingDepartures, recoveryReportPending] =
      await Promise.all([
        DashboardService.stats(user, officeName),
        DashboardService.recentBookings(user),
        DashboardService.popularDestinations(user),
        DashboardService.upcomingDepartures(user),
        DashboardService.recoveryReportPendingCount(user),
      ])

    return inertia.render('dashboard', {
      role,
      officeName,
      stats: { ...stats, recoveryReportPending },
      recentBookings,
      popularDestinations,
      upcomingDepartures,
    })
  }
}
