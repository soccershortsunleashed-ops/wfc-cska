import { MatchTimeline, MatchEvent } from "@/components/matches/match-timeline"
import { MatchStats, MatchStatistics } from "@/components/matches/match-stats"
import { TournamentTable, TournamentTeam } from "@/components/matches/tournament-table"

// Тестовые данные для таймлайна
const mockEvents: MatchEvent[] = [
  {
    id: "1",
    minute: 12,
    type: "goal",
    team: "home",
    playerName: "Иванова А.",
    assistPlayerName: "Петрова М.",
    description: "Точный удар с правой ноги в дальний угол",
  },
  {
    id: "2",
    minute: 23,
    type: "yellow_card",
    team: "away",
    playerName: "Сидорова К.",
    description: "Грубый фол в центре поля",
  },
  {
    id: "3",
    minute: 34,
    type: "substitution",
    team: "home",
    playerName: "Смирнова Е. → Козлова Д.",
  },
  {
    id: "4",
    minute: 45,
    type: "goal",
    team: "away",
    playerName: "Николаева В.",
    description: "Гол после розыгрыша углового",
  },
  {
    id: "5",
    minute: 67,
    type: "goal",
    team: "home",
    playerName: "Козлова Д.",
    assistPlayerName: "Иванова А.",
    description: "Контратака, завершённая точным ударом",
  },
  {
    id: "6",
    minute: 78,
    type: "red_card",
    team: "away",
    playerName: "Сидорова К.",
    description: "Вторая жёлтая карточка",
  },
  {
    id: "7",
    minute: 89,
    type: "goal",
    team: "home",
    playerName: "Иванова А.",
    description: "Пенальти",
  },
]

// Тестовые данные для статистики
const mockStats: MatchStatistics = {
  possession: { home: 58, away: 42 },
  shots: { home: 18, away: 12 },
  shotsOnTarget: { home: 8, away: 5 },
  corners: { home: 7, away: 4 },
  fouls: { home: 11, away: 15 },
  offsides: { home: 2, away: 3 },
  yellowCards: { home: 1, away: 3 },
  redCards: { home: 0, away: 1 },
  saves: { home: 4, away: 5 },
  passAccuracy: { home: 84, away: 78 },
}

// Тестовые данные для турнирной таблицы
const mockTeams: TournamentTeam[] = [
  {
    position: 1,
    teamName: "ЦСКА",
    teamLogoUrl: "/seed-assets/cska-logo.png",
    played: 15,
    won: 12,
    drawn: 2,
    lost: 1,
    goalsFor: 38,
    goalsAgainst: 8,
    goalDifference: 30,
    points: 38,
    form: ["W", "W", "D", "W", "W"],
    isCSKA: true,
  },
  {
    position: 2,
    teamName: "Спартак",
    played: 15,
    won: 10,
    drawn: 3,
    lost: 2,
    goalsFor: 32,
    goalsAgainst: 12,
    goalDifference: 20,
    points: 33,
    form: ["W", "D", "W", "L", "W"],
  },
  {
    position: 3,
    teamName: "Зенит",
    played: 15,
    won: 9,
    drawn: 4,
    lost: 2,
    goalsFor: 28,
    goalsAgainst: 14,
    goalDifference: 14,
    points: 31,
    form: ["D", "W", "W", "D", "W"],
  },
  {
    position: 4,
    teamName: "Локомотив",
    played: 15,
    won: 8,
    drawn: 3,
    lost: 4,
    goalsFor: 24,
    goalsAgainst: 18,
    goalDifference: 6,
    points: 27,
    form: ["L", "W", "D", "W", "L"],
  },
  {
    position: 5,
    teamName: "Динамо",
    played: 15,
    won: 7,
    drawn: 4,
    lost: 4,
    goalsFor: 22,
    goalsAgainst: 16,
    goalDifference: 6,
    points: 25,
    form: ["W", "D", "L", "W", "D"],
  },
  {
    position: 6,
    teamName: "Краснодар",
    played: 15,
    won: 6,
    drawn: 5,
    lost: 4,
    goalsFor: 20,
    goalsAgainst: 18,
    goalDifference: 2,
    points: 23,
    form: ["D", "W", "L", "D", "W"],
  },
  {
    position: 7,
    teamName: "Ростов",
    played: 15,
    won: 5,
    drawn: 4,
    lost: 6,
    goalsFor: 18,
    goalsAgainst: 22,
    goalDifference: -4,
    points: 19,
    form: ["L", "D", "W", "L", "D"],
  },
  {
    position: 8,
    teamName: "Рубин",
    played: 15,
    won: 3,
    drawn: 3,
    lost: 9,
    goalsFor: 12,
    goalsAgainst: 28,
    goalDifference: -16,
    points: 12,
    form: ["L", "L", "D", "L", "W"],
  },
]

export default function TestMatchComponentsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Тестирование компонентов матчей</h1>
        <p className="text-muted-foreground">
          Демонстрация компонентов MatchTimeline, MatchStats и TournamentTable
        </p>
      </div>

      {/* Match Timeline */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Хронология матча</h2>
        <MatchTimeline events={mockEvents} homeTeam="ЦСКА" awayTeam="Динамо" />
      </section>

      {/* Match Stats */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Статистика матча</h2>
        <MatchStats stats={mockStats} homeTeam="ЦСКА" awayTeam="Динамо" />
      </section>

      {/* Tournament Table */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Турнирная таблица</h2>
        <TournamentTable
          teams={mockTeams}
          tournamentName="Суперлига"
          season="2025"
          highlightPositions={{
            champions: [1],
            championsLeague: [2, 3],
            europaLeague: [4, 5],
            relegation: [7, 8],
          }}
        />
      </section>
    </div>
  )
}
