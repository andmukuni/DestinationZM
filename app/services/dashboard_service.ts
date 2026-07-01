import { DateTime } from 'luxon'
import Booking from '#models/booking'
import Customer from '#models/customer'
import Invoice from '#models/invoice'
import Quotation from '#models/quotation'
import RecoveryReportItem from '#models/recovery_report_item'
import User from '#models/user'
import { BOOKING_STATUS_LABELS } from '#types/booking_status'
import { requiresBranch, type UserRole } from '#types/user_roles'

type DashboardStats = {
  activeBookings: number
  revenueThisMonth: string
  upcomingDepartures: number
  pendingInquiries: number
  confirmedTours: number
  packagesSoldYtd: number
  newCustomersThisMonth: number
  officeName: string | null
  recoveryPendingInvoice: number
  recoverySentToClient: number
  recoveryQueried: number
  recoveryOutstanding: string
}

type DashboardBooking = {
  id: number
  customer: string
  destination: string
  departDate: string
  returnDate: string
  status: string
  statusLabel: string
  amount: string
  agent: string
}

function formatCurrency(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString('en-ZM', { minimumFractionDigits: 0 })}`
}

export default class DashboardService {
  private static scopedBookingQuery(user: User) {
    const query = Booking.query()
    if (requiresBranch(user.role as UserRole) && user.branchId) {
      query.where('branch_id', user.branchId)
    }
    if (user.role === 'reservations' || user.role === 'operations') {
      query.where('assigned_user_id', user.id)
    }
    return query
  }

  private static scopedInvoiceQuery(user: User) {
    const query = Invoice.query()
    if (requiresBranch(user.role as UserRole) && user.branchId) {
      query.where('branch_id', user.branchId)
    }
    return query
  }

  static async pendingInquiriesCount(user: User) {
    const [{ $extras }] = await Quotation.query()
      .if(Boolean(user.branchId), (query) => query.where('branch_id', user.branchId!))
      .whereIn('status', ['draft', 'sent'])
      .count('* as total')

    return Number($extras.total ?? 0)
  }

  static async openEnquiriesCount(user: User) {
    const [{ $extras }] = await Booking.query()
      .if(Boolean(user.branchId), (query) => query.where('branch_id', user.branchId!))
      .whereIn('status', ['enquiry_submitted', 'quotation_preparing'])
      .count('* as total')

    return Number($extras.total ?? 0)
  }

  static async pendingQuotationsCount(user: User) {
    const [{ $extras }] = await Quotation.query()
      .if(Boolean(user.branchId), (query) => query.where('branch_id', user.branchId!))
      .where('status', 'sent')
      .count('* as total')

    return Number($extras.total ?? 0)
  }

  static async stats(user: User, officeName: string | null): Promise<DashboardStats> {
    const monthStart = DateTime.now().startOf('month')
    const yearStart = DateTime.now().startOf('year')
    const today = DateTime.now().startOf('day')

    const activeBookings = await this.scopedBookingQuery(user)
      .whereNotIn('status', ['closed', 'cancelled'])
      .count('* as total')

    const confirmedTours = await this.scopedBookingQuery(user)
      .where('status', 'confirmed')
      .count('* as total')

    const upcomingDepartures = await this.scopedBookingQuery(user)
      .where('depart_date', '>=', today.toSQLDate()!)
      .whereNotIn('status', ['cancelled', 'closed'])
      .count('* as total')

    const pendingInquiries = await this.pendingInquiriesCount(user)

    const packagesSoldYtd = await this.scopedBookingQuery(user)
      .where('created_at', '>=', yearStart.toSQL()!)
      .whereNotIn('status', ['cancelled'])
      .count('* as total')

    const newCustomers = await Customer.query()
      .if(Boolean(user.branchId), (query) => query.where('branch_id', user.branchId!))
      .where('created_at', '>=', monthStart.toSQL()!)
      .count('* as total')

    const revenueResult = await this.scopedInvoiceQuery(user)
      .where('created_at', '>=', monthStart.toSQL()!)
      .whereIn('status', ['issued', 'partially_paid', 'paid', 'overdue'])
      .sum('total_amount as revenue')

    const revenueThisMonth = Number(revenueResult[0]?.$extras.revenue ?? 0)

    const recoveryQuery = RecoveryReportItem.query()
    if (requiresBranch(user.role as UserRole) && user.branchId) {
      recoveryQuery.where('branch_id', user.branchId)
    }
    const recoveryItems = await recoveryQuery

    const recoveryPendingInvoice = recoveryItems.filter(
      (item) => item.recoveryStatus === 'PENDING_INVOICE'
    ).length
    const recoverySentToClient = recoveryItems.filter(
      (item) => item.recoveryStatus === 'SENT_TO_CLIENT'
    ).length
    const recoveryQueried = recoveryItems.filter(
      (item) => item.recoveryStatus === 'QUERY_RAISED'
    ).length
    const recoveryOutstandingAmount = recoveryItems
      .filter((item) => !['RECOVERED', 'VOID', 'REJECTED'].includes(item.recoveryStatus))
      .reduce((sum, item) => sum + Number(item.price), 0)
    const recoveryCurrency = recoveryItems[0]?.currency ?? 'ZMW'

    return {
      activeBookings: Number(activeBookings[0]?.$extras.total ?? 0),
      revenueThisMonth: formatCurrency(revenueThisMonth, 'ZMW'),
      upcomingDepartures: Number(upcomingDepartures[0]?.$extras.total ?? 0),
      pendingInquiries,
      confirmedTours: Number(confirmedTours[0]?.$extras.total ?? 0),
      packagesSoldYtd: Number(packagesSoldYtd[0]?.$extras.total ?? 0),
      newCustomersThisMonth: Number(newCustomers[0]?.$extras.total ?? 0),
      officeName,
      recoveryPendingInvoice,
      recoverySentToClient,
      recoveryQueried,
      recoveryOutstanding: formatCurrency(recoveryOutstandingAmount, recoveryCurrency),
    }
  }

  static async recentBookings(user: User, limit = 5): Promise<DashboardBooking[]> {
    const bookings = await this.scopedBookingQuery(user)
      .preload('customer')
      .preload('assignedUser')
      .orderBy('created_at', 'desc')
      .limit(limit)

    return bookings.map((booking) => ({
      id: booking.id,
      customer: booking.customer?.fullName ?? 'Unknown',
      destination: booking.destination,
      departDate: booking.departDate.toFormat('dd LLL yyyy'),
      returnDate: booking.returnDate?.toFormat('dd LLL yyyy') ?? '—',
      status: booking.status,
      statusLabel: BOOKING_STATUS_LABELS[booking.status],
      amount: formatCurrency(booking.totalAmount, booking.currency),
      agent: booking.assignedUser?.fullName ?? booking.assignedUser?.email ?? 'Unassigned',
    }))
  }

  static async popularDestinations(user: User, limit = 4) {
    const query = this.scopedBookingQuery(user)
      .whereNotIn('status', ['cancelled'])
      .select('destination')
      .count('* as bookings')
      .sum('total_amount as revenue')
      .groupBy('destination')
      .orderBy('bookings', 'desc')
      .limit(limit)

    const rows = await query
    return rows.map((row) => ({
      name: row.destination,
      bookings: Number(row.$extras.bookings),
      revenue: formatCurrency(Number(row.$extras.revenue ?? 0), 'ZMW'),
    }))
  }

  static async upcomingDepartures(user: User, limit = 4) {
    const today = DateTime.now().startOf('day')
    const bookings = await this.scopedBookingQuery(user)
      .preload('customer')
      .where('depart_date', '>=', today.toSQLDate()!)
      .whereNotIn('status', ['cancelled', 'closed'])
      .orderBy('depart_date', 'asc')
      .limit(limit)

    return bookings.map((booking) => ({
      id: booking.id,
      customer: booking.customer?.fullName ?? 'Unknown',
      destination: booking.destination,
      date: booking.departDate.toFormat('dd LLL yyyy'),
      pax: booking.pax,
    }))
  }

  static async recoveryReportPendingCount(user: User) {
    const query = RecoveryReportItem.query().whereNotIn('recovery_status', [
      'RECOVERED',
      'VOID',
      'REJECTED',
    ])
    if (requiresBranch(user.role as UserRole) && user.branchId) {
      query.where('branch_id', user.branchId)
    }
    const [{ $extras }] = await query.count('* as total')
    return Number($extras.total)
  }
}
