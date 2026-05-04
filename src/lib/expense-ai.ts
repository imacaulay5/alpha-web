import { ExpenseCategory, expenseCategoryLabels } from '@/types/enums'
import { runAiTask } from '@/lib/ai/client'

export type ExpenseCategorySuggestion = {
  category: ExpenseCategory
  confidence: 'high' | 'medium' | 'low'
  reason: string
}

export type ExpenseSmartCaptureResult = {
  amount?: string
  merchant?: string
  description?: string
  expense_date?: string
  category: ExpenseCategory
  confidence: ExpenseCategorySuggestion['confidence']
  reason: string
}

export type ReceiptDocumentCaptureResult = ExpenseSmartCaptureResult & {
  notes?: string
  summary: string
}

export async function suggestExpenseCategory(input: {
  merchant?: string
  description?: string
  notes?: string
}): Promise<ExpenseCategorySuggestion> {
  const result = await runAiTask<ExpenseSmartCaptureResult>('expense_capture', input)
  return {
    category: result.category,
    confidence: result.confidence,
    reason: result.reason,
  }
}

export function getExpenseCategorySuggestionLabel(suggestion: ExpenseCategorySuggestion) {
  return expenseCategoryLabels[suggestion.category]
}

function emptyToUndefined(value: string | undefined) {
  return value?.trim() || undefined
}

export async function captureExpenseFromText(text: string): Promise<ExpenseSmartCaptureResult> {
  const result = await runAiTask<Required<ExpenseSmartCaptureResult>>('expense_capture', text)

  return {
    ...result,
    amount: emptyToUndefined(result.amount),
    merchant: emptyToUndefined(result.merchant),
    description: emptyToUndefined(result.description),
    expense_date: emptyToUndefined(result.expense_date),
  }
}

export async function captureReceiptDocumentFromText(text: string): Promise<ReceiptDocumentCaptureResult> {
  const result = await runAiTask<Required<ReceiptDocumentCaptureResult>>('receipt_capture', text)

  return {
    ...result,
    amount: emptyToUndefined(result.amount),
    merchant: emptyToUndefined(result.merchant),
    description: emptyToUndefined(result.description),
    expense_date: emptyToUndefined(result.expense_date),
    notes: emptyToUndefined(result.notes),
  }
}
