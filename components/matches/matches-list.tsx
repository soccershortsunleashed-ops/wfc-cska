"use client"

import { Match } from "@prisma/client"
import { MatchListItem } from "./match-list-item"

interface MatchesListProps {
  matches: Match[]
  emptyMessage?: string
}

export function MatchesList({ matches, emptyMessage = "Матчи не найдены" }: MatchesListProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <MatchListItem key={match.id} match={match} />
      ))}
    </div>
  )
}
