/** Shared permissive props for module stub pages until full UI is built. */
export type ModulePageProps = {
  filters?: Record<string, unknown> | null
  branches?: unknown[]
  customers?: unknown[]
  bookings?: unknown[]
  suppliers?: unknown[]
  quotations?: unknown[]
  invoices?: unknown[]
  receipts?: unknown[]
  payments?: unknown[]
  schedules?: unknown[]
  documents?: unknown[]
  templates?: unknown[]
  recentRuns?: unknown[]
  agents?: unknown[]
  officers?: unknown[]
  customer?: unknown
  booking?: unknown
  supplier?: unknown
  quotation?: unknown
  invoice?: unknown
  schedule?: unknown
  defaultBranchId?: number | null
  canManage?: boolean
  canApprove?: boolean
  canAssign?: boolean
  canExport?: boolean
  canManageTemplates?: boolean
}
