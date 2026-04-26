'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { Capability, AccountType } from '@/types/enums'
import { getUserCapabilities } from '@/lib/capabilities'
import type { User, Organization } from '@/types/models'

// Tab definitions matching iOS app
export type TabId = 'home' | 'time' | 'invoices' | 'bills' | 'expenses' | 'projects' | 'clients' | 'accounting' | 'tax' | 'payroll' | 'inventory' | 'team' | 'settings'

export interface Tab {
  id: TabId
  label: string
  icon: string
  path: string
  requiredCapabilities?: Capability[]
}

const allTabs: Tab[] = [
  { id: 'home', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
  {
    id: 'time',
    label: 'Time Entries',
    icon: 'Clock',
    path: '/time-entries',
    requiredCapabilities: [Capability.trackTime, Capability.viewOwnTimeEntries],
  },
  {
    id: 'invoices',
    label: 'Invoices',
    icon: 'FileText',
    path: '/invoices',
    requiredCapabilities: [Capability.viewInvoices],
  },
  {
    id: 'bills',
    label: 'Bills',
    icon: 'CreditCard',
    path: '/bills',
    requiredCapabilities: [Capability.viewBills, Capability.viewAccountsPayable],
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: 'Receipt',
    path: '/expenses',
    requiredCapabilities: [Capability.viewOwnExpenses],
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: 'FolderKanban',
    path: '/projects',
    requiredCapabilities: [Capability.viewProjects],
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: 'Users',
    path: '/clients',
    requiredCapabilities: [Capability.viewClients],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    icon: 'BookOpen',
    path: '/accounting',
    requiredCapabilities: [Capability.manageChartOfAccounts, Capability.recordJournalEntries],
  },
  {
    id: 'tax',
    label: 'Tax',
    icon: 'Calculator',
    path: '/tax',
    requiredCapabilities: [Capability.viewTaxDashboard],
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: 'Banknote',
    path: '/payroll',
    requiredCapabilities: [Capability.viewPayroll],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: 'Package',
    path: '/inventory',
    requiredCapabilities: [Capability.viewInventory],
  },
  {
    id: 'team',
    label: 'Team',
    icon: 'UserCog',
    path: '/team',
    requiredCapabilities: [Capability.inviteTeamMembers, Capability.manageUsers],
  },
  { id: 'settings', label: 'Settings', icon: 'Settings', path: '/settings' },
]

interface AppStateContextValue {
  currentUser: User | null
  organization: Organization | null
  isAuthenticated: boolean
  isLoading: boolean
  visibleTabs: Tab[]
  hasCapability: (capability: Capability) => boolean
  hasAnyCapability: (...capabilities: Capability[]) => boolean
}

const AppStateContext = createContext<AppStateContextValue | null>(null)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { user, organization, isAuthenticated, isLoading } = useAuth()

  const userCapabilities = useMemo(() => {
    if (!user) return []
    return getUserCapabilities(user.account_type, user.role)
  }, [user])

  const hasCapability = (capability: Capability): boolean => {
    return userCapabilities.includes(capability)
  }

  const hasAnyCapability = (...capabilities: Capability[]): boolean => {
    return capabilities.some((cap) => userCapabilities.includes(cap))
  }

  const visibleTabs = useMemo(() => {
    if (!user) return []

    return allTabs.filter((tab) => {
      // Home and Settings are always visible
      if (!tab.requiredCapabilities) return true

      // Check if user has any of the required capabilities
      return tab.requiredCapabilities.some((cap) => userCapabilities.includes(cap))
    })
  }, [user, userCapabilities])

  // Additional visibility rules based on account type
  const filteredTabs = useMemo(() => {
    if (!user) return []

    return visibleTabs.filter((tab) => {
      // Team, payroll, inventory tabs only visible for business accounts
      if (['team', 'payroll', 'inventory'].includes(tab.id) && user.account_type !== AccountType.business) {
        return false
      }
      // Personal users don't create invoices -- they use Bills instead
      if (tab.id === 'invoices' && user.account_type === AccountType.personal) {
        return false
      }
      // Hide business accounting for freelancer/contractor and personal accounts.
      if (tab.id === 'accounting' && user.account_type !== AccountType.business) {
        return false
      }
      // Hide freelancer-focused tabs for business accounts
      if (['time', 'projects', 'clients'].includes(tab.id) && user.account_type === AccountType.business) {
        return false
      }
      return true
    })
  }, [user, visibleTabs])

  return (
    <AppStateContext.Provider
      value={{
        currentUser: user,
        organization,
        isAuthenticated,
        isLoading,
        visibleTabs: filteredTabs,
        hasCapability,
        hasAnyCapability,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider')
  }
  return context
}
