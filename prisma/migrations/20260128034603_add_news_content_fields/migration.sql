/*
  Warnings:

  - Added the required column `content` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_News" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "publishedAt" DATETIME NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'novosti',
    "originalUrl" TEXT,
    "type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_News" ("coverImageUrl", "createdAt", "excerpt", "id", "publishedAt", "slug", "title", "updatedAt") SELECT "coverImageUrl", "createdAt", "excerpt", "id", "publishedAt", "slug", "title", "updatedAt" FROM "News";
DROP TABLE "News";
ALTER TABLE "new_News" RENAME TO "News";
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
