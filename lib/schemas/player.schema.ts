import { z } from 'zod'

export const PositionEnum = z.enum(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'])
export const TeamEnum = z.enum(['MAIN', 'YOUTH', 'JUNIOR'])

export const PlayerSchema = z.object({
  id: z.string(),
  slug: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  number: z.number(),
  position: PositionEnum,
  birthDate: z.date(),
  nationality: z.string(),
  heightCm: z.number().nullable(),
  weightKg: z.number().nullable(),
  photoUrl: z.string().nullable(),
  team: TeamEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const PlayersQuerySchema = z.object({
  position: PositionEnum.optional(),
  q: z.string().optional(),
  sort: z.enum(['number', 'name']).optional().default('number'),
  team: TeamEnum.optional(),
})

export type Player = z.infer<typeof PlayerSchema>
export type PlayersQuery = z.infer<typeof PlayersQuerySchema>
