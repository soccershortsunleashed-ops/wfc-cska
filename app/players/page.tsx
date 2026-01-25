import { Metadata } from "next"
import { Suspense } from "react"
import { PlayersFilters } from "@/components/players"
import { PlayersGrid } from "./players-grid"
import { PlayersGridSkeleton } from "./players-grid-skeleton"

export const metadata: Metadata = {
  title: "Состав команды - ЖФК ЦСКА",
  description:
    "Полный состав женского футбольного клуба ЦСКА Москва. Информация об игроках основной команды, молодежного и юниорского составов. Фотографии, биографии, статистика игроков.",
  keywords: [
    "состав ЖФК ЦСКА",
    "игроки ЦСКА",
    "женская футбольная команда ЦСКА",
    "футболистки ЦСКА",
    "состав команды",
    "игроки женского футбола",
  ],
  openGraph: {
    title: "Состав команды - ЖФК ЦСКА",
    description:
      "Полный состав женского футбольного клуба ЦСКА Москва. Информация об игроках, фотографии, биографии.",
    url: "https://wfccska.ru/players",
    siteName: "ЖФК ЦСКА",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/images/og-players.jpg",
        width: 1200,
        height: 630,
        alt: "Состав ЖФК ЦСКА",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Состав команды - ЖФК ЦСКА",
    description:
      "Полный состав женского футбольного клуба ЦСКА Москва. Информация об игроках, фотографии, биографии.",
    images: ["/images/og-players.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

interface PlayersPageProps {
  searchParams: Promise<{
    position?: string
    team?: string
    sort?: string
    q?: string
  }>
}

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const params = await searchParams
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="container px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Состав команды
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Познакомьтесь с игроками женского футбольного клуба ЦСКА Москва
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Players Grid */}
      <section className="container px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-8">
          {/* Filters */}
          <Suspense fallback={<div className="h-20" />}>
            <PlayersFilters />
          </Suspense>

          {/* Players Grid with Suspense */}
          <Suspense
            key={JSON.stringify(params)}
            fallback={<PlayersGridSkeleton />}
          >
            <PlayersGrid searchParams={params} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
