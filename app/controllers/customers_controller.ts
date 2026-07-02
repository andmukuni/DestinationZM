import Branch from '#models/branch'
import Customer from '#models/customer'
import AuthorizationService from '#services/authorization_service'
import AuditService from '#services/audit_service'
import QuickbooksOauthService from '#services/quickbooks/quickbooks_oauth_service'
import QuickbooksSyncService from '#services/quickbooks/quickbooks_sync_service'
import { customerStoreValidator } from '#validators/customer_validator'
import type { HttpContext } from '@adonisjs/core/http'

function canViewCustomers(user: Parameters<typeof AuthorizationService.can>[0]) {
  return (
    AuthorizationService.can(user, 'customers.view') ||
    AuthorizationService.can(user, 'customers.manage')
  )
}

export default class CustomersController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewCustomers(user)) {
      return response.forbidden()
    }

    const search = String(request.qs().search ?? '').trim()
    const userBranchId = AuthorizationService.branchIdFor(user)
    const filterBranchId = request.qs().branchId ? Number(request.qs().branchId) : null
    const branchId = userBranchId ?? filterBranchId ?? null

    const query = Customer.query().preload('branch').orderBy('full_name', 'asc')

    if (userBranchId) {
      query.where('branch_id', userBranchId)
    } else if (branchId) {
      query.where('branch_id', branchId)
    }

    if (search) {
      query.where((customerQuery) => {
        customerQuery
          .whereILike('full_name', `%${search}%`)
          .orWhereILike('email', `%${search}%`)
          .orWhereILike('phone', `%${search}%`)
          .orWhereILike('company', `%${search}%`)
      })
    }

    const customers = await query
    const branches = userBranchId
      ? []
      : await Branch.query().orderBy('name', 'asc').select('id', 'name')

    const canManage = AuthorizationService.can(user, 'customers.manage')
    const quickbooksConnected = Boolean(await QuickbooksOauthService.getActiveConnection())
    const syncSummaries = quickbooksConnected
      ? await QuickbooksSyncService.getCustomerListSyncSummaries(customers.map((c) => c.id))
      : new Map()

    return inertia.render('customers/index', {
      filters: { search, branchId: branchId ?? null },
      branches: branches.map((b) => ({ id: b.id, name: b.name })),
      canManage,
      quickbooksConnected,
      customers: customers.map((c) => {
        const sync = syncSummaries.get(c.id)
        return {
          id: c.id,
          fullName: c.fullName,
          email: c.email,
          phone: c.phone,
          company: c.company,
          branch: c.branch?.name ?? '—',
          branchId: c.branchId,
          createdAt: c.createdAt.toFormat('dd LLL yyyy'),
          quickbooksStatus: sync?.syncStatus ?? null,
          quickbooksId: sync?.quickbooksId ?? null,
        }
      }),
    })
  }

  async create({ auth, inertia, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.can(user, 'customers.manage')) {
      return response.forbidden()
    }

    const branchId = AuthorizationService.branchIdFor(user)
    const branches = await Branch.query().orderBy('name', 'asc')
    const scopedBranches = branchId ? branches.filter((b) => b.id === branchId) : branches

    return inertia.render('customers/create', {
      branches: scopedBranches.map((b) => ({ id: b.id, name: b.name })),
      defaultBranchId: branchId,
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.can(user, 'customers.manage')) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(customerStoreValidator)
    const userBranchId = AuthorizationService.branchIdFor(user)
    const branchId = userBranchId ?? payload.branchId ?? null

    if (!branchId) {
      session.flash('error', 'Office is required')
      return response.redirect().back()
    }

    const customer = await Customer.create({
      fullName: payload.fullName,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      company: payload.company ?? null,
      notes: payload.notes ?? null,
      branchId,
    })

    await AuditService.log({
      action: 'customer.created',
      entityType: 'customer',
      entityId: customer.id,
      userId: user.id,
      ipAddress: request.ip(),
    })

    QuickbooksSyncService.enqueueCustomer(customer.id)

    session.flash('success', 'Customer created successfully')
    return response.redirect().toRoute('customers.show', { id: customer.id })
  }

  async retryQuickbooksSync({ auth, params, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.can(user, 'customers.manage')) {
      return response.forbidden()
    }

    const customer = await Customer.findOrFail(params.id)
    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && customer.branchId !== userBranchId) {
      return response.forbidden()
    }

    if (!(await QuickbooksOauthService.getActiveConnection())) {
      session.flash('error', 'QuickBooks is not connected.')
      return response.redirect().back()
    }

    try {
      await QuickbooksSyncService.processCustomer(customer.id, { manual: true })
      session.flash('success', 'Customer synced to QuickBooks.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'QuickBooks sync failed.'
      session.flash('error', message)
    }

    return response.redirect().back()
  }

  async show({ auth, inertia, params, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewCustomers(user)) {
      return response.forbidden()
    }

    const customer = await Customer.query()
      .where('id', params.id)
      .preload('branch')
      .preload('bookings', (bookingQuery) => bookingQuery.orderBy('depart_date', 'desc'))
      .firstOrFail()

    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && customer.branchId !== userBranchId) {
      return response.forbidden()
    }

    return inertia.render('customers/show', {
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        notes: customer.notes,
        branch: customer.branch?.name ?? '—',
        branchId: customer.branchId,
        createdAt: customer.createdAt.toFormat('dd LLL yyyy'),
        bookings: customer.bookings.map((b) => ({
          id: b.id,
          reference: b.reference,
          destination: b.destination,
          departDate: b.departDate.toFormat('dd LLL yyyy'),
          status: b.status,
        })),
      },
    })
  }
}
