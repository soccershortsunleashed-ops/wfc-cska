import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/layout/container"
import { getImageProps, IMAGE_SIZES, getResponsiveSizes } from "@/lib/image-utils"

interface News {
  id: string
  slug: string
  title: string
  excerpt: string
  coverImageUrl: string | null
  publishedAt: string
}

interface NewsSectionProps {
  news: News[]
}

export function NewsSection({ news }: NewsSectionProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Только что"
    if (diffInHours < 24) return `${diffInHours} ч. назад`
    if (diffInHours < 48) return "Вчера"
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} дн. назад`
    
    return formatDate(dateString)
  }

  if (!news || news.length === 0) {
    return null
  }

  const [featuredNews, ...otherNews] = news

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Новости</h2>
            <p className="text-muted-foreground">
              Последние новости и события клуба
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden md:flex button-hover focus-ring">
            <Link href="/news">
              Все новости
              <ArrowRight className="ml-2 h-4 w-4 icon-slide" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Featured News */}
          {featuredNews && (
            <Card className="lg:row-span-2 overflow-hidden group border-hover gpu-accelerated">
                <Link href={`/news/${featuredNews.slug}`} className="focus-ring">
                  <div className="relative h-64 md:h-80 lg:min-h-[600px] overflow-hidden bg-muted">
                    {featuredNews.coverImageUrl ? (
                      <Image
                        {...getImageProps(featuredNews.coverImageUrl, featuredNews.title, { priority: true })}
                        fill
                        sizes={getResponsiveSizes('newsFeatured')}
                        className="object-cover image-hover"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--cska-blue)] to-[var(--cska-blue)]/80">
                        <span className="text-6xl font-bold text-white/20">ЖФК</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-[var(--cska-red)] text-white hover:bg-[var(--cska-red)]/90">
                        Главная новость
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{getTimeAgo(featuredNews.publishedAt)}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 line-clamp-2">
                        {featuredNews.title}
                      </h3>
                      <p className="text-gray-200 line-clamp-2 mb-4">
                        {featuredNews.excerpt}
                      </p>
                      <span className="inline-flex items-center text-sm font-medium group-hover:gap-2 transition-all">
                        Читать далее
                        <ArrowRight className="ml-1 h-4 w-4 icon-slide" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Card>
          )}

          {/* Other News Cards */}
          <div className="space-y-6">
            {otherNews.slice(0, 2).map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        </div>

        {/* Additional News Grid */}
        {otherNews.length > 2 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherNews.slice(2, 5).map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        )}

        {/* Mobile "All News" Button */}
        <div className="text-center mt-8 md:hidden">
            <Button asChild variant="outline" className="w-full button-hover focus-ring">
              <Link href="/news">
                Все новости
                <ArrowRight className="ml-2 h-4 w-4 icon-slide" />
              </Link>
            </Button>
          </div>
      </Container>
    </section>
  )
}

function NewsCard({ news }: { news: News }) {
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Только что"
    if (diffInHours < 24) return `${diffInHours} ч. назад`
    if (diffInHours < 48) return "Вчера"
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} дн. назад`
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
      }).format(date)
    }
    
    return formatDate(dateString)
  }

  return (
    <Card className="overflow-hidden group card-hover gpu-accelerated">
      <Link href={`/news/${news.slug}`} className="focus-ring">
        <CardHeader className="p-0">
          <div className="relative h-48 overflow-hidden bg-muted">
            {news.coverImageUrl ? (
              <Image
                {...getImageProps(news.coverImageUrl, news.title)}
                fill
                sizes={getResponsiveSizes('newsCard')}
                className="object-cover image-hover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <span className="text-4xl font-bold text-muted-foreground/20">ЖФК</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{getTimeAgo(news.publishedAt)}</span>
          </div>
          <h3 className="text-xl font-bold mb-2 line-clamp-2 color-transition group-hover:text-[var(--cska-blue)]">
            {news.title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {news.excerpt}
          </p>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-0">
          <span className="inline-flex items-center text-sm font-medium text-[var(--cska-blue)] group-hover:gap-2 transition-all">
            Читать далее
            <ArrowRight className="ml-1 h-4 w-4 icon-slide" />
          </span>
        </CardFooter>
      </Link>
    </Card>
  )
}
