import { format, parseISO } from 'date-fns'

export function formatDateOnly(value: string | null | undefined, pattern = 'MMM d, yyyy') {
  if (!value) return '-'

  const dateOnly = value.slice(0, 10)
  const [year, month, day] = dateOnly.split('-').map(Number)

  if (!year || !month || !day) {
    return format(parseISO(value), pattern)
  }

  return format(new Date(year, month - 1, day), pattern)
}

export function dateInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : ''
}
