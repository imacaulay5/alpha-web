import { test, expect } from '@playwright/test'

test('home page loads', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveURL(/\//)
})

test('login page loads', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveURL(/login/)
  await expect(page.locator('body')).toContainText(/login|sign in/i)
})

test('signup page loads', async ({ page }) => {
  await page.goto('/signup')
  await expect(page).toHaveURL(/signup/)
  await expect(page.locator('body')).toContainText(/sign up|create account/i)
})
