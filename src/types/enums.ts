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
  viewFinancialReports = 'viewFinancialReports',

  // Bills & Payments (Personal)
  viewBills = 'viewBills',
  manageBillPayments = 'manageBillPayments',
  trackRecurringBills = 'trackRecurringBills',

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
  draft = 'DRAFT',
  submitted = 'SUBMITTED',
  approved = 'APPROVED',
  rejected = 'REJECTED',
  invoiced = 'INVOICED',
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
  mobile = 'MOBILE',
  web = 'WEB',
  imported = 'IMPORT',
  api = 'API',
}

// ============================================================
// Invoice Status
// ============================================================

export enum InvoiceStatus {
  draft = 'DRAFT',
  sent = 'SENT',
  paid = 'PAID',
  overdue = 'OVERDUE',
  cancelled = 'CANCELLED',
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
  draft = 'DRAFT',
  submitted = 'SUBMITTED',
  approved = 'APPROVED',
  rejected = 'REJECTED',
  reimbursed = 'REIMBURSED',
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
  officeSupplies = 'OFFICE_SUPPLIES',
  travel = 'TRAVEL',
  meals = 'MEALS',
  software = 'SOFTWARE',
  hardware = 'HARDWARE',
  marketing = 'MARKETING',
  utilities = 'UTILITIES',
  other = 'OTHER',
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
  hourly = 'HOURLY',
  fixed = 'FIXED',
  retainer = 'RETAINER',
  milestone = 'MILESTONE',
  taskBased = 'TASK_BASED',
  notBillable = 'NOT_BILLABLE',
}

export const billingModelLabels: Record<BillingModel, string> = {
  [BillingModel.hourly]: 'Hourly',
  [BillingModel.fixed]: 'Fixed Price',
  [BillingModel.retainer]: 'Retainer',
  [BillingModel.milestone]: 'Milestone',
  [BillingModel.taskBased]: 'Task Based',
  [BillingModel.notBillable]: 'Not Billable',
}

// ============================================================
// Bill Status (for personal bills/payments)
// ============================================================

export enum BillStatus {
  upcoming = 'upcoming',
  due = 'due',
  paid = 'paid',
  overdue = 'overdue',
  cancelled = 'cancelled',
}

export const billStatusLabels: Record<BillStatus, string> = {
  [BillStatus.upcoming]: 'Upcoming',
  [BillStatus.due]: 'Due',
  [BillStatus.paid]: 'Paid',
  [BillStatus.overdue]: 'Overdue',
  [BillStatus.cancelled]: 'Cancelled',
}

// ============================================================
// Bill Category
// ============================================================

export enum BillCategory {
  rent = 'rent',
  utilities = 'utilities',
  insurance = 'insurance',
  subscription = 'subscription',
  loan = 'loan',
  creditCard = 'credit_card',
  phone = 'phone',
  internet = 'internet',
  other = 'other',
}

export const billCategoryLabels: Record<BillCategory, string> = {
  [BillCategory.rent]: 'Rent/Mortgage',
  [BillCategory.utilities]: 'Utilities',
  [BillCategory.insurance]: 'Insurance',
  [BillCategory.subscription]: 'Subscription',
  [BillCategory.loan]: 'Loan Payment',
  [BillCategory.creditCard]: 'Credit Card',
  [BillCategory.phone]: 'Phone',
  [BillCategory.internet]: 'Internet',
  [BillCategory.other]: 'Other',
}

// ============================================================
// Bill Recurrence
// ============================================================

export enum BillRecurrence {
  once = 'once',
  weekly = 'weekly',
  biweekly = 'biweekly',
  monthly = 'monthly',
  quarterly = 'quarterly',
  annually = 'annually',
}

export const billRecurrenceLabels: Record<BillRecurrence, string> = {
  [BillRecurrence.once]: 'One-time',
  [BillRecurrence.weekly]: 'Weekly',
  [BillRecurrence.biweekly]: 'Bi-weekly',
  [BillRecurrence.monthly]: 'Monthly',
  [BillRecurrence.quarterly]: 'Quarterly',
  [BillRecurrence.annually]: 'Annually',
}

