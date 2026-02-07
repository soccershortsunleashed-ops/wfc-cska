import { Metadata } from "next"
import { Hero } from "@/components/sections/hero"
import { MatchCard } from "@/components/sections/match-card"
import { NewsSection } from "@/components/sections/news-section"
import { TeamFocusRail } from "@/components/sections/team-focus-rail"
import { Sponsors } from "@/components/sections/sponsors"
import { matchesService } from "@/lib/services/matches.service"
import { getLatestNews } from "@/lib/services/news.service"
import { transformMatchForClient } from "@/lib/utils/match-helpers"

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
    matchesService.getMatchesForHomepage(),
    getLatestNews(6),
  ])

  const lastMatch = matchesData.lastMatch
    ? transformMatchForClient(matchesData.lastMatch)
    : null

  const nextMatch = matchesData.nextMatch
    ? transformMatchForClient(matchesData.nextMatch)
    : null

  const futureMatch = matchesData.futureMatch
    ? transformMatchForClient(matchesData.futureMatch)
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
      <Hero upcomingMatch={nextMatch} />
      <MatchCard 
        lastMatch={lastMatch} 
        nextMatch={nextMatch} 
        futureMatch={futureMatch} 
      />
      <NewsSection news={news} />
      <TeamFocusRail />
      <Sponsors />
    </div>
  )
}
