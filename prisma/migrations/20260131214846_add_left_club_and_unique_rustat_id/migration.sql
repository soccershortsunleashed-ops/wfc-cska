-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "nationality" TEXT NOT NULL,
    "heightCm" INTEGER,
    "weightKg" INTEGER,
    "photoUrl" TEXT,
    "team" TEXT NOT NULL DEFAULT 'MAIN',
    "rustatId" INTEGER,
    "rustatName" TEXT,
    "leftClub" BOOLEAN NOT NULL DEFAULT false,
    "contract" TEXT,
    "nationalTeam" TEXT,
    "positions" TEXT,
    "strongFoot" TEXT,
    "timeOnFieldPct" REAL,
    "availableSections" TEXT,
    "missingSections" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Player" ("availableSections", "birthDate", "contract", "createdAt", "firstName", "heightCm", "id", "lastName", "missingSections", "nationalTeam", "nationality", "number", "photoUrl", "position", "positions", "rustatId", "rustatName", "slug", "strongFoot", "team", "timeOnFieldPct", "updatedAt", "weightKg") SELECT "availableSections", "birthDate", "contract", "createdAt", "firstName", "heightCm", "id", "lastName", "missingSections", "nationalTeam", "nationality", "number", "photoUrl", "position", "positions", "rustatId", "rustatName", "slug", "strongFoot", "team", "timeOnFieldPct", "updatedAt", "weightKg" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE UNIQUE INDEX "Player_slug_key" ON "Player"("slug");
CREATE UNIQUE INDEX "Player_rustatId_key" ON "Player"("rustatId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
