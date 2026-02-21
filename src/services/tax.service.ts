import { getSupabaseClient } from '@/lib/supabase'
import type { TaxFiling, CreateTaxFilingInput, UpdateTaxFilingInput } from '@/types/models'

export async function getTaxFilings(): Promise<TaxFiling[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('tax_filings')
    .select('*')
    .order('due_date', { ascending: true })

  if (error) throw new Error(error.message)
  return data as TaxFiling[]
}

export async function createTaxFiling(input: CreateTaxFilingInput): Promise<TaxFiling> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('tax_filings')
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as TaxFiling
}

export async function updateTaxFiling(id: string, input: UpdateTaxFilingInput): Promise<TaxFiling> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('tax_filings')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as TaxFiling
}

export async function deleteTaxFiling(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('tax_filings')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function markTaxFilingFiled(id: string): Promise<TaxFiling> {
  return updateTaxFiling(id, {
    status: 'filed' as any,
    filed_date: new Date().toISOString().split('T')[0],
  })
}

// Seed standard quarterly estimated tax deadlines for the current year
export async function seedQuarterlyEstimates(userId: string, year: number): Promise<void> {
  const supabase = getSupabaseClient()

  const quarters = [
    {
      name: `Q1 ${year} Estimated Tax`,
      form_type: '1040-ES',
      tax_period_start: `${year}-01-01`,
      tax_period_end: `${year}-03-31`,
      due_date: `${year}-04-15`,
    },
    {
      name: `Q2 ${year} Estimated Tax`,
      form_type: '1040-ES',
      tax_period_start: `${year}-04-01`,
      tax_period_end: `${year}-05-31`,
      due_date: `${year}-06-16`,
    },
    {
      name: `Q3 ${year} Estimated Tax`,
      form_type: '1040-ES',
      tax_period_start: `${year}-06-01`,
      tax_period_end: `${year}-08-31`,
      due_date: `${year}-09-15`,
    },
    {
      name: `Q4 ${year} Estimated Tax`,
      form_type: '1040-ES',
      tax_period_start: `${year}-09-01`,
      tax_period_end: `${year}-12-31`,
      due_date: `${year + 1}-01-15`,
    },
  ]

  const rows = quarters.map((q) => ({
    ...q,
    user_id: userId,
    status: 'not_started',
  }))

  const { error } = await supabase.from('tax_filings').insert(rows)
  if (error) throw new Error(error.message)
}
