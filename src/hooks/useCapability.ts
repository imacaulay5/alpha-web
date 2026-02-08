import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Capability, AccountType, Role } from '@/types/enums'
import {
  getUserCapabilities,
  hasCapability as checkCapability,
  hasAnyCapability as checkAnyCapability,
  hasAllCapabilities as checkAllCapabilities,
} from '@/lib/capabilities'

/**
 * Hook to check if the current user has a specific capability
 */
export function useCapability(capability: Capability): boolean {
  const { user } = useAuth()

  return useMemo(() => {
    if (!user) return false
    return checkCapability(
      user.account_type || AccountType.personal,
      user.role || Role.member,
      capability
    )
  }, [user, capability])
}

/**
 * Hook to check if the current user has any of the specified capabilities
 */
export function useAnyCapability(...capabilities: Capability[]): boolean {
  const { user } = useAuth()

  return useMemo(() => {
    if (!user) return false
    return checkAnyCapability(
      user.account_type || AccountType.personal,
      user.role || Role.member,
      capabilities
    )
  }, [user, capabilities])
}

/**
 * Hook to check if the current user has all of the specified capabilities
 */
export function useAllCapabilities(...capabilities: Capability[]): boolean {
  const { user } = useAuth()

  return useMemo(() => {
    if (!user) return false
    return checkAllCapabilities(
      user.account_type || AccountType.personal,
      user.role || Role.member,
      capabilities
    )
  }, [user, capabilities])
}

/**
 * Hook to get all capabilities for the current user
 */
export function useCapabilities(): Capability[] {
  const { user } = useAuth()

  return useMemo(() => {
    if (!user) return []
    return getUserCapabilities(
      user.account_type || AccountType.personal,
      user.role || Role.member
    )
  }, [user])
}
