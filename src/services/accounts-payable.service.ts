import { getSupabaseClient } from '@/lib/supabase'
import type {
  Vendor,
  CreateVendorInput,
  UpdateVendorInput,
  VendorBill,
  CreateVendorBillInput,
  UpdateVendorBillInput,
  PurchaseOrder,
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
} from '@/types/models'
import { BillStatus, PurchaseOrderStatus } from '@/types/enums'

// ─── Vendors ─────────────────────────────────────────────────

export async function getVendors(): Promise<Vendor[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data as Vendor[]
}

export async function createVendor(input: CreateVendorInput): Promise<Vendor> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('vendors')
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Vendor
}

export async function updateVendor(id: string, input: UpdateVendorInput): Promise<Vendor> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('vendors')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Vendor
}

export async function deleteVendor(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('vendors').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Vendor Bills ─────────────────────────────────────────────

export async function getVendorBills(): Promise<VendorBill[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('vendor_bills')
    .select('*, vendor:vendors(*), line_items:vendor_bill_line_items(*)')
    .order('due_date', { ascending: true })

  if (error) throw new Error(error.message)
  return data as VendorBill[]
}

export async function createVendorBill(
  input: CreateVendorBillInput,
  lineItems: { description: string; quantity: number; rate: number; amount: number; order: number }[]
): Promise<VendorBill> {
  const supabase = getSupabaseClient()

  const { data: bill, error: billError } = await supabase
    .from('vendor_bills')
    .insert(input)
    .select()
    .single()

  if (billError) throw new Error(billError.message)

  if (lineItems.length > 0) {
    const rows = lineItems.map((l) => ({ ...l, vendor_bill_id: bill.id }))
    const { error: lineError } = await supabase.from('vendor_bill_line_items').insert(rows)
    if (lineError) throw new Error(lineError.message)
  }

  return bill as VendorBill
}

export async function updateVendorBill(id: string, input: UpdateVendorBillInput): Promise<VendorBill> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('vendor_bills')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as VendorBill
}

export async function deleteVendorBill(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('vendor_bills').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function markVendorBillPaid(id: string): Promise<VendorBill> {
  return updateVendorBill(id, {
    status: BillStatus.paid,
    paid_at: new Date().toISOString(),
  })
}

export async function generateBillNumber(): Promise<string> {
  const supabase = getSupabaseClient()
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('vendor_bills')
    .select('*', { count: 'exact', head: true })
  const num = (count || 0) + 1
  return `BILL-${year}-${num.toString().padStart(4, '0')}`
}

// ─── Purchase Orders ──────────────────────────────────────────

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*, vendor:vendors(*), line_items:purchase_order_line_items(*)')
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)
  return data as PurchaseOrder[]
}

export async function createPurchaseOrder(
  input: CreatePurchaseOrderInput,
  lineItems: { description: string; quantity: number; rate: number; amount: number; order: number }[]
): Promise<PurchaseOrder> {
  const supabase = getSupabaseClient()

  const { data: po, error: poError } = await supabase
    .from('purchase_orders')
    .insert(input)
    .select()
    .single()

  if (poError) throw new Error(poError.message)

  if (lineItems.length > 0) {
    const rows = lineItems.map((l) => ({ ...l, purchase_order_id: po.id }))
    const { error: lineError } = await supabase.from('purchase_order_line_items').insert(rows)
    if (lineError) throw new Error(lineError.message)
  }

  return po as PurchaseOrder
}

export async function updatePurchaseOrder(id: string, input: UpdatePurchaseOrderInput): Promise<PurchaseOrder> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('purchase_orders')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as PurchaseOrder
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('purchase_orders').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function generatePONumber(): Promise<string> {
  const supabase = getSupabaseClient()
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('purchase_orders')
    .select('*', { count: 'exact', head: true })
  const num = (count || 0) + 1
  return `PO-${year}-${num.toString().padStart(4, '0')}`
}
