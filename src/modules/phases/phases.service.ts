import { Phase, ContentCategory } from '@prisma/client'
import { prisma } from '../../shared/utils/prisma'
import { AppError } from '../../shared/errors/AppError'

export async function listPhases(locale: string = 'es') {
  const phaseList: Phase[] = ['MENSTRUAL', 'FOLLICULAR', 'OVULATORY', 'LUTEAL']

  const result = await Promise.all(
    phaseList.map(async (phase) => {
      const contentCount = await prisma.phaseContent.count({
        where: {
          phase,
          locale,
        },
      })
      return { phase, contentCount }
    }),
  )

  return result
}

export async function getPhaseContent(phase: Phase, locale: string = 'es') {
  const validPhases: Phase[] = ['MENSTRUAL', 'FOLLICULAR', 'OVULATORY', 'LUTEAL']

  if (!validPhases.includes(phase)) {
    throw new AppError('Invalid phase', 404, 'INVALID_PHASE')
  }

  const content = await prisma.phaseContent.findMany({
    where: {
      phase,
      locale,
    },
    orderBy: {
      category: 'asc',
    },
  })

  // Group content by category
  const grouped: Record<ContentCategory, typeof content> = {
    EXERCISE: [],
    NUTRITION: [],
    TIPS: [],
    DANGERS: [],
    GENERAL: [],
  }

  for (const item of content) {
    grouped[item.category].push(item)
  }

  return {
    phase,
    content: grouped,
  }
}

export async function getCurrentPhase(
  userId: string,
  cycleId: string,
): Promise<{ phase: Phase; cycleDay: number }> {
  const cycle = await prisma.cycle.findUnique({
    where: { id: cycleId },
  })

  if (!cycle) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  if (cycle.userId !== userId) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  // Calculate cycle day from startDate to today
  const startDate = new Date(cycle.startDate)
  startDate.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffTime = today.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const cycleDay = diffDays + 1 // Day 1 is the start date

  // Map cycle day to phase
  let phase: Phase
  if (cycleDay >= 1 && cycleDay <= 5) {
    phase = 'MENSTRUAL'
  } else if (cycleDay >= 6 && cycleDay <= 13) {
    phase = 'FOLLICULAR'
  } else if (cycleDay >= 14 && cycleDay <= 16) {
    phase = 'OVULATORY'
  } else {
    phase = 'LUTEAL'
  }

  return { phase, cycleDay }
}
