import prisma from '../db/prisma'
import { MatchType } from '@prisma/client'

export const matchesService = {
  async getUpcomingAndLast() {
    const [upcoming, last] = await Promise.all([
      prisma.match.findFirst({
        where: { type: MatchType.UPCOMING },
        orderBy: { matchDate: 'asc' },
      }),
      prisma.match.findFirst({
        where: { type: MatchType.LAST },
        orderBy: { matchDate: 'desc' },
      }),
    ])

    return { upcoming, last }
  },
}
