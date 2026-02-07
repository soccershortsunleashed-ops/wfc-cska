import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowLeft, Share2 } from 'lucide-react';
import { getNewsBySlug, getRelatedNews } from '@/lib/services/news.service';
import { Button } from '@/components/ui/button';
import { NewsCard } from '@/components/news/news-card';

interface NewsDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const news = await getNewsBySlug(params.slug);

  if (!news) {
    return {
      title: 'Новость не найдена | ЖФК ЦСКА',
    };
  }

  return {
    title: `${news.title} | ЖФК ЦСКА`,
    description: news.excerpt,
    openGraph: {
      title: news.title,
      description: news.excerpt,
      images: news.coverImageUrl ? [news.coverImageUrl] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const news = await getNewsBySlug(params.slug);

  if (!news) {
    notFound();
  }

  const relatedNews = await getRelatedNews(news.slug, news.category, 3);

  const formattedDate = new Date(news.publishedAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const categoryLabels: Record<string, string> = {
    'novosti-osnovy': 'Основная команда',
    'novosti-dublja': 'Молодежная команда',
    'club': 'Клуб',
    'novosti': 'Новости',
  };

  const categoryLabel = categoryLabels[news.category] || 'Новости';

  return (
    <div className="container py-8 md:py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/news">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к новостям
          </Button>
        </Link>
      </div>

      {/* Article */}
      <article className="mx-auto max-w-4xl">
        {/* Category badge */}
        <div className="mb-4">
          <span className="inline-block rounded-full bg-red-600 px-4 py-1.5 text-sm font-semibold text-white">
            {categoryLabel}
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
          {news.title}
        </h1>

        {/* Meta */}
        <div className="mb-8 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <time dateTime={news.publishedAt.toISOString()}>{formattedDate}</time>
          </div>
          
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Поделиться
          </Button>
        </div>

        {/* Cover image */}
        {news.coverImageUrl && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={news.coverImageUrl}
              alt={news.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>
        )}

        {/* Excerpt */}
        {news.excerpt && (
          <div className="mb-6 text-lg font-medium leading-relaxed text-muted-foreground">
            {news.excerpt}
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-red-600 hover:prose-a:text-red-700"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        {/* Share buttons */}
        <div className="mt-12 border-t pt-8">
          <p className="mb-4 text-sm font-medium">Поделиться новостью:</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              ВКонтакте
            </Button>
            <Button variant="outline" size="sm">
              Telegram
            </Button>
            <Button variant="outline" size="sm">
              Twitter
            </Button>
          </div>
        </div>
      </article>

      {/* Related news */}
      {relatedNews.length > 0 && (
        <div className="mx-auto mt-16 max-w-6xl">
          <h2 className="mb-6 text-2xl font-bold">Похожие новости</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedNews.map((item) => (
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
        </div>
      )}
    </div>
  );
}
