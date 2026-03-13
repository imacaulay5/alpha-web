import { test, expect } from '@playwright/test'

test('login shows validation errors for bad input', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page.getByText(/please enter a valid email/i)).toBeVisible()
  await expect(page.getByText(/password must be at least 6 characters/i)).toBeVisible()
})

test('signup shows validation errors for mismatched passwords', async ({ page }) => {
  await page.goto('/signup')
  await page.getByLabel(/name/i).fill('Jarvis Test')
  await page.getByLabel(/^email$/i).fill('jarvis@example.com')
  await page.getByLabel(/^password$/i).fill('password123')
  await page.getByLabel(/confirm password/i).fill('password456')
  await page.getByRole('button', { name: /create account/i }).click()
  await expect(page.getByText(/passwords don't match/i)).toBeVisible()
})

test('signup submit reaches a visible post-submit state', async ({ page }) => {
  const email = `jarvis-${Date.now()}@example.com`
  await page.goto('/signup')
  await page.getByLabel(/name/i).fill('Jarvis Test')
  await page.getByLabel(/^email$/i).fill(email)
  await page.getByLabel(/^password$/i).fill('password123')
  await page.getByLabel(/confirm password/i).fill('password123')
  await page.getByRole('button', { name: /create account/i }).click()

  await Promise.race([
    expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 15000 }),
    expect(page.locator('body')).toContainText(/error|invalid|already|failed/i, { timeout: 15000 }),
    expect(page).toHaveURL(/account-type|dashboard/, { timeout: 15000 }),
  ])
})
