import { router } from '@inertiajs/react'
import { useCallback, useState } from 'react'

type GetOptions = NonNullable<Parameters<typeof router.get>[2]>
type PatchOptions = NonNullable<Parameters<typeof router.patch>[2]>

export function useRouterLoading() {
  const [loading, setLoading] = useState(false)

  const get = useCallback((url: string, options?: GetOptions) => {
    setLoading(true)
    router.get(url, {}, {
      preserveState: true,
      preserveScroll: true,
      ...options,
      onFinish: (visit) => {
        setLoading(false)
        options?.onFinish?.(visit)
      },
    })
  }, [])

  const patch = useCallback((url: string, data?: Parameters<typeof router.patch>[1], options?: PatchOptions) => {
    setLoading(true)
    router.patch(url, data, {
      ...options,
      onFinish: (visit) => {
        setLoading(false)
        options?.onFinish?.(visit)
      },
    })
  }, [])

  return { loading, get, patch }
}
