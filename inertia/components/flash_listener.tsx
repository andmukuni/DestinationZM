import { toast, Toaster } from 'sonner'
import { usePage } from '@inertiajs/react'
import { useEffect } from 'react'
import { type Data } from '@generated/data'

export function FlashListener() {
  const { url, props } = usePage<Data.SharedProps>()

  useEffect(() => {
    toast.dismiss()
  }, [url])

  useEffect(() => {
    if (props.flash.error) toast.error(props.flash.error)
    if (props.flash.success) toast.success(props.flash.success)
  }, [props.flash.error, props.flash.success])

  return <Toaster position="top-center" richColors />
}
