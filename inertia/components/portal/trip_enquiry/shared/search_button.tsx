import { PlusIcon } from '~/components/icons'

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
  return (
    <button
      type="submit"
      className={
        integrated
          ? 'inline-flex h-full min-h-[56px] w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-6 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]'
          : `inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2563eb] font-semibold text-white transition hover:bg-[#1d4ed8] ${
              compact ? 'h-14 w-14 px-0' : 'h-14 min-w-[140px] px-6'
            }`
      }
    >
      <PlusIcon className="h-5 w-5" />
      {!compact ? <span>{label}</span> : null}
    </button>
  )
}
