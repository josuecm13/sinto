import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcryptjs from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const TEST_EMAIL = 'bbt-demo@sinto.test'
const TEST_PASSWORD = 'Demo1234!'
const CYCLE_START = new Date(2026, 2, 1) // March 1, 2026

interface DailyBBTEntry {
  day: number
  temperature: number
  isMenstruating: boolean
  mucusType?: string
  mucusQuality?: string
}

const bbtPattern: DailyBBTEntry[] = [
  // Days 1–5 (Menstrual phase)
  { day: 1, temperature: 36.3, isMenstruating: true },
  { day: 2, temperature: 36.3, isMenstruating: true },
  { day: 3, temperature: 36.3, isMenstruating: true },
  { day: 4, temperature: 36.3, isMenstruating: true },
  { day: 5, temperature: 36.3, isMenstruating: true },

  // Days 6–11 (Follicular, rising)
  { day: 6, temperature: 36.4, isMenstruating: false },
  { day: 7, temperature: 36.4, isMenstruating: false },
  { day: 8, temperature: 36.4, isMenstruating: false },
  { day: 9, temperature: 36.4, isMenstruating: false },
  { day: 10, temperature: 36.4, isMenstruating: false },
  { day: 11, temperature: 36.5, isMenstruating: false },

  // Days 12–13 (Late follicular, stable pre-ovulation)
  { day: 12, temperature: 36.4, isMenstruating: false },
  { day: 13, temperature: 36.4, isMenstruating: false },

  // Day 14 (Pre-ovulatory dip)
  {
    day: 14,
    temperature: 36.2,
    isMenstruating: false,
    mucusType: 'EGG_WHITE',
    mucusQuality: 'PEAK',
  },

  // Days 15–17 (Ovulatory thermal shift)
  { day: 15, temperature: 36.7, isMenstruating: false },
  { day: 16, temperature: 36.8, isMenstruating: false },
  { day: 17, temperature: 36.9, isMenstruating: false },

  // Days 18–28 (Luteal, sustained high)
  { day: 18, temperature: 36.9, isMenstruating: false },
  { day: 19, temperature: 37.0, isMenstruating: false },
  { day: 20, temperature: 36.9, isMenstruating: false },
  { day: 21, temperature: 37.0, isMenstruating: false },
  { day: 22, temperature: 36.9, isMenstruating: false },
  { day: 23, temperature: 37.0, isMenstruating: false },
  { day: 24, temperature: 36.9, isMenstruating: false },
  { day: 25, temperature: 37.0, isMenstruating: false },
  { day: 26, temperature: 36.9, isMenstruating: false },
  { day: 27, temperature: 37.0, isMenstruating: false },
  { day: 28, temperature: 36.9, isMenstruating: false },
]

async function main() {
  try {
    console.log('Starting BBT seed process...')

    // 1. Find or create user
    let user = await prisma.user.findUnique({
      where: { email: TEST_EMAIL },
    })

    if (!user) {
      const hashedPassword = await bcryptjs.hash(TEST_PASSWORD, 10)
      user = await prisma.user.create({
        data: {
          email: TEST_EMAIL,
          name: 'BBT Demo User',
          passwordHash: hashedPassword,
        },
      })
      console.log(`✓ Created user: ${TEST_EMAIL}`)
    } else {
      console.log(`✓ Found existing user: ${TEST_EMAIL}`)
    }

    // 2. Delete existing cycles for this user
    const deletedCycles = await prisma.cycle.deleteMany({
      where: { userId: user.id },
    })
    console.log(`✓ Deleted ${deletedCycles.count} existing cycles`)

    // 3. Create new cycle
    const cycle = await prisma.cycle.create({
      data: {
        userId: user.id,
        startDate: CYCLE_START,
      },
    })
    console.log(`✓ Created cycle starting ${CYCLE_START.toISOString().split('T')[0]}`)

    // 4. Create 28 daily logs with BBT pattern
    for (const entry of bbtPattern) {
      const logDate = new Date(2026, 2, entry.day)

      const logData: any = {
        cycleId: cycle.id,
        date: logDate,
        temperature: entry.temperature,
        isMenstruating: entry.isMenstruating,
      }

      // Add menstrual log for days 1–5
      if (entry.isMenstruating) {
        logData.menstrualLog = {
          create: {
            flowLevel: 'MEDIUM',
            color: 'BRIGHT_RED',
            consistency: 'NORMAL',
          },
        }
      }

      // Add symptom log with mucus data for day 14 (peak fertility)
      if (entry.mucusType && entry.mucusQuality) {
        logData.symptomLog = {
          create: {
            mucusType: entry.mucusType,
            mucusQuality: entry.mucusQuality,
            mood: 'HAPPY',
          },
        }
      }

      await prisma.dailyLog.create({
        data: logData,
        include: {
          menstrualLog: true,
          symptomLog: true,
        },
      })
    }

    console.log(`✓ 28 logs seeded for bbt-demo@sinto.test`)
    console.log('')
    console.log('Summary:')
    console.log(`  User email: ${TEST_EMAIL}`)
    console.log(`  Password: ${TEST_PASSWORD}`)
    console.log(`  Cycle start: 2026-03-01`)
    console.log(`  Cycle length: 28 days`)
    console.log(`  Logs created: 28`)
  } catch (error) {
    console.error('Error seeding BBT data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
