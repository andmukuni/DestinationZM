import { router } from '@inertiajs/react'
import type { KeyboardEvent, MouseEvent } from 'react'

export function rowNavigate(href: string) {
  return () => router.visit(href)
}

export function stopRowClick(event: MouseEvent | KeyboardEvent) {
  event.stopPropagation()
}

export const stopRowClickProps = {
  onClick: stopRowClick,
  onKeyDown: stopRowClick,
} as const
