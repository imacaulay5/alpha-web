import { getSupabaseClient } from '@/lib/supabase'
import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
  JournalEntry,
  CreateJournalEntryInput,
  UpdateJournalEntryInput,
  CreateJournalEntryLineInput,
} from '@/types/models'
import { AccountCategory, JournalEntryStatus } from '@/types/enums'

// ─── Chart of Accounts ───────────────────────────────────────

export async function getAccounts(): Promise<Account[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('code', { ascending: true })

  if (error) throw new Error(error.message)
  return data as Account[]
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('accounts')
    .insert({ ...input, balance: 0 })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Account
}

export async function updateAccount(id: string, input: UpdateAccountInput): Promise<Account> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('accounts')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Account
}

export async function deleteAccount(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// Seed US GAAP default chart of accounts for a new user
export async function seedDefaultAccounts(userId: string): Promise<void> {
  const supabase = getSupabaseClient()

  const defaults = [
    // Assets
    { code: '1010', name: 'Cash & Cash Equivalents', category: AccountCategory.assets },
    { code: '1020', name: 'Checking Account', category: AccountCategory.assets },
    { code: '1030', name: 'Savings Account', category: AccountCategory.assets },
    { code: '1100', name: 'Accounts Receivable', category: AccountCategory.assets },
    { code: '1200', name: 'Inventory', category: AccountCategory.assets },
    { code: '1300', name: 'Prepaid Expenses', category: AccountCategory.assets },
    { code: '1500', name: 'Property & Equipment', category: AccountCategory.assets },
    { code: '1510', name: 'Accumulated Depreciation', category: AccountCategory.assets },
    // Liabilities
    { code: '2010', name: 'Accounts Payable', category: AccountCategory.liabilities },
    { code: '2100', name: 'Accrued Liabilities', category: AccountCategory.liabilities },
    { code: '2200', name: 'Short-term Loans Payable', category: AccountCategory.liabilities },
    { code: '2300', name: 'Deferred Revenue', category: AccountCategory.liabilities },
    { code: '2500', name: 'Long-term Debt', category: AccountCategory.liabilities },
    // Equity
    { code: '3010', name: "Owner's Equity", category: AccountCategory.equity },
    { code: '3100', name: 'Retained Earnings', category: AccountCategory.equity },
    { code: '3900', name: "Owner's Draw", category: AccountCategory.equity },
    // Revenue
    { code: '4010', name: 'Service Revenue', category: AccountCategory.revenue },
    { code: '4020', name: 'Product Sales', category: AccountCategory.revenue },
    { code: '4030', name: 'Other Income', category: AccountCategory.revenue },
    // Expenses
    { code: '5010', name: 'Cost of Goods Sold', category: AccountCategory.expenses },
    { code: '5100', name: 'Salaries & Wages', category: AccountCategory.expenses },
    { code: '5200', name: 'Rent & Occupancy', category: AccountCategory.expenses },
    { code: '5300', name: 'Utilities', category: AccountCategory.expenses },
    { code: '5400', name: 'Insurance', category: AccountCategory.expenses },
    { code: '5500', name: 'Marketing & Advertising', category: AccountCategory.expenses },
    { code: '5600', name: 'Office Supplies', category: AccountCategory.expenses },
    { code: '5700', name: 'Software & Subscriptions', category: AccountCategory.expenses },
    { code: '5800', name: 'Travel & Entertainment', category: AccountCategory.expenses },
    { code: '5900', name: 'Depreciation Expense', category: AccountCategory.expenses },
    { code: '5950', name: 'Miscellaneous Expense', category: AccountCategory.expenses },
  ]

  const rows = defaults.map((a) => ({ ...a, user_id: userId, is_active: true, balance: 0 }))
  const { error } = await supabase.from('accounts').insert(rows)
  if (error) throw new Error(error.message)
}

// ─── Journal Entries ─────────────────────────────────────────

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*, lines:journal_entry_lines(*, account:accounts(*))')
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)
  return data as JournalEntry[]
}

export async function createJournalEntry(
  input: CreateJournalEntryInput,
  lines: Omit<CreateJournalEntryLineInput, 'journal_entry_id'>[]
): Promise<JournalEntry> {
  const supabase = getSupabaseClient()

  const { data: entry, error: entryError } = await supabase
    .from('journal_entries')
    .insert(input)
    .select()
    .single()

  if (entryError) throw new Error(entryError.message)

  if (lines.length > 0) {
    const linesWithId = lines.map((l, i) => ({ ...l, journal_entry_id: entry.id, order: i }))
    const { error: linesError } = await supabase.from('journal_entry_lines').insert(linesWithId)
    if (linesError) throw new Error(linesError.message)
  }

  return entry as JournalEntry
}

export async function updateJournalEntry(id: string, input: UpdateJournalEntryInput): Promise<JournalEntry> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('journal_entries')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as JournalEntry
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function postJournalEntry(id: string, lines: { account_id: string; debit: number; credit: number }[]): Promise<void> {
  const supabase = getSupabaseClient()

  // Mark entry as posted
  const { error: postError } = await supabase
    .from('journal_entries')
    .update({ status: JournalEntryStatus.posted })
    .eq('id', id)

  if (postError) throw new Error(postError.message)

  // Update account balances for each line
  for (const line of lines) {
    const { data: account, error: fetchError } = await supabase
      .from('accounts')
      .select('balance, category')
      .eq('id', line.account_id)
      .single()

    if (fetchError) continue

    // Debit increases assets/expenses, decreases liabilities/equity/revenue
    // Credit increases liabilities/equity/revenue, decreases assets/expenses
    const isDebitNormal = [AccountCategory.assets, AccountCategory.expenses].includes(account.category)
    const netChange = isDebitNormal
      ? line.debit - line.credit
      : line.credit - line.debit

    await supabase
      .from('accounts')
      .update({ balance: (account.balance || 0) + netChange })
      .eq('id', line.account_id)
  }
}

export async function generateEntryNumber(): Promise<string> {
  const supabase = getSupabaseClient()
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('journal_entries')
    .select('*', { count: 'exact', head: true })

  const num = (count || 0) + 1
  return `JE-${year}-${num.toString().padStart(4, '0')}`
}
