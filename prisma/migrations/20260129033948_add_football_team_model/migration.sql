-- CreateTable
CREATE TABLE "FootballTeam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "shortName" TEXT,
    "aliases" TEXT,
    "logoFileName" TEXT,
    "colors" TEXT,
    "city" TEXT,
    "stadium" TEXT,
    "founded" INTEGER,
    "website" TEXT,
    "season" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "rustatId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "homeTeamId" TEXT,
    "awayTeamId" TEXT,
    "opponentName" TEXT,
    "opponentLogoUrl" TEXT,
    "cskaLogoUrl" TEXT,
    "isHome" BOOLEAN DEFAULT true,
    "matchDate" DATETIME NOT NULL,
    "venue" TEXT,
    "stadium" TEXT,
    "scoreHome" INTEGER,
    "scoreAway" INTEGER,
    "tournament" TEXT,
    "season" TEXT NOT NULL DEFAULT '2025/2026',
    "round" TEXT,
    "attendance" INTEGER,
    "referee" TEXT,
    "highlights" TEXT,
    "description" TEXT,
    "rustatId" INTEGER,
    "rustatSynced" BOOLEAN NOT NULL DEFAULT false,
    "rustatData" TEXT,
    "rustatSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "FootballTeam" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "FootballTeam" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("attendance", "createdAt", "cskaLogoUrl", "description", "highlights", "id", "isHome", "matchDate", "opponentLogoUrl", "opponentName", "referee", "round", "rustatData", "rustatId", "rustatSynced", "rustatSyncedAt", "scoreAway", "scoreHome", "season", "slug", "stadium", "status", "tournament", "type", "updatedAt", "venue") SELECT "attendance", "createdAt", "cskaLogoUrl", "description", "highlights", "id", "isHome", "matchDate", "opponentLogoUrl", "opponentName", "referee", "round", "rustatData", "rustatId", "rustatSynced", "rustatSyncedAt", "scoreAway", "scoreHome", "season", "slug", "stadium", "status", "tournament", "type", "updatedAt", "venue" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
CREATE UNIQUE INDEX "Match_slug_key" ON "Match"("slug");
CREATE INDEX "Match_homeTeamId_idx" ON "Match"("homeTeamId");
CREATE INDEX "Match_awayTeamId_idx" ON "Match"("awayTeamId");
CREATE INDEX "Match_matchDate_idx" ON "Match"("matchDate");
CREATE TABLE "new_StandingsTeam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT,
    "teamName" TEXT,
    "teamLogoUrl" TEXT,
    "tournament" TEXT NOT NULL,
    "season" TEXT NOT NULL DEFAULT '2025/2026',
    "position" INTEGER NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "drawn" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "goalDifference" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "form" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StandingsTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "FootballTeam" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StandingsTeam" ("createdAt", "drawn", "form", "goalDifference", "goalsAgainst", "goalsFor", "id", "lost", "played", "points", "position", "season", "teamLogoUrl", "teamName", "tournament", "updatedAt", "won") SELECT "createdAt", "drawn", "form", "goalDifference", "goalsAgainst", "goalsFor", "id", "lost", "played", "points", "position", "season", "teamLogoUrl", "teamName", "tournament", "updatedAt", "won" FROM "StandingsTeam";
DROP TABLE "StandingsTeam";
ALTER TABLE "new_StandingsTeam" RENAME TO "StandingsTeam";
CREATE INDEX "StandingsTeam_tournament_season_idx" ON "StandingsTeam"("tournament", "season");
CREATE INDEX "StandingsTeam_teamId_idx" ON "StandingsTeam"("teamId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "FootballTeam_season_competition_idx" ON "FootballTeam"("season", "competition");

-- CreateIndex
CREATE INDEX "FootballTeam_rustatId_idx" ON "FootballTeam"("rustatId");

-- CreateIndex
CREATE UNIQUE INDEX "FootballTeam_name_season_competition_key" ON "FootballTeam"("name", "season", "competition");
