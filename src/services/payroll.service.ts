import { getSupabaseClient } from '@/lib/supabase'
import type {
  Employee,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  PayrollRun,
  CreatePayrollRunInput,
  UpdatePayrollRunInput,
  PayStub,
} from '@/types/models'
import { PayrollStatus, PayFrequency } from '@/types/enums'

// ─── Employees ───────────────────────────────────────────────

export async function getEmployees(): Promise<Employee[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data as Employee[]
}

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('employees')
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Employee
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput): Promise<Employee> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('employees')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Employee
}

export async function deleteEmployee(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('employees').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Pay Calculations ────────────────────────────────────────

export const PAY_PERIODS_PER_YEAR: Record<PayFrequency, number> = {
  [PayFrequency.weekly]: 52,
  [PayFrequency.biweekly]: 26,
  [PayFrequency.semimonthly]: 24,
  [PayFrequency.monthly]: 12,
}

export interface PayStubCalculation {
  gross_pay: number
  federal_tax: number
  state_tax: number
  social_security: number
  medicare: number
  other_deductions: number
  net_pay: number
  employer_ss: number
  employer_medicare: number
}

/**
 * Calculate pay stub amounts using 2025 US tax rules (simplified).
 * Federal: IRS percentage method with 2025 brackets.
 * State: flat 5% placeholder — configure per state in production.
 * FICA: 6.2% SS (up to $176,100 wage base) + 1.45% Medicare.
 */
export function calculatePayStubAmounts(employee: Employee): PayStubCalculation {
  const periods = PAY_PERIODS_PER_YEAR[employee.pay_frequency]
  const gross_pay = Math.round((employee.salary / periods) * 100) / 100

  // Federal income tax — 2025 IRS percentage method (annualized)
  const allowanceValue = 4300
  const annualized = gross_pay * periods
  const taxableAnnual = Math.max(0, annualized - employee.federal_allowances * allowanceValue)
  let annualFederal = 0
  if (taxableAnnual <= 11600) annualFederal = taxableAnnual * 0.1
  else if (taxableAnnual <= 47150) annualFederal = 1160 + (taxableAnnual - 11600) * 0.12
  else if (taxableAnnual <= 100525) annualFederal = 5426 + (taxableAnnual - 47150) * 0.22
  else if (taxableAnnual <= 191950) annualFederal = 17168.5 + (taxableAnnual - 100525) * 0.24
  else if (taxableAnnual <= 243725) annualFederal = 39110.5 + (taxableAnnual - 191950) * 0.32
  else annualFederal = 55678.5 + (taxableAnnual - 243725) * 0.35
  const federal_tax = Math.round((annualFederal / periods) * 100) / 100

  // State income tax — flat 5% placeholder
  const state_tax = Math.round(gross_pay * 0.05 * 100) / 100

  // FICA — 2025 SS wage base $176,100
  const SS_WAGE_BASE = 176100
  const annualSS = Math.min(annualized, SS_WAGE_BASE)
  const social_security = Math.round((annualSS / periods) * 0.062 * 100) / 100
  const medicare = Math.round(gross_pay * 0.0145 * 100) / 100

  const other_deductions = 0
  const net_pay =
    Math.round((gross_pay - federal_tax - state_tax - social_security - medicare) * 100) / 100

  // Employer matches employee FICA
  const employer_ss = social_security
  const employer_medicare = medicare

  return {
    gross_pay,
    federal_tax,
    state_tax,
    social_security,
    medicare,
    other_deductions,
    net_pay,
    employer_ss,
    employer_medicare,
  }
}

// ─── Payroll Runs ────────────────────────────────────────────

export async function getPayrollRuns(): Promise<PayrollRun[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('payroll_runs')
    .select('*, pay_stubs:pay_stubs(*, employee:employees(*))')
    .order('pay_date', { ascending: false })

  if (error) throw new Error(error.message)
  return data as PayrollRun[]
}

export async function createPayrollRun(
  input: CreatePayrollRunInput,
  employees: Employee[]
): Promise<PayrollRun> {
  const supabase = getSupabaseClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    throw new Error(userError?.message || 'You must be signed in to create payroll runs')
  }

  const { data: run, error: runError } = await supabase
    .from('payroll_runs')
    .insert({
      ...input,
      user_id: userData.user.id,
    })
    .select()
    .single()

  if (runError) throw new Error(runError.message)

  const activeEmployees = employees.filter((e) => e.is_active)
  let totalGross = 0
  let totalDeductions = 0
  let totalEmployerTaxes = 0

  if (activeEmployees.length > 0) {
    const stubs = activeEmployees.map((emp) => {
      const calc = calculatePayStubAmounts(emp)
      totalGross += calc.gross_pay
      totalDeductions +=
        calc.federal_tax + calc.state_tax + calc.social_security + calc.medicare + calc.other_deductions
      totalEmployerTaxes += calc.employer_ss + calc.employer_medicare
      return {
        payroll_run_id: run.id,
        employee_id: emp.id,
        gross_pay: calc.gross_pay,
        federal_tax: calc.federal_tax,
        state_tax: calc.state_tax,
        social_security: calc.social_security,
        medicare: calc.medicare,
        other_deductions: calc.other_deductions,
        net_pay: calc.net_pay,
      }
    })

    const { error: stubError } = await supabase.from('pay_stubs').insert(stubs)
    if (stubError) throw new Error(stubError.message)
  }

  const { data: finalRun, error: updateError } = await supabase
    .from('payroll_runs')
    .update({
      total_gross: Math.round(totalGross * 100) / 100,
      total_deductions: Math.round(totalDeductions * 100) / 100,
      total_net: Math.round((totalGross - totalDeductions) * 100) / 100,
      total_employer_taxes: Math.round(totalEmployerTaxes * 100) / 100,
    })
    .eq('id', run.id)
    .select()
    .single()

  if (updateError) throw new Error(updateError.message)
  return finalRun as PayrollRun
}

export async function updatePayrollRun(
  id: string,
  input: UpdatePayrollRunInput
): Promise<PayrollRun> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('payroll_runs')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as PayrollRun
}

export async function deletePayrollRun(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('payroll_runs').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function processPayrollRun(id: string): Promise<PayrollRun> {
  return updatePayrollRun(id, { status: PayrollStatus.completed })
}

export async function getPayStubs(runId: string): Promise<PayStub[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('pay_stubs')
    .select('*, employee:employees(*)')
    .eq('payroll_run_id', runId)

  if (error) throw new Error(error.message)
  return data as PayStub[]
}
