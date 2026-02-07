import prisma from '../db/prisma'
import { Position, PlayerTeam } from '@prisma/client'

export interface PlayersFilters {
  position?: Position
  q?: string
  sort?: 'number' | 'name'
  team?: PlayerTeam
}

export const playersService = {
  async list(filters: PlayersFilters = {}) {
    const { position, q, sort = 'number', team } = filters

    const where: any = {
      leftClub: false // Не показываем ушедших игроков
    }

    if (position) {
      where.position = position
    }

    if (team) {
      where.team = team
    }

    const orderBy = sort === 'number' 
      ? { number: 'asc' as const }
      : { lastName: 'asc' as const }

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
