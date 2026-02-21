import { Capability, AccountType, Role } from '@/types/enums'

// Personal account capabilities - bills/payments focused (no invoice creation)
const personalCapabilities: Capability[] = [
  // Bills & Payments
  Capability.viewBills,
  Capability.manageBillPayments,
  Capability.trackRecurringBills,
  Capability.recordPayments,
  Capability.quickBill,
  // Expenses (simplified - just tracked/paid, no approval workflow)
  Capability.submitExpenses,
  Capability.viewOwnExpenses,
  Capability.categorizeExpenses,
  Capability.attachReceipts,
  // Reports
  Capability.viewBasicReports,
  Capability.exportData,
  // Tax
  Capability.viewTaxDashboard,
  Capability.exportTaxDocuments,
  // Settings
  Capability.configureNotifications,
  Capability.customizeAppearance,
  Capability.exportAllData,
  Capability.deleteAccount,
]

// Freelancer account capabilities (47 capabilities)
const freelancerCapabilities: Capability[] = [
  // Time tracking
  Capability.trackTime,
  Capability.viewOwnTimeEntries,
  Capability.editOwnTimeEntries,
  Capability.deleteTimeEntries,
  // Invoicing
  Capability.createInvoices,
  Capability.sendInvoices,
  Capability.viewInvoices,
  Capability.editInvoices,
  Capability.deleteInvoices,
  Capability.customizeInvoiceTemplate,
  Capability.schedulePaymentReminders,
  Capability.recordPayments,
  Capability.processRefunds,
  Capability.quickBill,
  Capability.viewAccountsReceivable,
  // Client management
  Capability.manageClients,
  Capability.viewClients,
  Capability.importContacts,
  Capability.exportContacts,
  // Project management
  Capability.createProjects,
  Capability.manageProjects,
  Capability.viewProjects,
  Capability.viewTasks,
  Capability.configureBillingRules,
  Capability.trackProjectBudgets,
  Capability.viewProjectReports,
  // Expenses
  Capability.submitExpenses,
  Capability.viewOwnExpenses,
  Capability.categorizeExpenses,
  Capability.attachReceipts,
  Capability.trackMileage,
  // Reports
  Capability.viewAdvancedReports,
  Capability.viewFinancialStatements,
  Capability.exportData,
  Capability.customizeReports,
  // Tax
  Capability.viewTaxDashboard,
  Capability.generateTaxEstimates,
  Capability.exportTaxDocuments,
  // Integrations
  Capability.connectBankAccounts,
  Capability.connectPaymentProcessors,
  // Settings
  Capability.configureNotifications,
  Capability.customizeAppearance,
  Capability.exportAllData,
  Capability.deleteAccount,
]

// Business account gets all capabilities (70)
const allCapabilities: Capability[] = Object.values(Capability)

// Role-based capability restrictions for business accounts
const memberCapabilities: Capability[] = [
  Capability.trackTime,
  Capability.viewOwnTimeEntries,
  Capability.editOwnTimeEntries,
  Capability.submitExpenses,
  Capability.viewOwnExpenses,
  Capability.categorizeExpenses,
  Capability.attachReceipts,
  Capability.trackMileage,
  Capability.viewProjects,
  Capability.viewTasks,
  Capability.viewClients,
  Capability.viewBasicReports,
  Capability.configureNotifications,
  Capability.customizeAppearance,
]

const contractorCapabilities: Capability[] = [
  Capability.trackTime,
  Capability.viewOwnTimeEntries,
  Capability.editOwnTimeEntries,
  Capability.createInvoices,
  Capability.sendInvoices,
  Capability.viewInvoices,
  Capability.viewProjects,
  Capability.viewTasks,
  Capability.submitExpenses,
  Capability.viewOwnExpenses,
  Capability.attachReceipts,
  Capability.configureNotifications,
  Capability.customizeAppearance,
]

// Admin gets all except deleteAccount and manageOrganization
const adminCapabilities: Capability[] = allCapabilities.filter(
  (cap) => cap !== Capability.deleteAccount && cap !== Capability.manageOrganization
)

/**
 * Get capabilities based on account type
 */
export function getAccountTypeCapabilities(accountType: AccountType): Capability[] {
  switch (accountType) {
    case AccountType.personal:
      return personalCapabilities
    case AccountType.freelancer:
      return freelancerCapabilities
    case AccountType.business:
      return allCapabilities
    default:
      return []
  }
}

/**
 * Get capabilities based on role (for business accounts only)
 */
export function getRoleCapabilities(role: Role): Capability[] {
  switch (role) {
    case Role.owner:
      return allCapabilities
    case Role.admin:
      return adminCapabilities
    case Role.member:
      return memberCapabilities
    case Role.contractor:
      return contractorCapabilities
    default:
      return []
  }
}

/**
 * Get user capabilities based on account type and role
 * For personal/freelancer accounts, role is ignored
 * For business accounts, capabilities are the intersection of account type and role
 */
export function getUserCapabilities(accountType: AccountType, role: Role): Capability[] {
  if (accountType === AccountType.business) {
    return getRoleCapabilities(role)
  }
  return getAccountTypeCapabilities(accountType)
}

/**
 * Check if user has a specific capability
 */
export function hasCapability(
  accountType: AccountType,
  role: Role,
  capability: Capability
): boolean {
  const capabilities = getUserCapabilities(accountType, role)
  return capabilities.includes(capability)
}

/**
 * Check if user has any of the specified capabilities
 */
export function hasAnyCapability(
  accountType: AccountType,
  role: Role,
  capabilities: Capability[]
): boolean {
  const userCapabilities = getUserCapabilities(accountType, role)
  return capabilities.some((cap) => userCapabilities.includes(cap))
}

/**
 * Check if user has all of the specified capabilities
 */
export function hasAllCapabilities(
  accountType: AccountType,
  role: Role,
  capabilities: Capability[]
): boolean {
  const userCapabilities = getUserCapabilities(accountType, role)
  return capabilities.every((cap) => userCapabilities.includes(cap))
}
