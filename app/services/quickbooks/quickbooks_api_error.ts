import type { QuickbooksQueryResponse } from '#services/quickbooks/quickbooks_client'

export class QuickbooksApiError extends Error {
  readonly status: number
  readonly intuitTid: string | null
  readonly fault: QuickbooksQueryResponse<unknown>['Fault'] | undefined

  constructor(
    message: string,
    options: {
      status: number
      intuitTid?: string | null
      fault?: QuickbooksQueryResponse<unknown>['Fault']
    }
  ) {
    super(message)
    this.name = 'QuickbooksApiError'
    this.status = options.status
    this.intuitTid = options.intuitTid ?? null
    this.fault = options.fault
  }
}

export function readIntuitTid(headers: Headers) {
  return headers.get('intuit_tid') ?? headers.get('Intuit-Tid') ?? null
}
