-- CreateEnum
CREATE TYPE "Phase" AS ENUM ('MENSTRUAL', 'FOLLICULAR', 'OVULATORY', 'LUTEAL');

-- CreateEnum
CREATE TYPE "FlowLevel" AS ENUM ('SPOTTING', 'LIGHT', 'MEDIUM', 'HEAVY');

-- CreateEnum
CREATE TYPE "FlowColor" AS ENUM ('BRIGHT_RED', 'DARK_RED', 'PINK', 'BROWN', 'BLACK');

-- CreateEnum
CREATE TYPE "FlowConsistency" AS ENUM ('WATERY', 'NORMAL', 'CLOTTY');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('HAPPY', 'CALM', 'ANXIOUS', 'IRRITABLE', 'SAD', 'ENERGETIC', 'TIRED');

-- CreateEnum
CREATE TYPE "MucusType" AS ENUM ('DRY', 'STICKY', 'CREAMY', 'EGG_WHITE', 'WATERY');

-- CreateEnum
CREATE TYPE "MucusQuality" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'PEAK');

-- CreateEnum
CREATE TYPE "Symptom" AS ENUM ('NAUSEA', 'BREAST_PAIN', 'HEADACHE', 'CRAMPS', 'BLOATING', 'BACKACHE', 'FATIGUE', 'ACNE', 'INSOMNIA');

-- CreateEnum
CREATE TYPE "ContentCategory" AS ENUM ('EXERCISE', 'NUTRITION', 'TIPS', 'DANGERS', 'GENERAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "avatarUrl" TEXT,
    "passwordHash" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "remindersEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reminderTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cycle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "cycleLength" INTEGER,
    "lutealPhaseLength" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "temperature" DOUBLE PRECISION,
    "phase" "Phase",
    "isMenstruating" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenstrualLog" (
    "id" TEXT NOT NULL,
    "dailyLogId" TEXT NOT NULL,
    "flowLevel" "FlowLevel" NOT NULL,
    "color" "FlowColor" NOT NULL,
    "consistency" "FlowConsistency" NOT NULL,

    CONSTRAINT "MenstrualLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SymptomLog" (
    "id" TEXT NOT NULL,
    "dailyLogId" TEXT NOT NULL,
    "mood" "Mood",
    "mucusType" "MucusType",
    "mucusQuality" "MucusQuality",
    "symptoms" "Symptom"[],

    CONSTRAINT "SymptomLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhaseContent" (
    "id" TEXT NOT NULL,
    "phase" "Phase" NOT NULL,
    "category" "ContentCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'es',

    CONSTRAINT "PhaseContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "DailyLog_cycleId_idx" ON "DailyLog"("cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_cycleId_date_key" ON "DailyLog"("cycleId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MenstrualLog_dailyLogId_key" ON "MenstrualLog"("dailyLogId");

-- CreateIndex
CREATE UNIQUE INDEX "SymptomLog_dailyLogId_key" ON "SymptomLog"("dailyLogId");

-- CreateIndex
CREATE INDEX "PhaseContent_phase_locale_idx" ON "PhaseContent"("phase", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "PhaseContent_phase_category_title_locale_key" ON "PhaseContent"("phase", "category", "title", "locale");

-- CreateIndex
CREATE INDEX "Notification_userId_scheduledAt_idx" ON "Notification"("userId", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "Device_token_key" ON "Device"("token");

-- CreateIndex
CREATE INDEX "Device_userId_idx" ON "Device"("userId");

-- AddForeignKey
ALTER TABLE "Cycle" ADD CONSTRAINT "Cycle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "Cycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenstrualLog" ADD CONSTRAINT "MenstrualLog_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomLog" ADD CONSTRAINT "SymptomLog_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
