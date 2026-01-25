import { PlayerStats as Stats } from '@prisma/client';
import { Position } from '@prisma/client';

interface PlayerStatsProps {
  stats: Stats | null;
  position: Position;
}

export function PlayerStats({ stats, position }: PlayerStatsProps) {
  if (!stats) {
    return null; // Просто не показываем секцию, если нет статистики
  }

  const isGoalkeeper = position === 'GOALKEEPER';

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-white">Статистика сезона {stats.season}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl">
        {/* Основная статистика - только самое важное */}
        <StatCard
          label="Матчи"
          value={stats.gamesPlayed}
        />

        {!isGoalkeeper ? (
          <>
            <StatCard
              label="Голы"
              value={stats.goals}
              highlight={stats.goals > 0}
            />
            <StatCard
              label="Ассисты"
              value={stats.assists}
            />
          </>
        ) : (
          <>
            <StatCard
              label="Сухие матчи"
              value={stats.cleanSheets || 0}
              highlight={(stats.cleanSheets || 0) > 0}
            />
            <StatCard
              label="Пропущено"
              value={stats.goalsConceded || 0}
            />
          </>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  highlight?: boolean;
}

function StatCard({ label, value, highlight }: StatCardProps) {
  return (
    <div className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors border border-white/10">
      <div className="text-3xl md:text-4xl font-bold mb-1 text-white" style={{ color: highlight ? '#E4002B' : 'white' }}>
        {value}
      </div>
      <div className="text-xs md:text-sm text-white/70 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}
