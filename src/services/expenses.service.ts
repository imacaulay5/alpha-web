import { getSupabaseClient } from '@/lib/supabase'
import type { Expense, CreateExpenseInput, UpdateExpenseInput } from '@/types/models'

export interface ExpenseFilters {
  startDate?: string
  endDate?: string
  category?: string
  status?: string
  projectId?: string
}

export async function getExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
  const supabase = getSupabaseClient()
  let query = supabase
    .from('expenses')
    .select('*, project:projects(*)')
    .order('expense_date', { ascending: false })

  if (filters?.startDate) {
    query = query.gte('expense_date', filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte('expense_date', filters.endDate)
  }
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.projectId) {
    query = query.eq('project_id', filters.projectId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Expense[]
}

export async function getExpense(id: string): Promise<Expense | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('expenses')
    .select('*, project:projects(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Expense
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('expenses')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as Expense
}

export async function updateExpense(id: string, input: UpdateExpenseInput): Promise<Expense> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('expenses')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Expense
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Upload receipt
export async function uploadReceipt(file: File): Promise<string> {
  const supabase = getSupabaseClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `receipts/${fileName}`

  const { error } = await supabase.storage
    .from('receipts')
    .upload(filePath, file)

  if (error) throw error

  const { data } = supabase.storage
    .from('receipts')
    .getPublicUrl(filePath)

  return data.publicUrl
}
