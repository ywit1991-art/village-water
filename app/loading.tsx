import { StatsCardSkeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-50/30">
      <div className="h-16 bg-brand-700" />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        <div className="h-[700px] rounded-2xl bg-slate-200/50 animate-pulse" />
      </main>
    </div>
  )
}