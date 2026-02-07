-- AlterTable
ALTER TABLE "Player" ADD COLUMN "rustatId" INTEGER;
ALTER TABLE "Player" ADD COLUMN "rustatName" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlayerStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "minutesPlayed" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "yellowCards" INTEGER NOT NULL DEFAULT 0,
    "redCards" INTEGER NOT NULL DEFAULT 0,
    "shots" INTEGER NOT NULL DEFAULT 0,
    "shotsOnTarget" INTEGER NOT NULL DEFAULT 0,
    "shotAccuracy" REAL,
    "passes" INTEGER NOT NULL DEFAULT 0,
    "passesAccurate" INTEGER NOT NULL DEFAULT 0,
    "passAccuracy" REAL,
    "keyPasses" INTEGER NOT NULL DEFAULT 0,
    "duels" INTEGER NOT NULL DEFAULT 0,
    "duelsWon" INTEGER NOT NULL DEFAULT 0,
    "duelWinRate" REAL,
    "interceptions" INTEGER NOT NULL DEFAULT 0,
    "tackles" INTEGER NOT NULL DEFAULT 0,
    "tacklesWon" INTEGER NOT NULL DEFAULT 0,
    "blocks" INTEGER NOT NULL DEFAULT 0,
    "clearances" INTEGER NOT NULL DEFAULT 0,
    "dribbles" INTEGER NOT NULL DEFAULT 0,
    "dribblesSuccess" INTEGER NOT NULL DEFAULT 0,
    "foulsDrawn" INTEGER NOT NULL DEFAULT 0,
    "foulsCommitted" INTEGER NOT NULL DEFAULT 0,
    "cleanSheets" INTEGER,
    "goalsConceded" INTEGER,
    "saves" INTEGER,
    "savePercentage" REAL,
    "penaltiesScored" INTEGER NOT NULL DEFAULT 0,
    "penaltiesMissed" INTEGER NOT NULL DEFAULT 0,
    "rustatPlayerId" INTEGER,
    "rustatSynced" BOOLEAN NOT NULL DEFAULT false,
    "rustatSyncedAt" DATETIME,
    "season" TEXT NOT NULL DEFAULT '2025/2026',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlayerStats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlayerStats" ("assists", "cleanSheets", "createdAt", "gamesPlayed", "goals", "goalsConceded", "id", "minutesPlayed", "passAccuracy", "playerId", "redCards", "saves", "season", "shotsOnTarget", "updatedAt", "yellowCards") SELECT "assists", "cleanSheets", "createdAt", "gamesPlayed", "goals", "goalsConceded", "id", "minutesPlayed", "passAccuracy", "playerId", "redCards", "saves", "season", coalesce("shotsOnTarget", 0) AS "shotsOnTarget", "updatedAt", "yellowCards" FROM "PlayerStats";
DROP TABLE "PlayerStats";
ALTER TABLE "new_PlayerStats" RENAME TO "PlayerStats";
CREATE UNIQUE INDEX "PlayerStats_playerId_key" ON "PlayerStats"("playerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Player_rustatId_idx" ON "Player"("rustatId");
