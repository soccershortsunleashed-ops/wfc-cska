import { playersService } from "@/lib/services/players.service"
import { FocusRail, FocusRailItem } from "@/components/ui/focus-rail"
import { translatePosition } from "@/lib/utils/position-translator"

export async function TeamFocusRail() {
  // Получаем первых 12 игроков основного состава
  const players = await playersService.list({
    team: "MAIN",
    sort: "number",
  })

  const featuredPlayers = players.slice(0, 12)

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
    <section className="w-full">
      <FocusRail 
        items={railItems}
        autoPlay={true}
        interval={5000}
        loop={true}
      />
    </section>
  )
}
