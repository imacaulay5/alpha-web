import { differenceInCalendarDays, parseISO } from 'date-fns'
import { InvoiceStatus } from '@/types/enums'
import type { Invoice } from '@/types/models'

export type InvoiceReminderDraft = {
  tone: 'friendly' | 'firm'
  subject: string
  body: string
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
