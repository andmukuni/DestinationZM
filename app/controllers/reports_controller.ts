import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'
import { mkdir, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import ReportRun from '#models/report_run'
import ReportTemplate from '#models/report_template'
import AuthorizationService from '#services/authorization_service'
import ReportService from '#services/report_service'
import {
  reportRunValidator,
  reportTemplateStoreValidator,
} from '#validators/report_validator'
import type { HttpContext } from '@adonisjs/core/http'

function canViewReports(user: Parameters<typeof AuthorizationService.can>[0]) {
  return AuthorizationService.can(user, 'reports.view')
}

export default class ReportsController {
  async index({ auth, inertia, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!canViewReports(user)) {
      return response.forbidden()
    }

    const templates = await ReportService.listTemplates()
    const recentRuns = await ReportRun.query()
      .preload('template')
      .preload('generatedBy')
      .orderBy('created_at', 'desc')
      .limit(10)

    return inertia.render('reports/index', {
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        source: t.source,
        description: t.description,
      })),
      recentRuns: recentRuns.map((run) => ({
        id: run.id,
        templateName: run.template?.name ?? 'Unknown',
        status: run.status,
        generatedBy: run.generatedBy?.fullName ?? 'System',
        createdAt: run.createdAt.toFormat('dd LLL yyyy HH:mm'),
        outputDocumentId: run.outputDocumentId,
      })),
      canExport: AuthorizationService.can(user, 'reports.export'),
      canManageTemplates: AuthorizationService.can(user, 'reports.templates.manage'),
    })
  }

  async templates({ auth, inertia, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.can(user, 'reports.templates.manage')) {
      return response.forbidden()
    }

    const templates = await ReportTemplate.query().orderBy('name', 'asc')

    return inertia.render('reports/templates', {
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        source: t.source,
        description: t.description,
        isActive: t.isActive,
        filePath: t.filePath,
      })),
    })
  }

  async storeTemplate({ auth, request, response, session }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.can(user, 'reports.templates.manage')) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(reportTemplateStoreValidator)
    const file = request.file('file', {
      size: '20mb',
      extnames: ['xlsx', 'xls'],
    })

    if (!file || !file.isValid) {
      session.flash('error', file?.errors[0]?.message ?? 'A valid Excel template file is required')
      return response.redirect().back()
    }

    const templatesRoot = app.makePath('storage/app/report-templates')
    await mkdir(templatesRoot, { recursive: true })

    const safeName = file.clientName.replace(/[^\w.-]+/g, '_')
    const storedName = `${randomUUID()}-${safeName}`
    const contents = await readFile(file.tmpPath!)
    await writeFile(join(templatesRoot, storedName), contents)

    await ReportTemplate.create({
      name: payload.name,
      slug: payload.slug,
      source: 'excel',
      description: payload.description ?? null,
      filePath: join('report-templates', storedName),
      isActive: true,
    })

    session.flash('success', 'Report template uploaded successfully')
    return response.redirect().toRoute('reports.templates')
  }

  async run({ auth, request, response, session }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!canViewReports(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(reportRunValidator)
    const template = await ReportTemplate.findOrFail(payload.templateId)
    const userBranchId = AuthorizationService.branchIdFor(user)
    const branchId = userBranchId ?? payload.branchId ?? null

    const parameters: Record<string, unknown> = {}
    if (branchId) {
      parameters.branchId = branchId
    }

    const run = await ReportService.runSystemReport(template, user.id, parameters)

    if (run.status === 'failed') {
      session.flash('error', run.errorMessage ?? 'Report generation failed')
      return response.redirect().back()
    }

    session.flash('success', 'Report generated successfully')
    if (run.outputDocumentId) {
      return response.redirect().toRoute('reports.download', { id: run.id })
    }

    return response.redirect().toRoute('reports')
  }

  async download({ auth, params, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (
      !AuthorizationService.can(user, 'reports.export') &&
      !AuthorizationService.can(user, 'reports.view')
    ) {
      return response.forbidden()
    }

    const run = await ReportRun.query()
      .where('id', params.id)
      .preload('outputDocument')
      .firstOrFail()

    if (!run.outputDocument) {
      return response.notFound('Report output not found')
    }

    const absolutePath = app.makePath('storage/app', run.outputDocument.filePath)

    return response.download(absolutePath)
  }
}
