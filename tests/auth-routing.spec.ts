import { test, expect } from '@playwright/test'
import { gotoAndWait, expectTextSomewhere } from './helpers'

test('account type page loads and can select a user type', async ({ page }) => {
  await gotoAndWait(page, '/account-type')
  await expectTextSomewhere(page, [/choose your account type/i])
  await page.getByText(/personal/i).first().click()
  await expect(page.getByRole('button', { name: /continue/i })).toBeEnabled()
})

test('onboarding page loads organization form', async ({ page }) => {
  await gotoAndWait(page, '/onboarding')
  await expectTextSomewhere(page, [/set up your organization/i, /organization name/i])
  await expect(page.getByLabel(/organization name/i)).toBeVisible()
})
