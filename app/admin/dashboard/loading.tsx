import { StatsCardSkeleton, TableSkeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div
      className="min-h-screen bg-brand-50/30"
      role="status"
      aria-live="polite"
      aria-label="กำลังโหลดแดชบอร์ด"
    >
      <div className="h-16 bg-brand-700" />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        <TableSkeleton rows={6} />
      </main>

      <span className="sr-only">กำลังโหลดแดชบอร์ด...</span>
    </div>
  )
}