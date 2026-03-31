import { prisma } from '../../shared/utils/prisma'
import { AppError } from '../../shared/errors/AppError'
import type { CreateLogInput, UpdateLogInput } from './logs.schema'

export async function createLog(userId: string, cycleId: string, input: CreateLogInput) {
  // Verify cycle belongs to user
  const cycle = await prisma.cycle.findUnique({
    where: { id: cycleId },
  })

  if (!cycle) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  if (cycle.userId !== userId) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  const logDate = new Date(input.date)

  // Create log and nested records in a transaction
  const log = await prisma.$transaction(async (tx) => {
    // Check for duplicate date
    const existing = await tx.dailyLog.findUnique({
      where: {
        cycleId_date: {
          cycleId,
          date: logDate,
        },
      },
    })

    if (existing) {
      throw new AppError('Log for this date already exists', 409, 'LOG_ALREADY_EXISTS')
    }

    // Create daily log
    const newLog = await tx.dailyLog.create({
      data: {
        cycleId,
        date: logDate,
        temperature: input.temperature,
        isMenstruating: input.isMenstruating,
      },
      include: {
        menstrualLog: true,
        symptomLog: {
          include: {
          },
        },
      },
    })

    // Create menstrual log if provided
    if (input.menstrualLog) {
      await tx.menstrualLog.create({
        data: {
          dailyLogId: newLog.id,
          flowLevel: input.menstrualLog.flowLevel,
          color: input.menstrualLog.color,
          consistency: input.menstrualLog.consistency,
        },
      })
    }

    // Create symptom log if provided
    if (input.symptomLog) {
      await tx.symptomLog.create({
        data: {
          dailyLogId: newLog.id,
          mood: input.symptomLog.mood || null,
          mucusType: input.symptomLog.mucusType || null,
          mucusQuality: input.symptomLog.mucusQuality || null,
          symptoms: input.symptomLog.symptoms || [],
        },
      })
    }

    // Fetch the complete log with all nested data
    const completeLog = await tx.dailyLog.findUnique({
      where: { id: newLog.id },
      include: {
        menstrualLog: true,
        symptomLog: {
          include: {
          },
        },
      },
    })

    return completeLog
  })

  return log
}

export async function listLogs(userId: string, cycleId: string) {
  // Verify cycle belongs to user
  const cycle = await prisma.cycle.findUnique({
    where: { id: cycleId },
  })

  if (!cycle) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  if (cycle.userId !== userId) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  const logs = await prisma.dailyLog.findMany({
    where: { cycleId },
    include: {
      menstrualLog: true,
      symptomLog: {
        include: {
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  })

  return logs
}

export async function getLog(userId: string, cycleId: string, logId: string) {
  // Verify cycle belongs to user
  const cycle = await prisma.cycle.findUnique({
    where: { id: cycleId },
  })

  if (!cycle) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  if (cycle.userId !== userId) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  const log = await prisma.dailyLog.findUnique({
    where: { id: logId },
    include: {
      menstrualLog: true,
      symptomLog: {
        include: {
        },
      },
    },
  })

  if (!log) {
    throw new AppError('Log not found', 404, 'LOG_NOT_FOUND')
  }

  if (log.cycleId !== cycleId) {
    throw new AppError('Log not found', 404, 'LOG_NOT_FOUND')
  }

  return log
}

export async function updateLog(userId: string, cycleId: string, logId: string, input: UpdateLogInput) {
  // Verify cycle belongs to user
  const cycle = await prisma.cycle.findUnique({
    where: { id: cycleId },
  })

  if (!cycle) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  if (cycle.userId !== userId) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  // Get the log to verify it exists and belongs to the cycle
  const log = await prisma.dailyLog.findUnique({
    where: { id: logId },
  })

  if (!log) {
    throw new AppError('Log not found', 404, 'LOG_NOT_FOUND')
  }

  if (log.cycleId !== cycleId) {
    throw new AppError('Log not found', 404, 'LOG_NOT_FOUND')
  }

  // Update log and nested records in a transaction
  const updated = await prisma.$transaction(async (tx) => {
    // If date is being changed, check for duplicate
    if (input.date && input.date !== log.date.toISOString().split('T')[0]) {
      const newLogDate = new Date(input.date)
      const existing = await tx.dailyLog.findUnique({
        where: {
          cycleId_date: {
            cycleId,
            date: newLogDate,
          },
        },
      })
      if (existing && existing.id !== logId) {
        throw new AppError('Log for this date already exists', 409, 'LOG_ALREADY_EXISTS')
      }
    }

    // Update daily log
    const updateData: Record<string, unknown> = {}
    if (input.date !== undefined) {
      updateData.date = new Date(input.date)
    }
    if (input.temperature !== undefined) {
      updateData.temperature = input.temperature
    }
    if (input.isMenstruating !== undefined) {
      updateData.isMenstruating = input.isMenstruating
    }

    const updatedLog = await tx.dailyLog.update({
      where: { id: logId },
      data: updateData,
    })

    // Upsert menstrual log
    if (input.menstrualLog) {
      await tx.menstrualLog.upsert({
        where: { dailyLogId: logId },
        create: {
          dailyLogId: logId,
          flowLevel: input.menstrualLog.flowLevel,
          color: input.menstrualLog.color,
          consistency: input.menstrualLog.consistency,
        },
        update: {
          flowLevel: input.menstrualLog.flowLevel,
          color: input.menstrualLog.color,
          consistency: input.menstrualLog.consistency,
        },
      })
    }

    // Upsert symptom log
    if (input.symptomLog) {
      await tx.symptomLog.upsert({
        where: { dailyLogId: logId },
        create: {
          dailyLogId: logId,
          mood: input.symptomLog.mood || null,
          mucusType: input.symptomLog.mucusType || null,
          mucusQuality: input.symptomLog.mucusQuality || null,
          symptoms: input.symptomLog.symptoms || [],
        },
        update: {
          mood: input.symptomLog.mood || null,
          mucusType: input.symptomLog.mucusType || null,
          mucusQuality: input.symptomLog.mucusQuality || null,
          symptoms: input.symptomLog.symptoms || [],
        },
      })
    }

    // Fetch the complete updated log
    const completeLog = await tx.dailyLog.findUnique({
      where: { id: logId },
      include: {
        menstrualLog: true,
        symptomLog: {
          include: {
          },
        },
      },
    })

    return completeLog
  })

  return updated
}
