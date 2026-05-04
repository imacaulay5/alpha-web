import { runAiTask } from '@/lib/ai/client'
import type { Bill, Expense, Invoice, TimeEntry, VendorBill } from '@/types/models'
import type { AccountType } from '@/types/enums'

export type AiNextStep = {
  id: string
  title: string
  detail: string
  href: string
  priority: 'high' | 'medium' | 'low'
}

export type MonthlySummary = {
  headline: string
  body: string
  highlights: string[]
}

export type FinancialSearchResult = {
  id: string
  title: string
  detail: string
  href: string
  label: string
  priority: AiNextStep['priority']
}

export type DashboardAiInsights = {
  nextSteps: AiNextStep[]
  monthlySummary: MonthlySummary
  searchResults: FinancialSearchResult[]
}

export async function getDashboardAiInsights(input: {
  accountType: AccountType
  searchQuery: string
  bills: Bill[]
  expenses: Expense[]
  workData: {
    invoices: Invoice[]
    expenses: Expense[]
    timeEntries: TimeEntry[]
    vendorBills: VendorBill[]
  }
  candidateHrefs: string[]
}): Promise<DashboardAiInsights> {
  return runAiTask<DashboardAiInsights>('dashboard_insights', input)
}
