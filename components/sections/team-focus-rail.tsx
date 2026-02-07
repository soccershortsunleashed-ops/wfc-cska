import { playersService } from "@/lib/services/players.service"
import { FocusRail, FocusRailItem } from "@/components/ui/focus-rail"
import { translatePosition } from "@/lib/utils/position-translator"

export async function TeamFocusRail() {
  // Получаем игроков основного состава с фотографиями
  const players = await playersService.list({
    team: "MAIN",
    sort: "number",
  })

  // Фильтруем только игроков с фото и берем первых 12
  const featuredPlayers = players
    .filter(player => player.photoUrl && player.photoUrl !== "/placeholder.svg")
    .slice(0, 12)

  // Преобразуем данные игроков в формат FocusRailItem
  const railItems: FocusRailItem[] = featuredPlayers.map((player) => ({
    id: player.id,
    title: `${player.firstName} ${player.lastName}`,
    description: translatePosition(player.position),
    imageSrc: player.photoUrl || "/placeholder.svg",
    href: `/players/${player.slug}`,
    meta: player.number ? `№${player.number}` : undefined,
  }))

  return (
    <section className="relative w-full">
      {/* Плавный градиентный переход от белого к черному через синий */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background via-[#0033A0]/10 to-transparent pointer-events-none z-10" />
      
      <FocusRail 
        items={railItems}
        autoPlay={true}
        interval={5000}
        loop={true}
      />
    </section>
  )
}
