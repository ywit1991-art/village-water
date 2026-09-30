import { ROLE_LABELS, ROLE_COLORS } from '@/lib/auth/permissions'
import type { StaffRole } from '@/lib/auth/session'

export function RoleBadge({ role }: { role: StaffRole }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[role]}`}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}