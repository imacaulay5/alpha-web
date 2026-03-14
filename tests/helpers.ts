import { expect, Page } from '@playwright/test'

export async function gotoAndWait(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
}

export async function expectTextSomewhere(page: Page, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const locator = page.getByText(pattern)
    if (await locator.count()) {
      await expect(locator.first()).toBeVisible()
      return
    }
  }
  throw new Error(`None of the expected text patterns were found: ${patterns.map(String).join(', ')}`)
}

export function getQaCredentials() {
  const email = process.env.PLAYWRIGHT_QA_EMAIL || process.env.QA_EMAIL || ''
  const password = process.env.PLAYWRIGHT_QA_PASSWORD || process.env.QA_PASSWORD || ''

  if (!email || !password) {
    return null
  }

  return { email, password }
}

export async function loginWithQaAccount(page: Page) {
  const credentials = getQaCredentials()
  if (!credentials) {
    throw new Error('Missing QA credentials. Set PLAYWRIGHT_QA_EMAIL and PLAYWRIGHT_QA_PASSWORD.')
  }

  await gotoAndWait(page, '/login')

  const signInButton = page.getByRole('button', { name: /sign in/i })
  await expect(signInButton).toBeVisible()
  await expect(signInButton).toBeEnabled()

  await page.getByLabel(/^email$/i).fill(credentials.email)
  await page.getByLabel(/^password$/i).fill(credentials.password)
  await signInButton.click()

  await page.waitForFunction(() => window.location.pathname !== '/login', undefined, { timeout: 15000 })
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveURL(/dashboard|invoices|account-type|onboarding/)
}

export async function openInvoicesPage(page: Page) {
  await gotoAndWait(page, '/invoices')
  await expect(page.getByRole('heading', { name: /^invoices$/i })).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('button', { name: /new invoice/i })).toBeVisible({ timeout: 15000 })
}
