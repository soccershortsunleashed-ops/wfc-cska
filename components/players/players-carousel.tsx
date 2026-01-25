"use client"

import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Player } from "@prisma/client"
import { PlayerCard } from "./player-card"
import { PlayerModal } from "./player-modal"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlayersCarouselProps {
  players: Player[]
  onPlayerClick?: (player: Player) => void
  className?: string
}

export function PlayersCarousel({
  players,
  onPlayerClick,
  className,
}: PlayersCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: false,
    containScroll: "trimSnaps",
    breakpoints: {
      "(min-width: 640px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 },
    },
  })

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  const handlePlayerClick = useCallback(
    (player: Player) => {
      setSelectedPlayer(player)
      setModalOpen(true)
      onPlayerClick?.(player)
    },
    [onPlayerClick]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [emblaApi])

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)

    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onKeyDown])

  if (players.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Игроки не найдены
      </div>
    )
  }

  return (
    <>
      <div className={cn("relative px-4 sm:px-6 lg:px-8", className)}>
        {/* Carousel Container */}
        <div className="overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8" ref={emblaRef}>
          <div className="flex gap-4 md:gap-6 px-4 sm:px-6 lg:px-8">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] xl:flex-[0_0_calc(25%-18px)]"
              >
                <PlayerCard player={player} onClick={handlePlayerClick} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        {players.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10",
                "h-12 w-12 rounded-full shadow-lg",
                "bg-background/95 backdrop-blur-sm",
                "transition-all duration-300",
                "hover:scale-110 hover:shadow-xl",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                prevBtnDisabled && "opacity-0 pointer-events-none"
              )}
              onClick={scrollPrev}
              disabled={prevBtnDisabled}
              aria-label="Предыдущий слайд"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10",
                "h-12 w-12 rounded-full shadow-lg",
                "bg-background/95 backdrop-blur-sm",
                "transition-all duration-300",
                "hover:scale-110 hover:shadow-xl",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                nextBtnDisabled && "opacity-0 pointer-events-none"
              )}
              onClick={scrollNext}
              disabled={nextBtnDisabled}
              aria-label="Следующий слайд"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Dots Indicators */}
        {scrollSnaps.length > 1 && (
          <div
            className="flex justify-center gap-2 mt-6"
            role="tablist"
            aria-label="Индикаторы слайдов карусели"
          >
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === selectedIndex}
                aria-label={`Перейти к слайду ${index + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  index === selectedIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                onClick={() => scrollTo(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Player Modal */}
      <PlayerModal
        player={selectedPlayer}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}
