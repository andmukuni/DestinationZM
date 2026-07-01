type SpinnerProps = {
  className?: string
  size?: 'sm' | 'md'
  tone?: 'light' | 'dark'
}

export function Spinner({ className = '', size = 'md', tone = 'dark' }: SpinnerProps) {
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5 border' : 'h-4 w-4 border-2'
  const toneClass =
    tone === 'light' ? 'border-white/30 border-t-white' : 'border-slate-300 border-t-slate-700'

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block shrink-0 animate-spin rounded-full ${sizeClass} ${toneClass} ${className}`}
    />
  )
}
