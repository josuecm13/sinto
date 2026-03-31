import { prisma } from '../shared/utils/prisma'

// TODO: integrate BullMQ when installed
// This worker currently uses setInterval for scheduling

export async function scheduleReminders() {
  try {
    // Query users with reminders enabled and registered devices
    const users = await prisma.user.findMany({
      where: {
        remindersEnabled: true,
        reminderTime: {
          not: null,
        },
        devices: {
          some: {},
        },
      },
      include: {
        devices: true,
      },
    })

    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`

    for (const user of users) {
      if (!user.reminderTime) continue

      // Check if current time matches reminder time
      if (currentTime === user.reminderTime) {
        console.log(`[reminder] Would send notification to userId: ${user.id} at ${user.reminderTime}`)
        // TODO: Implement actual push notification sending here
        // For now, just log that we would send it
      }
    }
  } catch (error) {
    console.error('[reminder] Error scheduling reminders:', error)
  }
}

export async function startReminderWorker() {
  // Run scheduleReminders once immediately
  await scheduleReminders()

  // Set up daily interval to check for reminders
  // Check every minute for efficiency (in production, this could be optimized)
  const intervalId = setInterval(async () => {
    await scheduleReminders()
  }, 60_000) // Check every minute

  // Return the interval ID for cleanup if needed
  return intervalId
}
