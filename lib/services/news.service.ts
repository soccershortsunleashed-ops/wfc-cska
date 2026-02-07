import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
});

const prisma = new PrismaClient({ adapter });

export interface GetNewsParams {
  page?: number;
  pageSize?: number;
  category?: string;
  sort?: 'newest' | 'oldest';
}

export interface NewsListResult {
  news: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverImageUrl: string | null;
    publishedAt: Date;
    category: string;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}

export async function getNewsList(params: GetNewsParams = {}): Promise<NewsListResult> {
  const {
    page = 1,
    pageSize = 12,
    category,
    sort = 'newest',
  } = params;

  // Build where clause
  const where = category && category !== 'all' ? { category } : {};

  // Get total count
  const totalItems = await prisma.news.count({ where });
  const totalPages = Math.ceil(totalItems / pageSize);

  // Get news
  const news = await prisma.news.findMany({
    where,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
      category: true,
    },
    orderBy: {
      publishedAt: sort === 'newest' ? 'desc' : 'asc',
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return {
    news,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      pageSize,
    },
  };
}

export async function getNewsBySlug(slug: string) {
  return await prisma.news.findUnique({
    where: { slug },
  });
}

export async function getRelatedNews(currentSlug: string, category: string, limit = 3) {
  return await prisma.news.findMany({
    where: {
      slug: { not: currentSlug },
      category,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
      category: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: limit,
  });
}

export async function getLatestNews(limit = 5) {
  return await prisma.news.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
      category: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: limit,
  });
}
