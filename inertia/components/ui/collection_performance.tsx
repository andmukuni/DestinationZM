export function CollectionPerformance({ percent }: { percent: number | null }) {
  if (percent === null) {
    return <span className="text-slate-400">—</span>
  }

  const textClassName =
    percent >= 70 ? 'text-orange-700' : percent >= 40 ? 'text-amber-700' : 'text-red-700'
  const barClassName =
    percent >= 70 ? 'bg-orange-500' : percent >= 40 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="min-w-[6.5rem]">
      <span className={`text-sm font-semibold tabular-nums ${textClassName}`}>{percent}%</span>
      <div className="mt-1.5 h-1.5 w-full max-w-[5.5rem] overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${barClassName}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  )
}
