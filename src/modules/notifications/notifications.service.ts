import { prisma } from '../../shared/utils/prisma'
import { AppError } from '../../shared/errors/AppError'
import type { UpdateNotificationPrefsInput, RegisterDeviceInput } from './notifications.schema'

export async function updatePreferences(userId: string, input: UpdateNotificationPrefsInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      remindersEnabled: input.remindersEnabled,
      reminderTime: input.reminderTime || null,
    },
  })

  return {
    remindersEnabled: user.remindersEnabled,
    reminderTime: user.reminderTime,
  }
}

export async function registerDevice(userId: string, input: RegisterDeviceInput) {
  // Check if token already exists for another user
  const existingDevice = await prisma.device.findUnique({
    where: { token: input.token },
  })

  if (existingDevice && existingDevice.userId !== userId) {
    throw new AppError('Device token already registered', 409, 'DEVICE_TAKEN')
  }

  // Upsert device: if token exists for same user, update platform; otherwise create
  const device = await prisma.device.upsert({
    where: { token: input.token },
    create: {
      userId,
      token: input.token,
      platform: input.platform,
    },
    update: {
      platform: input.platform,
    },
  })

  return {
    id: device.id,
    token: device.token,
    platform: device.platform,
    createdAt: device.createdAt,
  }
}

export async function removeDevice(userId: string, token: string) {
  const device = await prisma.device.findUnique({
    where: { token },
  })

  if (!device) {
    throw new AppError('Device not found', 404, 'DEVICE_NOT_FOUND')
  }

  if (device.userId !== userId) {
    throw new AppError('Device not found', 404, 'DEVICE_NOT_FOUND')
  }

  await prisma.device.delete({
    where: { token },
  })

  return { success: true }
}

export async function listDevices(userId: string) {
  const devices = await prisma.device.findMany({
    where: { userId },
    select: {
      id: true,
      token: true,
      platform: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return devices
}
