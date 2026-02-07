import { Suspense } from 'react';
import { Metadata } from 'next';
import { NewsGrid } from '@/components/news/news-grid';
import { NewsFilters } from '@/components/news/news-filters';
import { NewsPagination } from '@/components/news/news-pagination';
import { getNewsList } from '@/lib/services/news.service';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Новости | ЖФК ЦСКА',
  description: 'Последние новости женского футбольного клуба ЦСКА',
};

interface NewsPageProps {
  searchParams: {
    page?: string;
    category?: string;
    sort?: 'newest' | 'oldest';
  };
}

function NewsGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const category = searchParams.category;
  const sort = searchParams.sort || 'newest';

  const { news, pagination } = await getNewsList({
    page,
    category,
    sort,
    pageSize: 12,
  });

  return (
    <div className="container py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Новости
        </h1>
        <p className="text-lg text-muted-foreground">
          Последние новости и события женского футбольного клуба ЦСКА
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <NewsFilters />
        </Suspense>
      </div>

      {/* Stats */}
      <div className="mb-6 text-sm text-muted-foreground">
        Найдено новостей: {pagination.totalItems}
      </div>

      {/* News Grid */}
      <Suspense fallback={<NewsGridSkeleton />}>
        <NewsGrid news={news} />
      </Suspense>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-12">
          <Suspense fallback={<Skeleton className="h-10 w-full" />}>
            <NewsPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
