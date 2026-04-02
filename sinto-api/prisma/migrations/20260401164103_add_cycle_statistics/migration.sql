-- CreateTable
CREATE TABLE "CycleStatistics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "avgDurationDays" DOUBLE PRECISION NOT NULL,
    "minDurationDays" INTEGER NOT NULL,
    "maxDurationDays" INTEGER NOT NULL,
    "stdDev" DOUBLE PRECISION NOT NULL,
    "cycleCount" INTEGER NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CycleStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CycleStatistics_userId_key"
ON "CycleStatistics"("userId");

-- AddForeignKey
ALTER TABLE "CycleStatistics"
ADD CONSTRAINT "CycleStatistics_userId_fkey" FOREIGN KEY ("userId") 
REFERENCES "User"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;
