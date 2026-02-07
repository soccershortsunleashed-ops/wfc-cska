import { Skeleton } from '@/components/ui/skeleton';

export default function NewsDetailLoading() {
  return (
    <div className="container py-8 md:py-12">
      {/* Back button skeleton */}
      <div className="mb-6">
        <Skeleton className="h-9 w-40" />
      </div>

      {/* Article skeleton */}
      <article className="mx-auto max-w-4xl">
        {/* Category badge */}
        <div className="mb-4">
          <Skeleton className="h-7 w-32" />
        </div>

        {/* Title */}
        <Skeleton className="mb-4 h-12 w-full" />
        <Skeleton className="mb-4 h-12 w-3/4" />

        {/* Meta */}
        <div className="mb-8 flex items-center gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Cover image */}
        <Skeleton className="mb-8 aspect-video w-full" />

        {/* Excerpt */}
        <Skeleton className="mb-6 h-6 w-full" />
        <Skeleton className="mb-6 h-6 w-5/6" />

        {/* Content */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </article>
    </div>
  );
}
