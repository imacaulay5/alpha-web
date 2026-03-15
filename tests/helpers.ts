import { expect, Page } from '@playwright/test'

export type QaAccountType = 'business' | 'freelancer' | 'personal'

interface QaCredentials {
  email: string
  password: string
}

export interface QaAccount extends QaCredentials {
  type: QaAccountType
}

const QA_ACCOUNT_ENV_KEYS: Record<QaAccountType, { email: string[]; password: string[] }> = {
  business: {
    email: ['PLAYWRIGHT_QA_BUSINESS_EMAIL', 'QA_BUSINESS_EMAIL', 'PLAYWRIGHT_QA_EMAIL', 'QA_EMAIL'],
    password: ['PLAYWRIGHT_QA_BUSINESS_PASSWORD', 'QA_BUSINESS_PASSWORD', 'PLAYWRIGHT_QA_PASSWORD', 'QA_PASSWORD'],
  },
  freelancer: {
    email: ['PLAYWRIGHT_QA_FREELANCER_EMAIL', 'QA_FREELANCER_EMAIL'],
    password: ['PLAYWRIGHT_QA_FREELANCER_PASSWORD', 'QA_FREELANCER_PASSWORD'],
  },
  personal: {
    email: ['PLAYWRIGHT_QA_PERSONAL_EMAIL', 'QA_PERSONAL_EMAIL'],
    password: ['PLAYWRIGHT_QA_PERSONAL_PASSWORD', 'QA_PERSONAL_PASSWORD'],
  },
}

function readFirstEnvValue(keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim()
    if (value) {
      return value
    }
  }

  return ''
}

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

export function getQaCredentials(accountType: QaAccountType = 'business'): QaCredentials | null {
  const envKeys = QA_ACCOUNT_ENV_KEYS[accountType]
  const email = readFirstEnvValue(envKeys.email)
  const password = readFirstEnvValue(envKeys.password)

  if (!email || !password) {
    return null
  }

  return { email, password }
}

export function getAvailableQaAccounts(): QaAccount[] {
  return (Object.keys(QA_ACCOUNT_ENV_KEYS) as QaAccountType[])
    .map((type) => {
      const credentials = getQaCredentials(type)
      return credentials ? { type, ...credentials } : null
    })
    .filter((account): account is QaAccount => Boolean(account))
}

export async function loginWithQaAccount(page: Page, accountType: QaAccountType = 'business') {
  const credentials = getQaCredentials(accountType)
  if (!credentials) {
    throw new Error(`Missing QA credentials for ${accountType}.`)
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

export async function expectInvoicesPageShell(page: Page) {
  await expect(page).toHaveURL(/\/invoices/)
  await expect(page.getByRole('heading', { name: /^invoices$/i })).toBeVisible({ timeout: 15000 })
  await expect(page.getByText(/create and manage your invoices|no invoices yet/i)).toBeVisible({ timeout: 15000 })
}

export async function openInvoicesPage(page: Page) {
  await gotoAndWait(page, '/invoices')
  await expectInvoicesPageShell(page)
}