// ============================================================
// Account Category (Chart of Accounts)
// ============================================================

export enum AccountCategory {
  assets = 'assets',
  liabilities = 'liabilities',
  equity = 'equity',
  revenue = 'revenue',
  expenses = 'expenses',
}

export const accountCategoryLabels: Record<AccountCategory, string> = {
  [AccountCategory.assets]: 'Assets',
  [AccountCategory.liabilities]: 'Liabilities',
  [AccountCategory.equity]: 'Equity',
  [AccountCategory.revenue]: 'Revenue',
  [AccountCategory.expenses]: 'Expenses',
}

// ============================================================
// Journal Entry Status
// ============================================================

export enum JournalEntryStatus {
  draft = 'draft',
  posted = 'posted',
  voided = 'voided',
}

export const journalEntryStatusLabels: Record<JournalEntryStatus, string> = {
  [JournalEntryStatus.draft]: 'Draft',
  [JournalEntryStatus.posted]: 'Posted',
  [JournalEntryStatus.voided]: 'Voided',
}

// ============================================================
// Vendor Status
// ============================================================

export enum VendorStatus {
  active = 'active',
  inactive = 'inactive',
}

export const vendorStatusLabels: Record<VendorStatus, string> = {
  [VendorStatus.active]: 'Active',
  [VendorStatus.inactive]: 'Inactive',
}

// ============================================================
// Purchase Order Status
// ============================================================

export enum PurchaseOrderStatus {
  draft = 'draft',
  sent = 'sent',
  received = 'received',
  cancelled = 'cancelled',
}

export const purchaseOrderStatusLabels: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.draft]: 'Draft',
  [PurchaseOrderStatus.sent]: 'Sent',
  [PurchaseOrderStatus.received]: 'Received',
  [PurchaseOrderStatus.cancelled]: 'Cancelled',
}

// ============================================================
// Payroll Status
// ============================================================

export enum PayrollStatus {
  draft = 'draft',
  processing = 'processing',
  completed = 'completed',
  failed = 'failed',
}

export const payrollStatusLabels: Record<PayrollStatus, string> = {
  [PayrollStatus.draft]: 'Draft',
  [PayrollStatus.processing]: 'Processing',
  [PayrollStatus.completed]: 'Completed',
  [PayrollStatus.failed]: 'Failed',
}

// ============================================================
// Pay Frequency
// ============================================================

export enum PayFrequency {
  weekly = 'weekly',
  biweekly = 'biweekly',
  semimonthly = 'semimonthly',
  monthly = 'monthly',
}

export const payFrequencyLabels: Record<PayFrequency, string> = {
  [PayFrequency.weekly]: 'Weekly',
  [PayFrequency.biweekly]: 'Bi-weekly',
  [PayFrequency.semimonthly]: 'Semi-monthly',
  [PayFrequency.monthly]: 'Monthly',
}

// ============================================================
// Inventory / Stock Status
// ============================================================

export enum StockStatus {
  inStock = 'in_stock',
  lowStock = 'low_stock',
  outOfStock = 'out_of_stock',
}

export const stockStatusLabels: Record<StockStatus, string> = {
  [StockStatus.inStock]: 'In Stock',
  [StockStatus.lowStock]: 'Low Stock',
  [StockStatus.outOfStock]: 'Out of Stock',
}

// ============================================================
// Tax Filing Status
// ============================================================

export enum TaxFilingStatus {
  notStarted = 'not_started',
  inProgress = 'in_progress',
  filed = 'filed',
  accepted = 'accepted',
  rejected = 'rejected',
}

export const taxFilingStatusLabels: Record<TaxFilingStatus, string> = {
  [TaxFilingStatus.notStarted]: 'Not Started',
  [TaxFilingStatus.inProgress]: 'In Progress',
  [TaxFilingStatus.filed]: 'Filed',
  [TaxFilingStatus.accepted]: 'Accepted',
  [TaxFilingStatus.rejected]: 'Rejected',
}
