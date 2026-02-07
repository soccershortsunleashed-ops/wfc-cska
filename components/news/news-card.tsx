import Image from 'next/image';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface NewsCardProps {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string | null;
  publishedAt: Date;
  category: string;
}

export function NewsCard({
  slug,
  title,
  excerpt,
  coverImageUrl,
  publishedAt,
  category,
}: NewsCardProps) {
  const formattedDate = new Date(publishedAt).toLocaleDateString('ru-RU', {
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

  const categoryLabel = categoryLabels[category] || 'Новости';

  return (
    <Link href={`/news/${slug}`}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
        {/* Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-red-900/20 to-blue-900/20">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-6xl font-bold text-white/10">ЖФК ЦСКА</div>
            </div>
          )}
          
          {/* Category badge */}
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Content */}
        <CardHeader className="pb-3">
          <h3 className="line-clamp-2 text-xl font-bold leading-tight transition-colors group-hover:text-red-600">
            {title}
          </h3>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {excerpt}
          </p>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <time dateTime={publishedAt.toISOString()}>{formattedDate}</time>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
