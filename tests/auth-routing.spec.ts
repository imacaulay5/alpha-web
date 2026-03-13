import { test, expect } from '@playwright/test'
import { gotoAndWait, expectTextSomewhere } from './helpers'

test('unauthenticated account type route redirects to login', async ({ page }) => {
  await page.goto('/account-type')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})

test('unauthenticated onboarding route redirects to login', async ({ page }) => {
  await page.goto('/onboarding')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})

test('unauthenticated home redirects to login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})

test('unauthenticated dashboard redirects to login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})

test('unauthenticated invoices route redirects to login', async ({ page }) => {
  await page.goto('/invoices')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})

test('verify page loads otp verification controls', async ({ page }) => {
  await gotoAndWait(page, '/verify?email=jarvis@example.com')
  await expectTextSomewhere(page, [/verify your email/i])
  await expect(page.getByLabel(/email/i)).toHaveValue('jarvis@example.com')
  await expect(page.getByRole('button', { name: /verify code/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /resend verification/i })).toBeVisible()
})
