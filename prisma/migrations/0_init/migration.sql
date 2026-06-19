-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandRequest" (
    "id" TEXT NOT NULL,
    "importerId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" TEXT,
    "targetCountryIso2" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemandRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadinessScore" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "targetCountryIso2" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "band" TEXT NOT NULL,
    "breakdown" TEXT NOT NULL,
    "topGaps" TEXT NOT NULL DEFAULT '[]',
    "narrative" TEXT,
    "source" TEXT NOT NULL DEFAULT 'rules',
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadinessScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExporterProfile" (
    "companyId" TEXT NOT NULL,
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

    CONSTRAINT "ExporterProfile_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE "ImporterProfile" (
    "companyId" TEXT NOT NULL,
    "industries" TEXT NOT NULL DEFAULT '[]',
    "categoriesOfInterest" TEXT NOT NULL DEFAULT '[]',
    "orderVolume" TEXT,

    CONSTRAINT "ImporterProfile_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_ownerId_key" ON "Company"("ownerId");

-- CreateIndex
CREATE INDEX "Company_type_verification_idx" ON "Company"("type", "verification");

-- CreateIndex
CREATE INDEX "DemandRequest_category_status_idx" ON "DemandRequest"("category", "status");

-- CreateIndex
CREATE INDEX "DemandRequest_importerId_idx" ON "DemandRequest"("importerId");

-- CreateIndex
CREATE UNIQUE INDEX "ReadinessScore_companyId_targetCountryIso2_key" ON "ReadinessScore"("companyId", "targetCountryIso2");

-- CreateIndex
CREATE INDEX "Product_companyId_idx" ON "Product"("companyId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandRequest" ADD CONSTRAINT "DemandRequest_importerId_fkey" FOREIGN KEY ("importerId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadinessScore" ADD CONSTRAINT "ReadinessScore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExporterProfile" ADD CONSTRAINT "ExporterProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImporterProfile" ADD CONSTRAINT "ImporterProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

