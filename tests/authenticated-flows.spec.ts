import { test, expect } from '@playwright/test'
import { qaConfig } from './config'
import { gotoAndWait } from './helpers'

test.describe('authenticated flows', () => {
  test.skip(!qaConfig.hasQaUser, 'QA_EMAIL and QA_PASSWORD are required for authenticated flow tests')

  test('qa user can sign in', async ({ page }) => {
    await gotoAndWait(page, '/login')
    await page.getByLabel(/^email$/i).fill(qaConfig.qaEmail)
    await page.getByLabel(/^password$/i).fill(qaConfig.qaPassword)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/dashboard|account-type|onboarding/)
  })

  test('qa user can reach invoices page after sign in', async ({ page }) => {
    await gotoAndWait(page, '/login')
    await page.getByLabel(/^email$/i).fill(qaConfig.qaEmail)
    await page.getByLabel(/^password$/i).fill(qaConfig.qaPassword)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForLoadState('networkidle')
    await page.goto('/invoices')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toContainText(/invoices/i)
  })
})
