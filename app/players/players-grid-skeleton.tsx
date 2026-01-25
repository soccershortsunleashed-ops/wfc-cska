import { Skeleton } from "@/components/ui/skeleton"

export function PlayersGridSkeleton() {
  return (
    <div className="space-y-6">
      {/* Results Count Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Players Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            {/* Card Skeleton */}
            <div className="rounded-lg border bg-card overflow-hidden">
              {/* Image Skeleton */}
              <Skeleton className="aspect-[3/4] w-full" />
              
              {/* Content Skeleton */}
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
