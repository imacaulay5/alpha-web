import { test, expect } from '@playwright/test'
import {
  getAvailableQaAccounts,
  getQaCredentials,
  loginWithQaAccount,
  openInvoicesPage,
  expectInvoicesPageShell,
  type QaAccountType,
} from './helpers'

const businessCredentials = getQaCredentials('business')
const availableQaAccounts = getAvailableQaAccounts()
const invoiceCapableAccountTypes: QaAccountType[] = ['business', 'freelancer']

test('invoices route is protected for signed-out visitors', async ({ page }) => {
  await page.goto('/invoices')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})

test.describe('invoice flows by QA account type', () => {
  test.skip(availableQaAccounts.length === 0, 'Requires at least one seeded QA account via PLAYWRIGHT_QA_* env vars')

  for (const account of availableQaAccounts) {
    test.describe(`${account.type} account`, () => {
      test(`can sign in as ${account.type}`, async ({ page }) => {
        await loginWithQaAccount(page, account.type)
        await expect(page).not.toHaveURL(/\/login/)
      })

      if (invoiceCapableAccountTypes.includes(account.type)) {
        test(`can reach the invoices page shell as ${account.type}`, async ({ page }) => {
          await loginWithQaAccount(page, account.type)
          await openInvoicesPage(page)
          await expect(page.getByRole('button', { name: /new invoice/i })).toBeVisible()
        })

        test(`can open the new invoice dialog as ${account.type}`, async ({ page }) => {
          await loginWithQaAccount(page, account.type)
          await openInvoicesPage(page)

          await page.getByRole('button', { name: /new invoice/i }).click()

          const dialog = page.getByRole('dialog')
          await expect(dialog).toBeVisible()
          await expect(dialog.getByRole('heading', { name: /new invoice/i })).toBeVisible()
          await expect(dialog.getByLabel(/invoice number/i)).toBeVisible()
          await expect(dialog.getByLabel(/issue date/i)).toBeVisible()
          await expect(dialog.getByLabel(/due date/i)).toBeVisible()
          await expect(dialog.getByText(/line items/i)).toBeVisible()
          await expect(dialog.getByRole('button', { name: /create invoice/i })).toBeVisible()
        })
      } else {
        test(`keeps invoice creation out of the main navigation for ${account.type}`, async ({ page }) => {
          await loginWithQaAccount(page, account.type)
          await expect(page.getByRole('link', { name: /invoices/i })).toHaveCount(0)
        })

        test(`can still open the invoices route directly as ${account.type}`, async ({ page }) => {
          await loginWithQaAccount(page, account.type)
          await openInvoicesPage(page)
          await expectInvoicesPageShell(page)
        })
      }
    })
  }
})

test.describe('invoice flows with seeded business QA account', () => {
  test.skip(!businessCredentials, 'Requires PLAYWRIGHT_QA_BUSINESS_EMAIL/PLAYWRIGHT_QA_BUSINESS_PASSWORD or PLAYWRIGHT_QA_EMAIL/PLAYWRIGHT_QA_PASSWORD')

  test('signed-in business QA user can create an invoice when seeded data has a client', async ({ page }) => {
    await loginWithQaAccount(page, 'business')
    await openInvoicesPage(page)

    const invoiceRows = page.locator('tbody tr')
    const beforeCount = await invoiceRows.count()

    await page.getByRole('button', { name: /new invoice/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await dialog.getByRole('combobox').click()
    const clientOptions = page.locator('[role="option"]')
    const clientCount = await clientOptions.count()
    test.skip(clientCount === 0, 'Seeded business QA account has no selectable clients for invoice creation')
    await clientOptions.first().click()

    const uniqueText = `QA invoice ${Date.now()}`
    await dialog.getByPlaceholder('Description').fill(uniqueText)
    await dialog.getByPlaceholder('Qty').fill('2')
    await dialog.getByPlaceholder('Rate').fill('75')
    await dialog.getByLabel(/notes/i).fill(`${uniqueText} notes`)

    await dialog.getByRole('button', { name: /create invoice/i }).click()

    await expect(dialog).not.toBeVisible({ timeout: 15000 })
    await expect(page.locator('body')).toContainText(/invoice created/i)
    await expect(invoiceRows).toHaveCount(beforeCount + 1)
  })

  test('signed-in business QA user can open edit invoice dialog for an existing invoice', async ({ page }) => {
    await loginWithQaAccount(page, 'business')
    await openInvoicesPage(page)

    const editButtons = page.locator('button[title="Edit Invoice"]')
    const invoiceCount = await editButtons.count()
    test.skip(invoiceCount === 0, 'Seeded business QA account has no existing invoices to edit')

    await editButtons.first().click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: /edit invoice/i })).toBeVisible()
    await expect(dialog.getByLabel(/invoice number/i)).toBeVisible()
    await expect(dialog.getByRole('button', { name: /save changes/i })).toBeVisible()
  })
})
