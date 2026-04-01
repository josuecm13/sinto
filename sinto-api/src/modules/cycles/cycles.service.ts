/**
 * MODULE: Cycles service
 * CRUD for menstrual cycles scoped to userId. Enforces one open cycle at a time.
 *
 * Exports: createCycle, listCycles, getCycle, updateCycle, deleteCycle
 * Depends on: prisma, AppError
 */

import { prisma } from '../../shared/utils/prisma'
import { AppError } from '../../shared/errors/AppError'
import type { CreateCycleInput, UpdateCycleInput } from './cycles.schema'

export async function createCycle(userId: string, input: CreateCycleInput) {
  // Check if user already has an open cycle (no endDate)
  const openCycle = await prisma.cycle.findFirst({
    where: {
      userId,
      endDate: null,
    },
  })

  if (openCycle) {
    throw new AppError('User already has an open cycle', 409, 'OPEN_CYCLE_EXISTS')
  }

  const startDate = new Date(input.startDate)

  const cycle = await prisma.cycle.create({
    data: {
      userId,
      startDate,
    },
    include: {
      logs: {
        select: {
          id: true,
        },
      },
    },
  })

  return {
    ...cycle,
    logsCount: cycle.logs.length,
    logs: undefined,
  }
}

export async function listCycles(userId: string) {
  const cycles = await prisma.cycle.findMany({
    where: { userId },
    include: {
      logs: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      startDate: 'desc',
    },
  })

  return cycles.map((cycle) => ({
    ...cycle,
    logsCount: cycle.logs.length,
    logs: undefined,
  }))
}

export async function getCycle(userId: string, cycleId: string) {
  const cycle = await prisma.cycle.findUnique({
    where: { id: cycleId },
    include: {
      logs: {
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
      },
    },
  })

  if (!cycle) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  if (cycle.userId !== userId) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  return cycle
}

export async function updateCycle(userId: string, cycleId: string, input: UpdateCycleInput) {
  const cycle = await prisma.cycle.findUnique({
    where: { id: cycleId },
  })

  if (!cycle) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  if (cycle.userId !== userId) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  const updateData: Record<string, unknown> = {}
  if (input.endDate !== undefined) {
    updateData.endDate = new Date(input.endDate)
  }
  if (input.cycleLength !== undefined) {
    updateData.cycleLength = input.cycleLength
  }
  if (input.lutealPhaseLength !== undefined) {
    updateData.lutealPhaseLength = input.lutealPhaseLength
  }

  const updated = await prisma.cycle.update({
    where: { id: cycleId },
    data: updateData,
  })

  return updated
}

export async function deleteCycle(userId: string, cycleId: string) {
  const cycle = await prisma.cycle.findUnique({
    where: { id: cycleId },
  })

  if (!cycle) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  if (cycle.userId !== userId) {
    throw new AppError('Cycle not found', 404, 'CYCLE_NOT_FOUND')
  }

  await prisma.cycle.delete({
    where: { id: cycleId },
  })
}
