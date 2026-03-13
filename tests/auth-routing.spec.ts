import { test, expect } from '@playwright/test'

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
