-- CreateTable
CREATE TABLE "DemandRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "importerId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" TEXT,
    "targetCountryIso2" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DemandRequest_importerId_fkey" FOREIGN KEY ("importerId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DemandRequest_category_status_idx" ON "DemandRequest"("category", "status");

-- CreateIndex
CREATE INDEX "DemandRequest_importerId_idx" ON "DemandRequest"("importerId");
