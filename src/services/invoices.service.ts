import { getSupabaseClient } from '@/lib/supabase'
import type { Invoice, CreateInvoiceInput, UpdateInvoiceInput, CreateInvoiceLineItemInput } from '@/types/models'

export interface InvoiceFilters {
  status?: string
  clientId?: string
}

export async function getInvoices(filters?: InvoiceFilters): Promise<Invoice[]> {
  const supabase = getSupabaseClient()
  let query = supabase
    .from('invoices')
    .select('*, client:clients(*), project:projects(*)')
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.clientId) {
    query = query.eq('client_id', filters.clientId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Invoice[]
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(*), project:projects(*), line_items:invoice_line_items(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Invoice
}

export async function createInvoice(input: CreateInvoiceInput, lineItems: Omit<CreateInvoiceLineItemInput, 'invoice_id'>[]): Promise<Invoice> {
  const supabase = getSupabaseClient()
  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert(input)
    .select()
    .single()

  if (invoiceError) throw invoiceError

  // Create line items
  if (lineItems.length > 0) {
    const lineItemsWithInvoiceId = lineItems.map((item, index) => ({
      ...item,
      invoice_id: invoice.id,
      order: index,
    }))

    const { error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .insert(lineItemsWithInvoiceId)

    if (lineItemsError) throw lineItemsError
  }

  return invoice as Invoice
}

export async function updateInvoice(id: string, input: UpdateInvoiceInput): Promise<Invoice> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('invoices')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Invoice
}

export async function deleteInvoice(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  // Line items should be deleted via cascade
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Generate invoice number
export async function generateInvoiceNumber(): Promise<string> {
  const supabase = getSupabaseClient()
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })

  const num = (count || 0) + 1
  return `INV-${year}-${num.toString().padStart(4, '0')}`
}

// Update line items
export async function updateInvoiceLineItems(
  invoiceId: string,
  lineItems: Omit<CreateInvoiceLineItemInput, 'invoice_id'>[]
): Promise<void> {
  const supabase = getSupabaseClient()
  // Delete existing line items
  await supabase
    .from('invoice_line_items')
    .delete()
    .eq('invoice_id', invoiceId)

  // Insert new line items
  if (lineItems.length > 0) {
    const lineItemsWithInvoiceId = lineItems.map((item, index) => ({
      ...item,
      invoice_id: invoiceId,
      order: index,
    }))

    const { error } = await supabase
      .from('invoice_line_items')
      .insert(lineItemsWithInvoiceId)

    if (error) throw error
  }
}
