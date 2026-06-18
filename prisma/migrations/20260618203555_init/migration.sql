-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "emailVerified" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "countryIso2" TEXT NOT NULL,
    "verification" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExporterProfile" (
    "companyId" TEXT NOT NULL PRIMARY KEY,
    "governorate" TEXT NOT NULL,
    "sectors" TEXT NOT NULL DEFAULT '[]',
    "exportStage" TEXT NOT NULL,
    "certifications" TEXT NOT NULL DEFAULT '[]',
    "yearEstablished" INTEGER,
    "employeeBucket" TEXT,
    "capacityNote" TEXT,
    "hasExportLicense" BOOLEAN NOT NULL DEFAULT false,
    "currentMarkets" TEXT NOT NULL DEFAULT '[]',
    "targetMarkets" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "ExporterProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImporterProfile" (
    "companyId" TEXT NOT NULL PRIMARY KEY,
    "industries" TEXT NOT NULL DEFAULT '[]',
    "categoriesOfInterest" TEXT NOT NULL DEFAULT '[]',
    "orderVolume" TEXT,
    CONSTRAINT "ImporterProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_ownerId_key" ON "Company"("ownerId");

-- CreateIndex
CREATE INDEX "Company_type_verification_idx" ON "Company"("type", "verification");

-- CreateIndex
CREATE INDEX "Product_companyId_idx" ON "Product"("companyId");
