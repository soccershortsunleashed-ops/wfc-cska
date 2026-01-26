import { Position } from "@prisma/client"

/**
 * Переводит позицию игрока на русский язык
 */
export function translatePosition(position: Position): string {
  const translations: Record<Position, string> = {
    GOALKEEPER: "Вратарь",
    DEFENDER: "Защитник",
    MIDFIELDER: "Полузащитник",
    FORWARD: "Нападающий",
  }

  return translations[position] || position
}
