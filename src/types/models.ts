import {
  AccountType,
  Role,
  TimeEntryStatus,
  TimeEntrySource,
  InvoiceStatus,
  ExpenseStatus,
  ExpenseCategory,
  BillingModel,
} from './enums'

// ============================================================
// User
// ============================================================

export interface User {
  id: string
  email: string
  name: string
  role: Role
  account_type: AccountType
  hourly_rate?: number
  is_active: boolean
  avatar_url?: string
  phone?: string
  timezone?: string
  preferences?: Record<string, unknown>
  organization_id?: string
  created_at: string
  updated_at: string
}

// ============================================================
// Organization
// ============================================================

export interface Organization {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  tax_id?: string
  settings?: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ============================================================
// Client
// ============================================================

export interface Client {
  id: string
  organization_id?: string
  user_id?: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  contact_name?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================================
// Project
// ============================================================

export interface Project {
  id: string
  organization_id?: string
  user_id?: string
  client_id?: string
  name: string
  description?: string
  billing_model: BillingModel
  rate?: number
  budget?: number
  start_date?: string
  end_date?: string
  is_active: boolean
  color?: string
  created_at: string
  updated_at: string
  // Relations
  client?: Client
  tasks?: Task[]
}

// ============================================================
// Task (ProjectTask)
// ============================================================

export interface Task {
  id: string
  project_id: string
  name: string
  description?: string
  rate?: number
  estimated_hours?: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Relations
  project?: Project
}

// ============================================================
// Time Entry
// ============================================================

export interface TimeEntry {
  id: string
  user_id: string
  project_id?: string
  task_id?: string
  start_at: string
  end_at?: string
  duration_minutes?: number
  notes?: string
  status: TimeEntryStatus
  source: TimeEntrySource
  billable_rate?: number
  invoice_id?: string
  created_at: string
  updated_at: string
  // Relations
  project?: Project
  task?: Task
  user?: User
}

// ============================================================
// Invoice
// ============================================================

export interface Invoice {
  id: string
  organization_id?: string
  user_id?: string
  client_id?: string
  project_id?: string
  invoice_number: string
  issue_date: string
  due_date: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  currency: string
  status: InvoiceStatus
  notes?: string
  paid_at?: string
  created_at: string
  updated_at: string
  // Relations
  client?: Client
  project?: Project
  line_items?: InvoiceLineItem[]
}

export interface InvoiceLineItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  rate: number
  amount: number
  order: number
  created_at: string
  updated_at: string
}

// ============================================================
// Expense
// ============================================================

export interface Expense {
  id: string
  user_id: string
  project_id?: string
  task_id?: string
  amount: number
  currency: string
  category: ExpenseCategory
  description?: string
  merchant?: string
  expense_date: string
  receipt_url?: string
  status: ExpenseStatus
  notes?: string
  invoice_id?: string
  created_at: string
  updated_at: string
  // Relations
  project?: Project
  task?: Task
  user?: User
}

// ============================================================
// Form Types (for creating/updating)
// ============================================================

export type CreateUserInput = Omit<User, 'id' | 'created_at' | 'updated_at'>
export type UpdateUserInput = Partial<CreateUserInput>

export type CreateOrganizationInput = Omit<Organization, 'id' | 'created_at' | 'updated_at'>
export type UpdateOrganizationInput = Partial<CreateOrganizationInput>

export type CreateClientInput = Omit<Client, 'id' | 'created_at' | 'updated_at'>
export type UpdateClientInput = Partial<CreateClientInput>

export type CreateProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'client' | 'tasks'>
export type UpdateProjectInput = Partial<CreateProjectInput>

export type CreateTaskInput = Omit<Task, 'id' | 'created_at' | 'updated_at' | 'project'>
export type UpdateTaskInput = Partial<CreateTaskInput>

export type CreateTimeEntryInput = Omit<TimeEntry, 'id' | 'created_at' | 'updated_at' | 'project' | 'task' | 'user'>
export type UpdateTimeEntryInput = Partial<CreateTimeEntryInput>

export type CreateInvoiceInput = Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'client' | 'project' | 'line_items'>
export type UpdateInvoiceInput = Partial<CreateInvoiceInput>

export type CreateInvoiceLineItemInput = Omit<InvoiceLineItem, 'id' | 'created_at' | 'updated_at'>
export type UpdateInvoiceLineItemInput = Partial<CreateInvoiceLineItemInput>

export type CreateExpenseInput = Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'project' | 'task' | 'user'>
export type UpdateExpenseInput = Partial<CreateExpenseInput>
