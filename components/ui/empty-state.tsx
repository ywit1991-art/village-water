import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && (
        <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-5">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}