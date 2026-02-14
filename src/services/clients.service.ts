import { getSupabaseClient } from '@/lib/supabase'
import type { Client, CreateClientInput, UpdateClientInput } from '@/types/models'

export async function getClients(): Promise<Client[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')

  if (error) throw error
  return data as Client[]
}

export async function getClient(id: string): Promise<Client | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Client
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('clients')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as Client
}

export async function updateClient(id: string, input: UpdateClientInput): Promise<Client> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('clients')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Client
}

export async function deleteClient(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) throw error
}
