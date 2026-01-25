import prisma from '../db/prisma'

export const newsService = {
  async list(limit: number = 6) {
    return prisma.news.findMany({
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })
  },

  async getBySlug(slug: string) {
    return prisma.news.findUnique({
      where: { slug },
    })
  },
}
