-- AlterTable
ALTER TABLE "Player" ADD COLUMN "availableSections" TEXT;
ALTER TABLE "Player" ADD COLUMN "contract" TEXT;
ALTER TABLE "Player" ADD COLUMN "missingSections" TEXT;
ALTER TABLE "Player" ADD COLUMN "nationalTeam" TEXT;
ALTER TABLE "Player" ADD COLUMN "positions" TEXT;
ALTER TABLE "Player" ADD COLUMN "strongFoot" TEXT;
ALTER TABLE "Player" ADD COLUMN "timeOnFieldPct" REAL;

-- CreateTable
CREATE TABLE "PlayerMatchStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "minutesPlayed" INTEGER NOT NULL DEFAULT 0,
    "startSubstitute" TEXT,
    "position" TEXT,
    "rating" REAL,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "shots" INTEGER NOT NULL DEFAULT 0,
    "shotsOnTarget" INTEGER NOT NULL DEFAULT 0,
    "passes" INTEGER NOT NULL DEFAULT 0,
    "passesAccurate" INTEGER NOT NULL DEFAULT 0,
    "keyPasses" INTEGER NOT NULL DEFAULT 0,
    "duels" INTEGER NOT NULL DEFAULT 0,
    "duelsWon" INTEGER NOT NULL DEFAULT 0,
    "interceptions" INTEGER NOT NULL DEFAULT 0,
    "tackles" INTEGER NOT NULL DEFAULT 0,
    "blocks" INTEGER NOT NULL DEFAULT 0,
    "clearances" INTEGER NOT NULL DEFAULT 0,
    "yellowCards" INTEGER NOT NULL DEFAULT 0,
    "redCards" INTEGER NOT NULL DEFAULT 0,
    "rustatMatchId" INTEGER,
    "rustatData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlayerMatchStats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerMatchStats_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerShotsSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "shots" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "shotsOnTarget" INTEGER NOT NULL DEFAULT 0,
    "shotsOffTarget" INTEGER NOT NULL DEFAULT 0,
    "shotsBlocked" INTEGER NOT NULL DEFAULT 0,
    "shotsHitPost" INTEGER NOT NULL DEFAULT 0,
    "xG" REAL NOT NULL DEFAULT 0,
    "xGConversion" REAL,
    "penalties" INTEGER NOT NULL DEFAULT 0,
    "penaltiesScored" INTEGER NOT NULL DEFAULT 0,
    "penaltiesMissed" INTEGER NOT NULL DEFAULT 0,
    "season" TEXT NOT NULL DEFAULT '2025/2026',
    "lastUpdated" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerShotsSummary_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShotEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "matchId" TEXT,
    "minute" INTEGER NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "xG" REAL NOT NULL,
    "outcome" TEXT NOT NULL,
    "bodyPart" TEXT,
    "situation" TEXT,
    "assisted" BOOLEAN NOT NULL DEFAULT false,
    "fastBreak" BOOLEAN NOT NULL DEFAULT false,
    "rustatShotId" INTEGER,
    "rustatEventData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShotEvent_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ShotEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SyncMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "status" TEXT NOT NULL,
    "lastSyncAt" DATETIME NOT NULL,
    "nextSyncAt" DATETIME,
    "itemsProcessed" INTEGER NOT NULL DEFAULT 0,
    "itemsAdded" INTEGER NOT NULL DEFAULT 0,
    "itemsUpdated" INTEGER NOT NULL DEFAULT 0,
    "itemsSkipped" INTEGER NOT NULL DEFAULT 0,
    "itemsFailed" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT,
    "errorMessage" TEXT,
    "duration" INTEGER,
    "rustatToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "PlayerMatchStats_matchId_idx" ON "PlayerMatchStats"("matchId");

-- CreateIndex
CREATE INDEX "PlayerMatchStats_playerId_idx" ON "PlayerMatchStats"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerMatchStats_playerId_matchId_key" ON "PlayerMatchStats"("playerId", "matchId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerShotsSummary_playerId_key" ON "PlayerShotsSummary"("playerId");

-- CreateIndex
CREATE INDEX "ShotEvent_playerId_idx" ON "ShotEvent"("playerId");

-- CreateIndex
CREATE INDEX "ShotEvent_matchId_idx" ON "ShotEvent"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "ShotEvent_playerId_matchId_minute_x_y_key" ON "ShotEvent"("playerId", "matchId", "minute", "x", "y");

-- CreateIndex
CREATE INDEX "SyncMetadata_entityType_status_idx" ON "SyncMetadata"("entityType", "status");

-- CreateIndex
CREATE INDEX "SyncMetadata_lastSyncAt_idx" ON "SyncMetadata"("lastSyncAt");
