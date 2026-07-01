import type { AnchorHTMLAttributes, ReactNode } from 'react'

type FileDownloadLinkProps = {
  href: string
  children: ReactNode
} & AnchorHTMLAttributes<HTMLAnchorElement>

export function FileDownloadLink({ href, children, className = '', ...props }: FileDownloadLinkProps) {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  )
}
