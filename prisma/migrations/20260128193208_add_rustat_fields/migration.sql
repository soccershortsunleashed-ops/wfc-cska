-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "opponentName" TEXT NOT NULL,
    "opponentLogoUrl" TEXT,
    "cskaLogoUrl" TEXT,
    "isHome" BOOLEAN NOT NULL DEFAULT true,
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
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Match" ("attendance", "createdAt", "cskaLogoUrl", "description", "highlights", "id", "isHome", "matchDate", "opponentLogoUrl", "opponentName", "referee", "round", "scoreAway", "scoreHome", "season", "slug", "stadium", "status", "tournament", "type", "updatedAt", "venue") SELECT "attendance", "createdAt", "cskaLogoUrl", "description", "highlights", "id", "isHome", "matchDate", "opponentLogoUrl", "opponentName", "referee", "round", "scoreAway", "scoreHome", "season", "slug", "stadium", "status", "tournament", "type", "updatedAt", "venue" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
CREATE UNIQUE INDEX "Match_slug_key" ON "Match"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
