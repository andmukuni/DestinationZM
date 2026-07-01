import { createContext, useContext } from 'react'
import { PlusIcon } from '~/components/icons'
import { Button } from '~/components/ui/button'

const TripEnquirySubmitContext = createContext(false)

export function TripEnquirySubmitProvider({
  submitting,
  children,
}: {
  submitting: boolean
  children: React.ReactNode
}) {
  return (
    <TripEnquirySubmitContext.Provider value={submitting}>{children}</TripEnquirySubmitContext.Provider>
  )
}

type SearchButtonProps = {
  label?: string
  compact?: boolean
  integrated?: boolean
}

export default function SearchButton({
  label = 'Add to enquiry',
  compact = false,
  integrated = false,
}: SearchButtonProps) {
  const submitting = useContext(TripEnquirySubmitContext)

  return (
    <Button
      type="submit"
      loading={submitting}
      loadingLabel="Adding…"
      className={
        integrated
          ? 'inline-flex h-full min-h-[56px] w-full items-center justify-center gap-2 rounded-lg border-transparent bg-[#2563eb] px-6 text-sm font-semibold text-white hover:bg-[#1d4ed8]'
          : `inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-transparent bg-[#2563eb] font-semibold text-white hover:bg-[#1d4ed8] ${
              compact ? 'h-14 w-14 px-0' : 'h-14 min-w-[140px] px-6'
            }`
      }
    >
      <PlusIcon className="h-5 w-5" />
      {!compact ? <span>{label}</span> : null}
    </Button>
  )
}
