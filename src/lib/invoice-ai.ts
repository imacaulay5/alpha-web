import { differenceInCalendarDays, parseISO } from 'date-fns'
import { InvoiceStatus } from '@/types/enums'
import type { Invoice } from '@/types/models'

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

function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value)
}

function getDaysPastDue(invoice: Invoice) {
  return differenceInCalendarDays(new Date(), parseISO(invoice.due_date))
}

export function canDraftInvoiceReminder(invoice: Invoice) {
  return invoice.status === InvoiceStatus.sent || invoice.status === InvoiceStatus.overdue
}

export function draftInvoiceReminder(invoice: Invoice): InvoiceReminderDraft {
  const clientName = invoice.client?.contact_name || invoice.client?.name || 'there'
  const amount = formatCurrency(invoice.total, invoice.currency)
  const daysPastDue = getDaysPastDue(invoice)
  const isOverdue = invoice.status === InvoiceStatus.overdue || daysPastDue > 0
  const tone: InvoiceReminderDraft['tone'] = isOverdue ? 'firm' : 'friendly'
  const dueCopy = isOverdue
    ? `was due ${Math.max(daysPastDue, 1)} ${Math.max(daysPastDue, 1) === 1 ? 'day' : 'days'} ago`
    : `is due on ${invoice.due_date}`

  return {
    tone,
    subject: `Reminder: invoice ${invoice.invoice_number} for ${amount}`,
    body: [
      `Hi ${clientName},`,
      '',
      `Just a quick reminder that invoice ${invoice.invoice_number} for ${amount} ${dueCopy}.`,
      '',
      'When you have a moment, please let me know if you need anything else from me to process it.',
      '',
      'Thank you,',
    ].join('\n'),
    reason: isOverdue
      ? 'This invoice is overdue, so Alpha drafted a firmer but still polite follow-up.'
      : 'This invoice is still open, so Alpha drafted a friendly payment reminder.',
  }
}

function cleanLineDescription(text: string) {
  return text
    .replace(/\b\d+(?:\.\d+)?\s*(?:hours?|hrs?|x)\b/gi, ' ')
    .replace(/\b(?:at|@)\s*\$?\d+(?:,\d{3})*(?:\.\d{1,2})?\b/gi, ' ')
    .replace(/\b\$?\d+(?:,\d{3})*(?:\.\d{1,2})?\s*(?:per|\/)\s*(?:hour|hr)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleCaseSentence(value: string) {
  if (!value) return 'Professional services'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function captureInvoiceLineFromText(text: string): InvoiceLineCaptureResult {
  const quantityMatch =
    text.match(/\b(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\b/i) ??
    text.match(/\b(\d+(?:\.\d+)?)\s*x\b/i)
  const rateMatch =
    text.match(/\b(?:at|@)\s*\$?(\d+(?:,\d{3})*(?:\.\d{1,2})?)\b/i) ??
    text.match(/\b\$?(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:per|\/)\s*(?:hour|hr)\b/i)
  const flatAmountMatch = text.match(/\$?(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:flat|fixed|total)\b/i)

  const quantity = quantityMatch ? Number(quantityMatch[1]) : 1
  const rate = rateMatch
    ? Number(rateMatch[1].replace(/,/g, ''))
    : flatAmountMatch
      ? Number(flatAmountMatch[1].replace(/,/g, ''))
      : 0
  const description = titleCaseSentence(cleanLineDescription(text))

  return {
    description,
    quantity,
    rate,
    amount: quantity * rate,
    reason: rateMatch
      ? 'Alpha found a quantity and rate in your note.'
      : flatAmountMatch
        ? 'Alpha found a flat amount and treated it as one line item.'
        : 'Alpha found a description. Add a rate if the amount is missing.',
  }
}
