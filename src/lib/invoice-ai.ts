import { InvoiceStatus, TimeEntryStatus } from '@/types/enums'
import type { Invoice, TimeEntry } from '@/types/models'
import { runAiTask } from '@/lib/ai/client'

export type InvoiceReminderDraft = {
  tone: 'friendly' | 'firm'
  subject: string
  body: string
  reason: string
}

export type InvoiceLineCaptureResult = {
  description: string
  quantity: number
  rate: number
  amount: number
  reason: string
}

export type TimeInvoiceDraft = {
  lineItems: InvoiceLineCaptureResult[]
  summary: string
  clientId?: string
}

export function canDraftInvoiceReminder(invoice: Invoice) {
  return invoice.status === InvoiceStatus.sent || invoice.status === InvoiceStatus.overdue
}

export async function draftInvoiceReminder(invoice: Invoice): Promise<InvoiceReminderDraft> {
  return runAiTask<InvoiceReminderDraft>('invoice_reminder', {
    invoice_number: invoice.invoice_number,
    total: invoice.total,
    currency: invoice.currency,
    due_date: invoice.due_date,
    status: invoice.status,
    client: {
      name: invoice.client?.name,
      contact_name: invoice.client?.contact_name,
    },
  })
}

export async function captureInvoiceLineFromText(text: string): Promise<InvoiceLineCaptureResult> {
  return runAiTask<InvoiceLineCaptureResult>('invoice_line', text)
}

function getEntryHours(entry: TimeEntry) {
  if (entry.duration_minutes) return Math.max(entry.duration_minutes / 60, 0)
  if (!entry.end_at) return 0
  const start = new Date(entry.start_at)
  const end = new Date(entry.end_at)
  return Math.max((end.getTime() - start.getTime()) / 3600000, 0)
}

export function getInvoiceableTimeEntries(entries: TimeEntry[]) {
  return entries.filter((entry) => (
    !entry.invoice_id &&
    entry.status !== TimeEntryStatus.invoiced &&
    entry.status !== TimeEntryStatus.rejected &&
    getEntryHours(entry) > 0
  ))
}

export async function draftInvoiceLinesFromTimeEntries(entries: TimeEntry[], fallbackRate = 0): Promise<TimeInvoiceDraft> {
  const invoiceableEntries = getInvoiceableTimeEntries(entries).slice(0, 8).map((entry) => ({
    id: entry.id,
    hours: Number(getEntryHours(entry).toFixed(2)),
    rate: entry.billable_rate ?? entry.task?.rate ?? entry.project?.rate ?? fallbackRate,
    notes: entry.notes,
    project: entry.project ? {
      name: entry.project.name,
      client_id: entry.project.client_id,
    } : null,
    task: entry.task ? {
      name: entry.task.name,
    } : null,
  }))

  const result = await runAiTask<Required<TimeInvoiceDraft>>('time_invoice_draft', {
    fallbackRate,
    entries: invoiceableEntries,
  })

  return {
    lineItems: result.lineItems,
    summary: result.summary,
    clientId: result.clientId || undefined,
  }
}
