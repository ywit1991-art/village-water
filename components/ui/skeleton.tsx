import { clsx } from 'clsx'

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-lg bg-slate-200/70',
        className,
      )}
      {...props}
    />
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-7 w-24" />
    </div>
  )
}

export function MapSkeleton({ height = 'h-[700px]' }: { height?: string }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-brand-100 bg-brand-50/30 flex items-center justify-center',
        height,
      )}
    >
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        <p className="mt-4 text-sm text-brand-500 font-medium">
          กำลังโหลดแผนที่...
        </p>
      </div>
    </div>
  )
}

export function ChartSkeleton({ height = 'h-[400px]' }: { height?: string }) {
  return (
    <div className="card p-6">
      <Skeleton className="h-5 w-40 mb-6" />
      <div className={clsx('flex items-end gap-2', height)}>
        {[40, 60, 30, 80, 50, 70, 45, 90, 55, 65].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card p-6 space-y-3">
      <Skeleton className="h-5 w-40 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}