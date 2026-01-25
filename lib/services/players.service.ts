import prisma from '../db/prisma'
import { Position, Team } from '@prisma/client'

export interface PlayersFilters {
  position?: Position
  q?: string
  sort?: 'number' | 'name'
  team?: Team
}

export const playersService = {
  async list(filters: PlayersFilters = {}) {
    const { position, q, sort = 'number', team } = filters

    const where: any = {}

    if (position) {
      where.position = position
    }

    if (team) {
      where.team = team
    }

    const orderBy: any = sort === 'number' 
      ? { number: 'asc' }
      : [{ lastName: 'asc' }, { firstName: 'asc' }]

    let players = await prisma.player.findMany({
      where,
      orderBy,
    })

    // If search query exists, filter in JavaScript for case-insensitive search
    // (SQLite LOWER() doesn't work well with Cyrillic characters)
    if (q) {
      const lowerQ = q.toLowerCase()
      players = players.filter(player => 
        player.firstName.toLowerCase().includes(lowerQ) ||
        player.lastName.toLowerCase().includes(lowerQ)
      )
    }

    return players
  },

  async getBySlug(slug: string) {
    return prisma.player.findUnique({
      where: { slug },
      include: {
        stats: true, // Include player statistics
      },
    })
  },
}
