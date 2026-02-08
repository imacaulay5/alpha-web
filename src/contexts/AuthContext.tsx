'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase'
import type { User, Organization } from '@/types/models'
import { AccountType, Role } from '@/types/enums'

interface AuthState {
  session: Session | null
  supabaseUser: SupabaseUser | null
  user: User | null
  organization: Organization | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsVerification: boolean }>
  logout: () => Promise<void>
  setAccountType: (accountType: AccountType) => Promise<{ error: string | null }>
  createOrganization: (name: string) => Promise<{ error: string | null }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    supabaseUser: null,
    user: null,
    organization: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  })

  const supabase = getSupabaseClient()

  // Fetch user profile from users table
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return {
      ...data,
      role: data.role as Role,
      account_type: data.account_type as AccountType,
    } as User
  }

  // Fetch organization if user has one
  const fetchOrganization = async (organizationId: string): Promise<Organization | null> => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (error || !data) {
      console.error('Error fetching organization:', error)
      return null
    }

    return data as Organization
  }

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const user = await fetchUserProfile(session.user.id)
        let organization: Organization | null = null
        if (user?.organization_id) {
          organization = await fetchOrganization(user.organization_id)
        }
        setState({
          session,
          supabaseUser: session.user,
          user,
          organization,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        })
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = await fetchUserProfile(session.user.id)
          let organization: Organization | null = null
          if (user?.organization_id) {
            organization = await fetchOrganization(user.organization_id)
          }
          setState({
            session,
            supabaseUser: session.user,
            user,
            organization,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          })
        } else if (event === 'SIGNED_OUT') {
          setState({
            session: null,
            supabaseUser: null,
            user: null,
            organization: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          })
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setState(prev => ({ ...prev, session }))
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error: error.message }))
      return { error: error.message }
    }

    return { error: null }
  }

  const signUp = async (email: string, password: string, name: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error: error.message }))
      return { error: error.message, needsVerification: false }
    }

    // If email confirmation is required
    if (data.user && !data.session) {
      setState(prev => ({ ...prev, isLoading: false }))
      return { error: null, needsVerification: true }
    }

    return { error: null, needsVerification: false }
  }

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    await supabase.auth.signOut()
    setState({
      session: null,
      supabaseUser: null,
      user: null,
      organization: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    })
  }

  const setAccountType = async (accountType: AccountType) => {
    if (!state.supabaseUser) {
      return { error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('users')
      .update({ account_type: accountType })
      .eq('id', state.supabaseUser.id)

    if (error) {
      return { error: error.message }
    }

    // Refresh user data
    const user = await fetchUserProfile(state.supabaseUser.id)
    setState(prev => ({ ...prev, user }))

    return { error: null }
  }

  const createOrganization = async (name: string) => {
    if (!state.supabaseUser) {
      return { error: 'Not authenticated' }
    }

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name })
      .select()
      .single()

    if (orgError || !org) {
      return { error: orgError?.message || 'Failed to create organization' }
    }

    // Update user with organization_id and set role to owner
    const { error: userError } = await supabase
      .from('users')
      .update({
        organization_id: org.id,
        role: Role.owner,
      })
      .eq('id', state.supabaseUser.id)

    if (userError) {
      return { error: userError.message }
    }

    // Refresh data
    const user = await fetchUserProfile(state.supabaseUser.id)
    setState(prev => ({
      ...prev,
      user,
      organization: org as Organization,
    }))

    return { error: null }
  }

  const refreshUser = async () => {
    if (!state.supabaseUser) return

    const user = await fetchUserProfile(state.supabaseUser.id)
    let organization: Organization | null = null
    if (user?.organization_id) {
      organization = await fetchOrganization(user.organization_id)
    }
    setState(prev => ({ ...prev, user, organization }))
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signUp,
        logout,
        setAccountType,
        createOrganization,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
