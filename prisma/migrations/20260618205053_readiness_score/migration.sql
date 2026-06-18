-- CreateTable
CREATE TABLE "ReadinessScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "targetCountryIso2" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "band" TEXT NOT NULL,
    "breakdown" TEXT NOT NULL,
    "topGaps" TEXT NOT NULL DEFAULT '[]',
    "narrative" TEXT,
    "source" TEXT NOT NULL DEFAULT 'rules',
    "model" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReadinessScore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ReadinessScore_companyId_targetCountryIso2_key" ON "ReadinessScore"("companyId", "targetCountryIso2");
