-- AlterTable
ALTER TABLE "Municipality" ADD COLUMN "description" TEXT;

-- CreateTable
CREATE TABLE "MunicipalityEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "municipalityId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MunicipalityEmail_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MunicipalityEmail_municipalityId_idx" ON "MunicipalityEmail"("municipalityId");

-- CreateIndex
CREATE INDEX "MunicipalityEmail_email_idx" ON "MunicipalityEmail"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MunicipalityEmail_municipalityId_email_key" ON "MunicipalityEmail"("municipalityId", "email");
