type Tone = 'default' | 'success' | 'warning' | 'danger' | 'info'

export function statusTone(status: string): Tone {
  switch (status) {
    case 'confirmed':
    case 'approved':
    case 'completed':
    case 'paid':
    case 'resolved':
    case 'issued':
    case 'active':
      return 'success'
    case 'draft':
    case 'pending':
    case 'open':
    case 'sent':
      return 'warning'
    case 'cancelled':
    case 'failed':
    case 'rejected':
    case 'written_off':
    case 'void':
    case 'overdue':
    case 'escalated':
      return 'danger'
    case 'in_progress':
    case 'partially_paid':
    case 'invoiced':
    case 'running':
      return 'info'
    default:
      return 'default'
  }
}
