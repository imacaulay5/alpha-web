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
