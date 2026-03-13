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
  const email = process.env.PLAYWRIGHT_QA_EMAIL
  const password = process.env.PLAYWRIGHT_QA_PASSWORD

  if (!email || !password) {
    return null
  }

  return { email, password }
}

export async function loginWithQaAccount(page: Page) {
  const credentials = getQaCredentials()
  if (!credentials) {
    throw new Error('Missing PLAYWRIGHT_QA_EMAIL or PLAYWRIGHT_QA_PASSWORD')
  }

  await gotoAndWait(page, '/login')
  await page.getByLabel(/^email$/i).fill(credentials.email)
  await page.getByLabel(/^password$/i).fill(credentials.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForLoadState('networkidle')
}
