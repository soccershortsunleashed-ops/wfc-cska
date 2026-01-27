import { Metadata } from "next"
import { Hero } from "@/components/sections/hero"
import { MatchCard } from "@/components/sections/match-card"
import { NewsSection } from "@/components/sections/news-section"
import { TeamFocusRail } from "@/components/sections/team-focus-rail"
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
    matchesService.getMatchesForHomepage(),
    newsService.list(6),
  ])

  const lastMatch = matchesData.lastMatch
    ? {
        opponentName: matchesData.lastMatch.opponentName,
        opponentLogoUrl: matchesData.lastMatch.opponentLogoUrl,
        cskaLogoUrl: matchesData.lastMatch.cskaLogoUrl,
        matchDate: matchesData.lastMatch.matchDate.toISOString(),
        venue: matchesData.lastMatch.venue,
        scoreHome: matchesData.lastMatch.scoreHome,
        scoreAway: matchesData.lastMatch.scoreAway,
        isHome: matchesData.lastMatch.isHome,
        slug: matchesData.lastMatch.slug,
      }
    : null

  const nextMatch = matchesData.nextMatch
    ? {
        opponentName: matchesData.nextMatch.opponentName,
        opponentLogoUrl: matchesData.nextMatch.opponentLogoUrl,
        cskaLogoUrl: matchesData.nextMatch.cskaLogoUrl,
        matchDate: matchesData.nextMatch.matchDate.toISOString(),
        venue: matchesData.nextMatch.venue,
        scoreHome: null,
        scoreAway: null,
        isHome: matchesData.nextMatch.isHome,
        slug: matchesData.nextMatch.slug,
      }
    : null

  const futureMatch = matchesData.futureMatch
    ? {
        opponentName: matchesData.futureMatch.opponentName,
        opponentLogoUrl: matchesData.futureMatch.opponentLogoUrl,
        cskaLogoUrl: matchesData.futureMatch.cskaLogoUrl,
        matchDate: matchesData.futureMatch.matchDate.toISOString(),
        venue: matchesData.futureMatch.venue,
        scoreHome: null,
        scoreAway: null,
        isHome: matchesData.futureMatch.isHome,
        slug: matchesData.futureMatch.slug,
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
