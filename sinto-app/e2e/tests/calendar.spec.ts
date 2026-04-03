import { test, expect } from '@playwright/test'

test('calendar page loads and shows month view', async ({ page, baseURL }) => {
  await page.goto(baseURL! + '/calendar')
  const calendar = page.locator('[data-testid="calendar-month"]')
  await expect(calendar).toBeVisible()
})
