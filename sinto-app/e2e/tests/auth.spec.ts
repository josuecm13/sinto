import { test, expect } from '@playwright/test'

// Example smoke e2e test — will run against E2E_BASE_URL or localhost dev server
test('auth page loads', async ({ page, baseURL }) => {
  await page.goto(baseURL!)
  // Expect signup/login button or form to exist
  const login = page.locator('text=Login')
  await expect(login.first()).toBeVisible()
})
