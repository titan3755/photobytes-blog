-- CreateEnum
CREATE TYPE "public"."ServiceName" AS ENUM ('STUDIOS', 'BLOG');

-- CreateEnum
CREATE TYPE "public"."OperationalStatus" AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'DOWN');

-- CreateTable
CREATE TABLE "public"."ServiceStatus" (
    "id" TEXT NOT NULL,
    "serviceName" "public"."ServiceName" NOT NULL,
    "status" "public"."OperationalStatus" NOT NULL DEFAULT 'OPERATIONAL',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceStatus_serviceName_key" ON "public"."ServiceStatus"("serviceName");
