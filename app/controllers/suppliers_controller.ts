import Branch from '#models/branch'
import Supplier from '#models/supplier'
import AuthorizationService from '#services/authorization_service'
import AuditService from '#services/audit_service'
import { supplierStoreValidator } from '#validators/supplier_validator'
import type { HttpContext } from '@adonisjs/core/http'

function canViewSuppliers(user: Parameters<typeof AuthorizationService.can>[0]) {
  return (
    AuthorizationService.can(user, 'suppliers.view') ||
    AuthorizationService.can(user, 'suppliers.manage')
  )
}

export default class SuppliersController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!canViewSuppliers(user)) {
      return response.forbidden()
    }

    const search = String(request.qs().search ?? '').trim()
    const userBranchId = AuthorizationService.branchIdFor(user)
    const filterBranchId = request.qs().branchId ? Number(request.qs().branchId) : null
    const branchId = userBranchId ?? filterBranchId ?? null

    const query = Supplier.query().preload('branch').orderBy('name', 'asc')

    if (userBranchId) {
      query.where('branch_id', userBranchId)
    } else if (branchId) {
      query.where('branch_id', branchId)
    }

    if (search) {
      query.where((supplierQuery) => {
        supplierQuery
          .whereILike('name', `%${search}%`)
          .orWhereILike('code', `%${search}%`)
          .orWhereILike('contact_name', `%${search}%`)
      })
    }

    const suppliers = await query
    const branches = userBranchId
      ? []
      : await Branch.query().orderBy('name', 'asc').select('id', 'name')

    return inertia.render('suppliers/index', {
      filters: { search, branchId: branchId ?? null },
      branches: branches.map((b) => ({ id: b.id, name: b.name })),
      suppliers: suppliers.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        contactName: s.contactName,
        email: s.email,
        phone: s.phone,
        isActive: s.isActive,
        branch: s.branch?.name ?? '—',
        branchId: s.branchId,
      })),
    })
  }

  async create({ auth, inertia, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.can(user, 'suppliers.manage')) {
      return response.forbidden()
    }

    const branchId = AuthorizationService.branchIdFor(user)
    const branches = await Branch.query().orderBy('name', 'asc')
    const scopedBranches = branchId ? branches.filter((b) => b.id === branchId) : branches

    return inertia.render('suppliers/create', {
      branches: scopedBranches.map((b) => ({ id: b.id, name: b.name })),
      defaultBranchId: branchId,
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.can(user, 'suppliers.manage')) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(supplierStoreValidator)
    const userBranchId = AuthorizationService.branchIdFor(user)
    const branchId = userBranchId ?? payload.branchId ?? null

    const supplier = await Supplier.create({
      name: payload.name,
      code: payload.code ?? null,
      contactName: payload.contactName ?? null,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      notes: payload.notes ?? null,
      isActive: payload.isActive ?? true,
      branchId,
    })

    await AuditService.log({
      action: 'supplier.created',
      entityType: 'supplier',
      entityId: supplier.id,
      userId: user.id,
      ipAddress: request.ip(),
    })

    session.flash('success', 'Supplier created successfully')
    return response.redirect().toRoute('suppliers.show', { id: supplier.id })
  }

  async show({ auth, inertia, params, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!canViewSuppliers(user)) {
      return response.forbidden()
    }

    const supplier = await Supplier.query()
      .where('id', params.id)
      .preload('branch')
      .firstOrFail()

    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && supplier.branchId !== userBranchId) {
      return response.forbidden()
    }

    return inertia.render('suppliers/show', {
      supplier: {
        id: supplier.id,
        name: supplier.name,
        code: supplier.code,
        contactName: supplier.contactName,
        email: supplier.email,
        phone: supplier.phone,
        notes: supplier.notes,
        isActive: supplier.isActive,
        branch: supplier.branch?.name ?? '—',
        branchId: supplier.branchId,
        createdAt: supplier.createdAt.toFormat('dd LLL yyyy'),
      },
    })
  }
}
