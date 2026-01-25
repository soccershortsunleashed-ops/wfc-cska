import { PlayerStats as Stats } from '@prisma/client';
import { Position } from '@prisma/client';

interface PlayerStatsProps {
  stats: Stats | null;
  position: Position;
}

export function PlayerStats({ stats, position }: PlayerStatsProps) {
  if (!stats) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="heading-md mb-4">Статистика</h2>
        <p className="body-md text-muted-foreground">
          Статистика пока недоступна
        </p>
      </div>
    );
  }

  const isGoalkeeper = position === 'GOALKEEPER';

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="heading-md">Статистика</h2>
        <span className="label-sm text-muted-foreground">
          Сезон {stats.season}
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Основная статистика */}
        <StatCard
          label="Игры"
          value={stats.gamesPlayed}
          icon="⚽"
        />
        <StatCard
          label="Минуты"
          value={stats.minutesPlayed}
          icon="⏱️"
        />

        {!isGoalkeeper && (
          <>
            <StatCard
              label="Голы"
              value={stats.goals}
              icon="🥅"
              highlight={stats.goals > 5}
            />
            <StatCard
              label="Ассисты"
              value={stats.assists}
              icon="🎯"
            />
          </>
        )}

        {/* Статистика для вратарей */}
        {isGoalkeeper && stats.cleanSheets !== null && (
          <>
            <StatCard
              label="Сухие матчи"
              value={stats.cleanSheets}
              icon="🧤"
              highlight={stats.cleanSheets > 5}
            />
            <StatCard
              label="Пропущено"
              value={stats.goalsConceded || 0}
              icon="⚠️"
            />
            <StatCard
              label="Сейвы"
              value={stats.saves || 0}
              icon="🛡️"
            />
          </>
        )}

        {/* Карточки */}
        <StatCard
          label="Желтые карточки"
          value={stats.yellowCards}
          icon="🟨"
        />
        {stats.redCards > 0 && (
          <StatCard
            label="Красные карточки"
            value={stats.redCards}
            icon="🟥"
            highlight
          />
        )}

        {/* Дополнительная статистика */}
        {stats.shotsOnTarget !== null && stats.shotsOnTarget > 0 && (
          <StatCard
            label="Удары в створ"
            value={stats.shotsOnTarget}
            icon="🎯"
          />
        )}

        {stats.passAccuracy !== null && (
          <StatCard
            label="Точность передач"
            value={`${stats.passAccuracy.toFixed(1)}%`}
            icon="📊"
          />
        )}
      </div>

      {/* Средние показатели */}
      {stats.gamesPlayed > 0 && (
        <div className="mt-6 border-t border-border pt-6">
          <h3 className="heading-sm mb-4">Средние показатели</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AverageStat
              label="Минут за игру"
              value={(stats.minutesPlayed / stats.gamesPlayed).toFixed(0)}
            />
            {!isGoalkeeper && (
              <>
                <AverageStat
                  label="Голов за игру"
                  value={(stats.goals / stats.gamesPlayed).toFixed(2)}
                />
                <AverageStat
                  label="Ассистов за игру"
                  value={(stats.assists / stats.gamesPlayed).toFixed(2)}
                />
              </>
            )}
            {isGoalkeeper && stats.goalsConceded !== null && (
              <AverageStat
                label="Пропущено за игру"
                value={(stats.goalsConceded / stats.gamesPlayed).toFixed(2)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  highlight?: boolean;
}

function StatCard({ label, value, icon, highlight }: StatCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        highlight
          ? 'border-accent bg-accent/5'
          : 'border-border bg-background'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="label-sm text-muted-foreground">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className={`player-number-large ${highlight ? 'text-accent' : ''}`}>
        {value}
      </div>
    </div>
  );
}

interface AverageStatProps {
  label: string;
  value: string;
}

function AverageStat({ label, value }: AverageStatProps) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="label-sm text-muted-foreground">{label}</div>
      <div className="heading-sm mt-1">{value}</div>
    </div>
  );
}
