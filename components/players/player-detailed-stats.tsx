import { PlayerStats as Stats, Position } from '@prisma/client'

interface PlayerDetailedStatsProps {
  stats: Stats | null
  position: Position
}

export function PlayerDetailedStats({ stats, position }: PlayerDetailedStatsProps) {
  if (!stats) {
    return (
      <div className="mt-8 text-center py-12">
        <p className="text-white/60">Статистика пока недоступна</p>
      </div>
    )
  }

  const isGoalkeeper = position === 'GOALKEEPER'

  return (
    <div className="mt-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Статистика сезона {stats.season}
        </h2>
        {stats.rustatSynced && stats.rustatSyncedAt && (
          <p className="text-xs text-white/50">
            Обновлено: {new Date(stats.rustatSyncedAt).toLocaleDateString('ru-RU')}
          </p>
        )}
      </div>

      {/* Основная статистика */}
      <StatsSection title="Общая статистика">
        <StatCard label="Матчи" value={stats.gamesPlayed} />
        <StatCard label="Минуты" value={stats.minutesPlayed} />
        {!isGoalkeeper && (
          <>
            <StatCard label="Голы" value={stats.goals} highlight={stats.goals > 0} />
            <StatCard label="Ассисты" value={stats.assists} highlight={stats.assists > 0} />
          </>
        )}
        <StatCard label="Желтые карточки" value={stats.yellowCards} />
        <StatCard label="Красные карточки" value={stats.redCards} warning={stats.redCards > 0} />
      </StatsSection>

      {/* Статистика для полевых игроков */}
      {!isGoalkeeper && (
        <>
          {/* Атака */}
          <StatsSection title="Атака">
            <StatCard label="Удары" value={stats.shots} />
            <StatCard label="Удары в створ" value={stats.shotsOnTarget} />
            <StatCard 
              label="Точность ударов" 
              value={stats.shotAccuracy ? `${stats.shotAccuracy.toFixed(1)}%` : '—'} 
            />
            <StatCard label="Дриблинг (попытки)" value={stats.dribbles} />
            <StatCard label="Дриблинг (успешно)" value={stats.dribblesSuccess} />
            <StatCard label="Фолы полученные" value={stats.foulsDrawn} />
          </StatsSection>

          {/* Передачи */}
          <StatsSection title="Передачи">
            <StatCard label="Передачи" value={stats.passes} />
            <StatCard label="Точные передачи" value={stats.passesAccurate} />
            <StatCard 
              label="Точность передач" 
              value={stats.passAccuracy ? `${stats.passAccuracy.toFixed(1)}%` : '—'} 
            />
            <StatCard label="Ключевые передачи" value={stats.keyPasses} highlight={stats.keyPasses > 0} />
          </StatsSection>

          {/* Единоборства */}
          <StatsSection title="Единоборства">
            <StatCard label="Единоборства" value={stats.duels} />
            <StatCard label="Выиграно" value={stats.duelsWon} />
            <StatCard 
              label="Процент побед" 
              value={stats.duelWinRate ? `${stats.duelWinRate.toFixed(1)}%` : '—'} 
            />
          </StatsSection>

          {/* Защита */}
          <StatsSection title="Защита">
            <StatCard label="Перехваты" value={stats.interceptions} />
            <StatCard label="Отборы" value={stats.tackles} />
            <StatCard label="Успешные отборы" value={stats.tacklesWon} />
            <StatCard label="Блоки" value={stats.blocks} />
            <StatCard label="Выносы" value={stats.clearances} />
          </StatsSection>

          {/* Дисциплина */}
          <StatsSection title="Дисциплина">
            <StatCard label="Фолы совершено" value={stats.foulsCommitted} />
            <StatCard label="Фолы получено" value={stats.foulsDrawn} />
            <StatCard label="Желтые карточки" value={stats.yellowCards} />
            <StatCard label="Красные карточки" value={stats.redCards} warning={stats.redCards > 0} />
          </StatsSection>
        </>
      )}

      {/* Статистика для вратарей */}
      {isGoalkeeper && (
        <StatsSection title="Статистика вратаря">
          <StatCard label="Сейвы" value={stats.saves || 0} highlight={(stats.saves || 0) > 0} />
          <StatCard label="Пропущено голов" value={stats.goalsConceded || 0} />
          <StatCard 
            label="Процент отражений" 
            value={stats.savePercentage ? `${stats.savePercentage.toFixed(1)}%` : '—'} 
          />
          <StatCard label="Сухие матчи" value={stats.cleanSheets || 0} highlight={(stats.cleanSheets || 0) > 0} />
        </StatsSection>
      )}
    </div>
  )
}

// Секция статистики
interface StatsSectionProps {
  title: string
  children: React.ReactNode
}

function StatsSection({ title, children }: StatsSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  )
}

// Карточка статистики
interface StatCardProps {
  label: string
  value: number | string
  highlight?: boolean
  warning?: boolean
}

function StatCard({ label, value, highlight, warning }: StatCardProps) {
  let textColor = 'text-white'
  if (highlight) textColor = 'text-[#E4002B]'
  if (warning) textColor = 'text-yellow-400'

  return (
    <div className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors border border-white/10">
      <div className={`text-3xl md:text-4xl font-bold mb-1 ${textColor}`}>
        {value}
      </div>
      <div className="text-xs md:text-sm text-white/70 uppercase tracking-wide">
        {label}
      </div>
    </div>
  )
}
