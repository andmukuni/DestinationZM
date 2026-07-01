const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
} as const

type UserAvatarProps = {
  initials: string
  size?: keyof typeof sizeClasses
  className?: string
  title?: string
}

export function UserAvatar({
  initials,
  size = 'sm',
  className = '',
  title,
}: UserAvatarProps) {
  const innerClass = sizeClasses[size]

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-slate-900 font-semibold text-white ${innerClass} ${className}`}
      title={title}
    >
      {initials}
    </span>
  )
}
