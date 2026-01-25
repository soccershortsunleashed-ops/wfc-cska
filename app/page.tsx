import { Metadata } from "next"
import { Hero } from "@/components/sections/hero"
import { MatchCard } from "@/components/sections/match-card"
import { NewsSection } from "@/components/sections/news-section"
import { TeamCarouselSection } from "@/components/sections/team-carousel-section"
import { Sponsors } from "@/components/sections/sponsors"
import { matchesService } from "@/lib/services/matches.service"
import { newsService } from "@/lib/services/news.service"

export const metadata: Metadata = {
  title: "ЖФК ЦСКА - Официальный сайт женского футбольного клуба ЦСКА Москва",
  description:
    "Официальный сайт женского футбольного клуба ЦСКА Москва. Новости команды, расписание матчей, состав игроков, турнирная таблица и результаты. Следите за выступлениями ЖФК ЦСКА в чемпионате России.",
  keywords: [
    "ЖФК ЦСКА",
    "женский футбол",
    "ЦСКА Москва",
    "женская футбольная команда",
    "чемпионат России",
    "футбол",
    "женский спорт",
  ],
  openGraph: {
    title: "ЖФК ЦСКА - Официальный сайт",
    description:
      "Официальный сайт женского футбольного клуба ЦСКА Москва. Новости, матчи, состав команды.",
    url: "https://wfccska.ru",
    siteName: "ЖФК ЦСКА",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ЖФК ЦСКА Москва",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ЖФК ЦСКА - Официальный сайт",
    description:
      "Официальный сайт женского футбольного клуба ЦСКА Москва. Новости, матчи, состав команды.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
  },
}

export default async function Home() {
  const [matchesData, newsData] = await Promise.all([
    matchesService.getUpcomingAndLast(),
    newsService.list(6),
  ])

  const upcomingMatch = matchesData.upcoming
    ? {
        opponentName: matchesData.upcoming.opponentName,
        opponentLogoUrl: matchesData.upcoming.opponentLogoUrl,
        cskaLogoUrl: matchesData.upcoming.cskaLogoUrl,
        matchDate: matchesData.upcoming.matchDate.toISOString(),
        venue: matchesData.upcoming.venue,
        scoreHome: null,
        scoreAway: null,
      }
    : null

  const lastMatch = matchesData.last
    ? {
        opponentName: matchesData.last.opponentName,
        opponentLogoUrl: matchesData.last.opponentLogoUrl,
        cskaLogoUrl: matchesData.last.cskaLogoUrl,
        matchDate: matchesData.last.matchDate.toISOString(),
        venue: matchesData.last.venue,
        scoreHome: matchesData.last.scoreHome,
        scoreAway: matchesData.last.scoreAway,
      }
    : null

  const news = newsData.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    coverImageUrl: item.coverImageUrl,
    publishedAt: item.publishedAt.toISOString(),
  }))

  return (
    <div>
      <Hero upcomingMatch={upcomingMatch} />
      <MatchCard upcomingMatch={upcomingMatch} lastMatch={lastMatch} />
      <NewsSection news={news} />
      <TeamCarouselSection />
      <Sponsors />
    </div>
  )
}
