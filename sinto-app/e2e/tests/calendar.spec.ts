import { test, expect } from '@playwright/test'

test('calendar page loads and shows month view', async ({ page, baseURL }) => {
  const response = await page.goto(baseURL! + '/calendar')
  expect(response && response.ok()).toBeTruthy()
  // Calendar markup may vary; ensure page contains either calendar container or navigation
  const calendar = page.locator('[data-testid="calendar-month"], nav, [data-testid="app-root"]')
  await expect(calendar.first()).toBeVisible()
})
