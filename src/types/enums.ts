// ============================================================
// Capability - All 70+ capabilities from iOS Capability.swift
// ============================================================

export enum Capability {
  // Time & Attendance
  trackTime = 'trackTime',
  viewOwnTimeEntries = 'viewOwnTimeEntries',
  viewTeamTimeEntries = 'viewTeamTimeEntries',
  approveTimeEntries = 'approveTimeEntries',
  editOwnTimeEntries = 'editOwnTimeEntries',
  editTeamTimeEntries = 'editTeamTimeEntries',
  deleteTimeEntries = 'deleteTimeEntries',

  // Invoicing & Billing
  createInvoices = 'createInvoices',
  sendInvoices = 'sendInvoices',
  viewInvoices = 'viewInvoices',
  editInvoices = 'editInvoices',
  deleteInvoices = 'deleteInvoices',
  customizeInvoiceTemplate = 'customizeInvoiceTemplate',
  schedulePaymentReminders = 'schedulePaymentReminders',
  recordPayments = 'recordPayments',
  processRefunds = 'processRefunds',
  quickBill = 'quickBill',
  viewAccountsReceivable = 'viewAccountsReceivable',

  // Client & Contact Management
  manageClients = 'manageClients',
  viewClients = 'viewClients',
  importContacts = 'importContacts',
  exportContacts = 'exportContacts',

  // Project & Task Management
  createProjects = 'createProjects',
  manageProjects = 'manageProjects',
  viewProjects = 'viewProjects',
  assignTasks = 'assignTasks',
  viewTasks = 'viewTasks',
  configureBillingRules = 'configureBillingRules',
  trackProjectBudgets = 'trackProjectBudgets',
  viewProjectReports = 'viewProjectReports',

  // Team & Organization
  inviteTeamMembers = 'inviteTeamMembers',
  manageUsers = 'manageUsers',
  assignRoles = 'assignRoles',
  viewTeamActivity = 'viewTeamActivity',
  viewAuditLog = 'viewAuditLog',
  manageOrganization = 'manageOrganization',

  // Expenses & Reimbursement
  submitExpenses = 'submitExpenses',
  viewOwnExpenses = 'viewOwnExpenses',
  viewTeamExpenses = 'viewTeamExpenses',
  approveExpenses = 'approveExpenses',
  categorizeExpenses = 'categorizeExpenses',
  attachReceipts = 'attachReceipts',
  trackMileage = 'trackMileage',
  reimburseExpenses = 'reimburseExpenses',

  // Accounting & Finance
  viewAccountsPayable = 'viewAccountsPayable',
  manageBills = 'manageBills',
  manageVendors = 'manageVendors',
  createPurchaseOrders = 'createPurchaseOrders',
  reconcileBankAccounts = 'reconcileBankAccounts',
  manageChartOfAccounts = 'manageChartOfAccounts',
  recordJournalEntries = 'recordJournalEntries',

  // Inventory
  viewInventory = 'viewInventory',
  manageInventory = 'manageInventory',
  trackStockLevels = 'trackStockLevels',
  performStockCounts = 'performStockCounts',

  // Payroll
  viewPayroll = 'viewPayroll',
  processPayroll = 'processPayroll',
  manageEmployeeProfiles = 'manageEmployeeProfiles',
  viewPayrollReports = 'viewPayrollReports',

  // Reports & Analytics
  viewBasicReports = 'viewBasicReports',
  viewAdvancedReports = 'viewAdvancedReports',
  viewFinancialStatements = 'viewFinancialStatements',
  customizeReports = 'customizeReports',
  exportData = 'exportData',
  scheduledReports = 'scheduledReports',

  // Tax & Compliance
  viewTaxDashboard = 'viewTaxDashboard',
  generateTaxEstimates = 'generateTaxEstimates',
  exportTaxDocuments = 'exportTaxDocuments',
  trackSalesTax = 'trackSalesTax',
  managePayrollTax = 'managePayrollTax',

  // Integrations
  connectBankAccounts = 'connectBankAccounts',
  connectAccountingSoftware = 'connectAccountingSoftware',
  connectPaymentProcessors = 'connectPaymentProcessors',
  manageIntegrations = 'manageIntegrations',

  // Settings & Preferences
  configureNotifications = 'configureNotifications',
  customizeAppearance = 'customizeAppearance',
  exportAllData = 'exportAllData',
  deleteAccount = 'deleteAccount',
}

// ============================================================
// Account Type
// ============================================================

