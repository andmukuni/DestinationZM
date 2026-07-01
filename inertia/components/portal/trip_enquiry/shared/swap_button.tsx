import { ArrowsRightLeftIcon } from '~/components/icons'

type SwapButtonProps = {
  onSwap: () => void
}

export default function SwapButton({ onSwap }: SwapButtonProps) {
  return (
    <button
      type="button"
      onClick={onSwap}
      aria-label="Swap locations"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[#2563eb] shadow-sm transition hover:border-[#2563eb] hover:bg-blue-50"
    >
      <ArrowsRightLeftIcon className="h-4 w-4" />
    </button>
  )
}
