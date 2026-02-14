import { getSupabaseClient } from '@/lib/supabase'
import type { User } from '@/types/models'
import { Role } from '@/types/enums'

export async function getTeamMembers(organizationId: string): Promise<User[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name')

  if (error) throw error
  return data as User[]
}

export async function updateMemberRole(userId: string, role: Role): Promise<User> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as User
}

export async function removeMember(userId: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('users')
    .update({ organization_id: null, role: Role.member })
    .eq('id', userId)

  if (error) throw error
}

// Note: Inviting team members typically requires email functionality
// This is a placeholder - in production, you'd use Supabase Edge Functions or an email service
export async function inviteTeamMember(email: string, role: Role): Promise<void> {
  // This would typically:
  // 1. Create an invitation record
  // 2. Send an email with an invite link
  // 3. When user signs up, they get added to the organization
  console.log('Invite team member:', email, role)
  throw new Error('Invite functionality requires email service setup')
}
