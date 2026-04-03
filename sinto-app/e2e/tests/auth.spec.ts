import { test, expect } from '@playwright/test'

// Example smoke e2e test — will run against E2E_BASE_URL or localhost dev server
test('auth page loads', async ({ page, baseURL }) => {
  const response = await page.goto(baseURL!)
  // Basic sanity: server responded OK and page has root element
  expect(response && response.ok()).toBeTruthy()
  const root = page.locator('#root, [data-testid="app-root"]')
  await expect(root.first()).toBeVisible()
})
