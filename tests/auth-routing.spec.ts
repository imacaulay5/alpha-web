import { test, expect, type Page } from '@playwright/test'
import { gotoAndWait, expectTextSomewhere } from './helpers'

async function loginAsQaUser(page: Page) {
  const email = process.env.PLAYWRIGHT_QA_EMAIL
  const password = process.env.PLAYWRIGHT_QA_PASSWORD

  if (!email || !password) {
    throw new Error('PLAYWRIGHT_QA_EMAIL and PLAYWRIGHT_QA_PASSWORD must be set')
  }

  await gotoAndWait(page, '/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/dashboard(?:\?|$)/)
  await page.waitForLoadState('networkidle')
}

test('account type route redirects anonymous users to login', async ({ page }) => {
  await gotoAndWait(page, '/account-type')
  await expect(page).toHaveURL(/\/login(?:\?|$)/)
  await expectTextSomewhere(page, [/welcome back/i, /sign in/i])
})

test('onboarding route redirects completed QA users to dashboard', async ({ page }) => {
  await loginAsQaUser(page)
  await gotoAndWait(page, '/onboarding')
  await expect(page).toHaveURL(/\/dashboard(?:\?|$)/)
  await expectTextSomewhere(page, [/dashboard/i, /welcome back/i])
})
