type RecoveryExportFilters = {
  search?: string
  status?: string | null
  recoveryItemId?: number
  startDate?: string
  endDate?: string
}

export function buildRecoveryExportUrl(
  path: '/recovery-reports/export' | '/recovery-reports/export-pdf' | '/portal/recovery-reports/export' | '/portal/recovery-reports/export-pdf',
  filters: RecoveryExportFilters = {}
) {
  const params = new URLSearchParams()

  if (filters.search?.trim()) {
    params.set('search', filters.search.trim())
  }
  if (filters.status) {
    params.set('status', filters.status)
  }
  if (filters.recoveryItemId) {
    params.set('recoveryItemId', String(filters.recoveryItemId))
  }
  if (filters.startDate?.trim()) {
    params.set('startDate', filters.startDate.trim())
  }
  if (filters.endDate?.trim()) {
    params.set('endDate', filters.endDate.trim())
  }

  const query = params.toString()
  return query ? `${path}?${query}` : path
}
