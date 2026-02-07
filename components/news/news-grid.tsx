import { NewsCard } from './news-card';

interface News {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedAt: Date;
  category: string;
}

interface NewsGridProps {
  news: News[];
}

export function NewsGrid({ news }: NewsGridProps) {
  if (news.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Новости не найдены</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {news.map((item) => (
        <NewsCard
          key={item.id}
          slug={item.slug}
          title={item.title}
          excerpt={item.excerpt}
          coverImageUrl={item.coverImageUrl}
          publishedAt={item.publishedAt}
          category={item.category}
        />
      ))}
    </div>
  );
}
