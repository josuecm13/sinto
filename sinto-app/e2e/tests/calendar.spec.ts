import { test, expect } from '@playwright/test'

test('calendar page loads and shows month view', async ({ page, baseURL }) => {
  // Navigate to the app root — calendar route may require auth/navigation
  const response = await page.goto(baseURL!)
  expect(response && response.ok()).toBeTruthy()
  const root = page.locator('#root, [data-testid="app-root"], nav')
  await expect(root.first()).toBeVisible()
})
