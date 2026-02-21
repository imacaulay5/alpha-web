import { getSupabaseClient } from '@/lib/supabase'
import type { Bill, CreateBillInput, UpdateBillInput } from '@/types/models'

export interface BillFilters {
  status?: string
  category?: string
}

export async function getBills(filters?: BillFilters): Promise<Bill[]> {
  const supabase = getSupabaseClient()
  let query = supabase
    .from('bills')
    .select('*')
    .order('due_date', { ascending: true })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data as Bill[]
}

export async function getBill(id: string): Promise<Bill | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as Bill
}

export async function createBill(input: CreateBillInput): Promise<Bill> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('bills')
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Bill
}

export async function updateBill(id: string, input: UpdateBillInput): Promise<Bill> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('bills')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Bill
}

export async function deleteBill(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('bills')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function markBillPaid(id: string): Promise<Bill> {
  return updateBill(id, {
    status: 'paid' as any,
    paid_at: new Date().toISOString(),
  })
}
