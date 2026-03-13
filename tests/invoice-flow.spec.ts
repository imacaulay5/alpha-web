import { test, expect } from '@playwright/test'
import { getQaCredentials, loginWithQaAccount } from './helpers'

const qaCredentials = getQaCredentials()

test('invoices route is protected for signed-out visitors', async ({ page }) => {
  await page.goto('/invoices')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})

test.describe('invoice flows with QA account', () => {
  test.skip(!qaCredentials, 'Requires PLAYWRIGHT_QA_EMAIL and PLAYWRIGHT_QA_PASSWORD')

  test('signed-in QA user can reach the invoices page shell', async ({ page }) => {
    await loginWithQaAccount(page)

    await expect(page).not.toHaveURL(/\/login/)
    await page.goto('/invoices')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveURL(/\/invoices/)
    await expect(page.getByRole('heading', { name: /invoices/i })).toBeVisible()
    await expect(page.getByText(/create and manage your invoices|no invoices yet|all invoices/i)).toBeVisible()
  })

  test('signed-in QA user can open the new invoice dialog', async ({ page }) => {
    await loginWithQaAccount(page)
    await page.goto('/invoices')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /new invoice/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: /new invoice/i })).toBeVisible()
    await expect(page.getByLabel(/invoice number/i)).toBeVisible()
    await expect(page.getByLabel(/issue date/i)).toBeVisible()
    await expect(page.getByLabel(/due date/i)).toBeVisible()
    await expect(page.getByText(/line items/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /create invoice/i })).toBeVisible()
  })
})
