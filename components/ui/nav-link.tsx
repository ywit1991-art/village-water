'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  href: string
  exact?: boolean
  className?: string
  children: React.ReactNode
}

export function NavLink({
  href,
  exact = false,
  className = '',
  children,
}: Props) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={className}
    >
      {children}
    </Link>
  )
}