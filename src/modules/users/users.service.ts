import { prisma } from '../../shared/utils/prisma'
import { AppError } from '../../shared/errors/AppError'
import type { UpdateProfileInput } from './users.schema'

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      avatarUrl: true,
      isPublic: true,
      remindersEnabled: true,
      reminderTime: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  return user
}

export async function updateMe(userId: string, input: UpdateProfileInput) {
  // Check if username is being updated and if it's taken by another user
  if (input.username) {
    const existingUser = await prisma.user.findUnique({
      where: { username: input.username },
    })
    if (existingUser && existingUser.id !== userId) {
      throw new AppError('Username already taken', 409, 'USERNAME_TAKEN')
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.username !== undefined && { username: input.username }),
      ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
      ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      avatarUrl: true,
      isPublic: true,
      remindersEnabled: true,
      reminderTime: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return updatedUser
}

interface PublicProfileStats {
  totalCycles: number
  avgCycleLength: number | null
  lastCycleStart: Date | null
}

interface PublicProfileResponse {
  name: string
  username: string
  avatarUrl: string | null
  stats: PublicProfileStats
}

export async function getPublicProfile(username: string): Promise<PublicProfileResponse> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      username: true,
      avatarUrl: true,
      isPublic: true,
    },
  })

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  if (!user.isPublic) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  // Get cycles stats
  const cycles = await prisma.cycle.findMany({
    where: { user: { username } },
    select: {
      startDate: true,
      cycleLength: true,
    },
    orderBy: { startDate: 'desc' },
  })

  const totalCycles = cycles.length
  const cycleLengths = cycles.map(c => c.cycleLength).filter((cl): cl is number => cl !== null)
  const avgCycleLength =
    cycleLengths.length > 0 ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length * 10) / 10 : null
  const lastCycleStart = cycles.length > 0 ? cycles[0].startDate : null

  return {
    name: user.name,
    username: user.username as string,
    avatarUrl: user.avatarUrl,
    stats: {
      totalCycles,
      avgCycleLength,
      lastCycleStart,
    },
  }
}