export enum AccountType {
  personal = 'personal',
  freelancer = 'freelancer',
  business = 'business',
}

export const accountTypeLabels: Record<AccountType, string> = {
  [AccountType.personal]: 'Personal',
  [AccountType.freelancer]: 'Freelancer/Contractor',
  [AccountType.business]: 'Small Business Owner',
}

export const accountTypeIcons: Record<AccountType, string> = {
  [AccountType.personal]: 'person.fill',
  [AccountType.freelancer]: 'briefcase.fill',
  [AccountType.business]: 'building.2.fill',
}

// ============================================================
// Role (for business accounts)
// ============================================================

export enum Role {
  owner = 'OWNER',
  admin = 'ADMIN',
  member = 'MEMBER',
  contractor = 'CONTRACTOR',
}

export const roleLabels: Record<Role, string> = {
  [Role.owner]: 'Owner',
  [Role.admin]: 'Admin',
  [Role.member]: 'Member',
  [Role.contractor]: 'Contractor',
}

// ============================================================
// Time Entry Status
// ============================================================

export enum TimeEntryStatus {
  draft = 'draft',
  submitted = 'submitted',
  approved = 'approved',
  rejected = 'rejected',
  invoiced = 'invoiced',
}

export const timeEntryStatusLabels: Record<TimeEntryStatus, string> = {
  [TimeEntryStatus.draft]: 'Draft',
  [TimeEntryStatus.submitted]: 'Submitted',
  [TimeEntryStatus.approved]: 'Approved',
  [TimeEntryStatus.rejected]: 'Rejected',
  [TimeEntryStatus.invoiced]: 'Invoiced',
}

// ============================================================
// Time Entry Source
// ============================================================

export enum TimeEntrySource {
  mobile = 'mobile',
  web = 'web',
  imported = 'imported',
  api = 'api',
}

// ============================================================
// Invoice Status
// ============================================================

export enum InvoiceStatus {
  draft = 'draft',
  sent = 'sent',
  paid = 'paid',
  overdue = 'overdue',
  cancelled = 'cancelled',
}

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  [InvoiceStatus.draft]: 'Draft',
  [InvoiceStatus.sent]: 'Sent',
  [InvoiceStatus.paid]: 'Paid',
  [InvoiceStatus.overdue]: 'Overdue',
  [InvoiceStatus.cancelled]: 'Cancelled',
}

// ============================================================
// Expense Status
// ============================================================

export enum ExpenseStatus {
  draft = 'draft',
  submitted = 'submitted',
  approved = 'approved',
  rejected = 'rejected',
  reimbursed = 'reimbursed',
}

export const expenseStatusLabels: Record<ExpenseStatus, string> = {
  [ExpenseStatus.draft]: 'Draft',
  [ExpenseStatus.submitted]: 'Submitted',
  [ExpenseStatus.approved]: 'Approved',
  [ExpenseStatus.rejected]: 'Rejected',
  [ExpenseStatus.reimbursed]: 'Reimbursed',
}

// ============================================================
// Expense Category
// ============================================================

export enum ExpenseCategory {
  officeSupplies = 'office_supplies',
  travel = 'travel',
  meals = 'meals',
  software = 'software',
  hardware = 'hardware',
  marketing = 'marketing',
  utilities = 'utilities',
  other = 'other',
}

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  [ExpenseCategory.officeSupplies]: 'Office Supplies',
  [ExpenseCategory.travel]: 'Travel',
  [ExpenseCategory.meals]: 'Meals',
  [ExpenseCategory.software]: 'Software',
  [ExpenseCategory.hardware]: 'Hardware',
  [ExpenseCategory.marketing]: 'Marketing',
  [ExpenseCategory.utilities]: 'Utilities',
  [ExpenseCategory.other]: 'Other',
}

// ============================================================
// Billing Model
// ============================================================

export enum BillingModel {
  hourly = 'hourly',
  fixed = 'fixed',
  retainer = 'retainer',
  milestone = 'milestone',
  taskBased = 'task_based',
  notBillable = 'not_billable',
}

export const billingModelLabels: Record<BillingModel, string> = {
  [BillingModel.hourly]: 'Hourly',
  [BillingModel.fixed]: 'Fixed Price',
  [BillingModel.retainer]: 'Retainer',
  [BillingModel.milestone]: 'Milestone',
  [BillingModel.taskBased]: 'Task Based',
  [BillingModel.notBillable]: 'Not Billable',
}
