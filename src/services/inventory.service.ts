import { getSupabaseClient } from '@/lib/supabase'
import type { InventoryItem, CreateInventoryItemInput, UpdateInventoryItemInput } from '@/types/models'
import { StockStatus } from '@/types/enums'

export function computeStockStatus(quantity: number, reorderPoint: number): StockStatus {
  if (quantity <= 0) return StockStatus.outOfStock
  if (quantity <= reorderPoint) return StockStatus.lowStock
  return StockStatus.inStock
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, supplier:vendors(*)')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data as InventoryItem[]
}

export async function createInventoryItem(input: CreateInventoryItemInput): Promise<InventoryItem> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('inventory_items')
    .insert({
      ...input,
      stock_status: computeStockStatus(input.quantity_on_hand, input.reorder_point),
    })
    .select('*, supplier:vendors(*)')
    .single()

  if (error) throw new Error(error.message)
  return data as InventoryItem
}

export async function updateInventoryItem(
  id: string,
  input: UpdateInventoryItemInput
): Promise<InventoryItem> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('inventory_items')
    .update(input)
    .eq('id', id)
    .select('*, supplier:vendors(*)')
    .single()

  if (error) throw new Error(error.message)
  return data as InventoryItem
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('inventory_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function updateStockLevel(
  id: string,
  quantity: number,
  reorderPoint: number
): Promise<InventoryItem> {
  return updateInventoryItem(id, {
    quantity_on_hand: quantity,
    stock_status: computeStockStatus(quantity, reorderPoint),
  })
}
