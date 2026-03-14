import { getSupabaseClient } from '@/lib/supabase'
import { InvoiceStatus } from '@/types/enums'
import type { Invoice, InvoiceLineItem, CreateInvoiceInput, UpdateInvoiceInput, CreateInvoiceLineItemInput } from '@/types/models'

export interface InvoiceFilters {
  status?: string
  clientId?: string
}

type InvoiceRow = Record<string, unknown>
type InvoiceLineItemRow = Record<string, unknown>

function normalizeInvoiceStatus(status: unknown): InvoiceStatus {
  const normalized = String(status ?? InvoiceStatus.draft)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')

  switch (normalized) {
    case InvoiceStatus.sent:
      return InvoiceStatus.sent
    case InvoiceStatus.paid:
      return InvoiceStatus.paid
    case InvoiceStatus.overdue:
      return InvoiceStatus.overdue
    case InvoiceStatus.cancelled:
      return InvoiceStatus.cancelled
    case InvoiceStatus.draft:
    default:
      return InvoiceStatus.draft
  }
}

function serializeInvoiceStatus(status: InvoiceStatus | string | undefined): string | undefined {
  if (!status) return undefined
  return normalizeInvoiceStatus(status).toUpperCase()
}

function mapInvoiceLineItem(row: unknown): InvoiceLineItem {
  const item = (row ?? {}) as InvoiceLineItemRow

  return {
    id: String(item.id ?? ''),
    invoice_id: String(item.invoice_id ?? ''),
    description: String(item.description ?? ''),
    quantity: Number(item.quantity ?? 0),
    rate: Number(item.rate ?? 0),
    amount: Number(item.amount ?? 0),
    order: Number(item.order ?? 0),
    created_at: String(item.created_at ?? ''),
    updated_at: String(item.updated_at ?? ''),
  }
}

function mapInvoice(row: unknown): Invoice {
  const invoice = (row ?? {}) as InvoiceRow

  return {
    id: String(invoice.id ?? ''),
    organization_id: invoice.organization_id ? String(invoice.organization_id) : undefined,
    user_id: invoice.user_id ? String(invoice.user_id) : undefined,
    client_id: invoice.client_id ? String(invoice.client_id) : undefined,
    project_id: invoice.project_id ? String(invoice.project_id) : undefined,
    invoice_number: String(invoice.invoice_number ?? ''),
    issue_date: String(invoice.issue_date ?? ''),
    due_date: String(invoice.due_date ?? ''),
    subtotal: Number(invoice.subtotal ?? 0),
    tax_rate: Number(invoice.tax_rate ?? 0),
    tax_amount: Number(invoice.tax_amount ?? 0),
    total: Number(invoice.total ?? 0),
    currency: String(invoice.currency ?? 'USD'),
    status: normalizeInvoiceStatus(invoice.status),
    notes: typeof invoice.notes === 'string' ? invoice.notes : undefined,
    paid_at: typeof invoice.paid_at === 'string' ? invoice.paid_at : undefined,
    created_at: String(invoice.created_at ?? ''),
    updated_at: String(invoice.updated_at ?? ''),
    client: invoice.client as Invoice['client'],
    project: invoice.project as Invoice['project'],
    line_items: Array.isArray(invoice.line_items) ? invoice.line_items.map(mapInvoiceLineItem) : undefined,
  }
}

function toInvoiceInsert(input: CreateInvoiceInput) {
  return {
    organization_id: input.organization_id,
    user_id: input.user_id,
    client_id: input.client_id,
    project_id: input.project_id,
    invoice_number: input.invoice_number,
    issue_date: input.issue_date,
    due_date: input.due_date,
    subtotal: input.subtotal,
    tax_rate: input.tax_rate,
    tax_amount: input.tax_amount,
    total: input.total,
    currency: input.currency,
    status: serializeInvoiceStatus(input.status) ?? 'DRAFT',
    notes: input.notes,
  }
}

function toInvoiceUpdate(input: UpdateInvoiceInput) {
  return {
    client_id: input.client_id,
    project_id: input.project_id,
    invoice_number: input.invoice_number,
    issue_date: input.issue_date,
    due_date: input.due_date,
    tax_rate: input.tax_rate,
    currency: input.currency,
    status: serializeInvoiceStatus(input.status),
    notes: input.notes,
    paid_at: input.paid_at,
  }
}

function toInvoiceLineItemInsert(item: Omit<CreateInvoiceLineItemInput, 'invoice_id'>, invoiceId: string, index: number) {
  return {
    invoice_id: invoiceId,
    description: item.description,
    quantity: item.quantity,
    rate: item.rate,
    amount: item.amount,
    order: item.order ?? index,
  }
}

export async function getInvoices(filters?: InvoiceFilters): Promise<Invoice[]> {
  const supabase = getSupabaseClient()
  let query = supabase
    .from('invoices')
    .select('*, client:clients(*), project:projects(*)')
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', serializeInvoiceStatus(filters.status) ?? filters.status)
  }
  if (filters?.clientId) {
    query = query.eq('client_id', filters.clientId)
  }

  const { data, error } = await query

  if (error) throw error
  return (data ?? []).map(mapInvoice)
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(*), project:projects(*), line_items:invoice_line_items(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data ? mapInvoice(data) : null
}

export async function createInvoice(input: CreateInvoiceInput, lineItems: Omit<CreateInvoiceLineItemInput, 'invoice_id'>[]): Promise<Invoice> {
  const supabase = getSupabaseClient()
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert(toInvoiceInsert(input))
    .select()
    .single()

  if (invoiceError) throw invoiceError

  if (lineItems.length > 0) {
    const lineItemsWithInvoiceId = lineItems.map((item, index) => toInvoiceLineItemInsert(item, invoice.id, index))

    const { error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .insert(lineItemsWithInvoiceId)

    if (lineItemsError) throw lineItemsError
  }

  return mapInvoice(invoice)
}

export async function updateInvoice(id: string, input: UpdateInvoiceInput): Promise<Invoice> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('invoices')
    .update(toInvoiceUpdate(input))
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mapInvoice(data)
}

export async function deleteInvoice(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function generateInvoiceNumber(): Promise<string> {
  const supabase = getSupabaseClient()
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })

  const num = (count || 0) + 1
  return `INV-${year}-${num.toString().padStart(4, '0')}`
}

export async function updateInvoiceLineItems(
  invoiceId: string,
  lineItems: Omit<CreateInvoiceLineItemInput, 'invoice_id'>[]
): Promise<void> {
  const supabase = getSupabaseClient()
  await supabase
    .from('invoice_line_items')
    .delete()
    .eq('invoice_id', invoiceId)

  if (lineItems.length > 0) {
    const lineItemsWithInvoiceId = lineItems.map((item, index) => toInvoiceLineItemInsert(item, invoiceId, index))

    const { error } = await supabase
      .from('invoice_line_items')
      .insert(lineItemsWithInvoiceId)

    if (error) throw error
  }
}
