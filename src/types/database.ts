// Database types for Supabase
// This is a simplified version - in production, generate this from Supabase CLI

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          account_type: string
          hourly_rate: number | null
          is_active: boolean
          avatar_url: string | null
          phone: string | null
          timezone: string | null
          preferences: Json | null
          organization_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: string
          account_type?: string
          hourly_rate?: number | null
          is_active?: boolean
          avatar_url?: string | null
          phone?: string | null
          timezone?: string | null
          preferences?: Json | null
          organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          account_type?: string
          hourly_rate?: number | null
          is_active?: boolean
          avatar_url?: string | null
          phone?: string | null
          timezone?: string | null
          preferences?: Json | null
          organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string | null
          tax_id: string | null
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          tax_id?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          tax_id?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string | null
          name: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string | null
          contact_name: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          contact_name?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          contact_name?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string | null
          client_id: string | null
          name: string
          description: string | null
          billing_model: string
          rate: number | null
          budget: number | null
          start_date: string | null
          end_date: string | null
          is_active: boolean
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          client_id?: string | null
          name: string
          description?: string | null
          billing_model?: string
          rate?: number | null
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          client_id?: string | null
          name?: string
          description?: string | null
          billing_model?: string
          rate?: number | null
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          rate: number | null
          estimated_hours: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          rate?: number | null
          estimated_hours?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          rate?: number | null
          estimated_hours?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          task_id: string | null
          start_at: string
          end_at: string | null
          duration_minutes: number | null
          notes: string | null
          status: string
          source: string
          billable_rate: number | null
          invoice_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          task_id?: string | null
          start_at: string
          end_at?: string | null
          duration_minutes?: number | null
          notes?: string | null
          status?: string
          source?: string
          billable_rate?: number | null
          invoice_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          task_id?: string | null
          start_at?: string
          end_at?: string | null
          duration_minutes?: number | null
          notes?: string | null
          status?: string
          source?: string
          billable_rate?: number | null
          invoice_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string | null
          client_id: string | null
          project_id: string | null
          invoice_number: string
          issue_date: string
          due_date: string
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          currency: string
          status: string
          notes: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          client_id?: string | null
          project_id?: string | null
          invoice_number: string
          issue_date: string
          due_date: string
          subtotal: number
          tax_rate?: number
          tax_amount?: number
          total: number
          currency?: string
          status?: string
          notes?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          client_id?: string | null
          project_id?: string | null
          invoice_number?: string
          issue_date?: string
          due_date?: string
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          currency?: string
          status?: string
          notes?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_line_items: {
        Row: {
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
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity: number
          rate: number
          amount: number
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          rate?: number
          amount?: number
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          task_id: string | null
          amount: number
          currency: string
          category: string
          description: string | null
          merchant: string | null
          expense_date: string
          receipt_url: string | null
          status: string
          notes: string | null
          invoice_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          task_id?: string | null
          amount: number
          currency?: string
          category: string
          description?: string | null
          merchant?: string | null
          expense_date: string
          receipt_url?: string | null
          status?: string
          notes?: string | null
          invoice_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          task_id?: string | null
          amount?: number
          currency?: string
          category?: string
          description?: string | null
          merchant?: string | null
          expense_date?: string
          receipt_url?: string | null
          status?: string
          notes?: string | null
          invoice_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
