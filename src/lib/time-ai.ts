export type TimeCaptureResult = {
  date: string
  start_time: string
  end_time: string
  notes: string
  duration_minutes: number
  reason: string
}

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function parseTime(value: string) {
  const match = value.match(/\b([01]?\d|2[0-3])(?::([0-5]\d))?\s*(am|pm)?\b/i)
  if (!match) return undefined

  let hours = Number(match[1])
  const minutes = Number(match[2] ?? 0)
  const meridiem = match[3]?.toLowerCase()

  if (meridiem === 'pm' && hours < 12) hours += 12
  if (meridiem === 'am' && hours === 12) hours = 0

  return hours * 60 + minutes
}

function parseDateFromText(text: string) {
  const normalized = text.toLowerCase()
  const today = new Date()

  if (normalized.includes('yesterday')) {
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    return formatDateInput(yesterday)
  }

  if (normalized.includes('today')) {
    return formatDateInput(today)
  }

  const isoDate = text.match(/\b(20\d{2})[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])\b/)
  if (isoDate) {
    const [, year, month, day] = isoDate
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const usDate = text.match(/\b(0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])[-/](20\d{2})\b/)
  if (usDate) {
    const [, month, day, year] = usDate
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  return formatDateInput(today)
}

function parseDurationMinutes(text: string) {
  const hourMatch = text.match(/\b(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i)
  if (hourMatch) return Math.round(Number(hourMatch[1]) * 60)

  const minuteMatch = text.match(/\b(\d+)\s*(?:minutes?|mins?|m)\b/i)
  if (minuteMatch) return Number(minuteMatch[1])

  return 60
}

function parseTimeRange(text: string) {
  const rangeMatch = text.match(/\b(?:from\s*)?([01]?\d|2[0-3])(?::([0-5]\d))?\s*(am|pm)?\s*(?:-|to)\s*([01]?\d|2[0-3])(?::([0-5]\d))?\s*(am|pm)?\b/i)
  if (!rangeMatch) return undefined

  const start = parseTime([rangeMatch[1], rangeMatch[2] ? `:${rangeMatch[2]}` : '', rangeMatch[3] ?? ''].join(''))
  const end = parseTime([rangeMatch[4], rangeMatch[5] ? `:${rangeMatch[5]}` : '', rangeMatch[6] ?? rangeMatch[3] ?? ''].join(''))

  if (start === undefined || end === undefined || end <= start) return undefined

  return { start, end }
}

function cleanNotes(text: string) {
  return text
    .replace(/\b(?:from\s*)?([01]?\d|2[0-3])(?::([0-5]\d))?\s*(am|pm)?\s*(?:-|to)\s*([01]?\d|2[0-3])(?::([0-5]\d))?\s*(am|pm)?\b/gi, ' ')
    .replace(/\b\d+(?:\.\d+)?\s*(?:hours?|hrs?|h|minutes?|mins?|m)\b/gi, ' ')
    .replace(/\b(today|yesterday)\b/gi, ' ')
    .replace(/\b(20\d{2})[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])\b/g, ' ')
    .replace(/\b(0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])[-/](20\d{2})\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function captureTimeEntryFromText(text: string): TimeCaptureResult {
  const range = parseTimeRange(text)
  const durationMinutes = range ? range.end - range.start : parseDurationMinutes(text)
  const startMinutes = range?.start ?? 9 * 60
  const endMinutes = range?.end ?? startMinutes + durationMinutes
  const notes = cleanNotes(text) || 'Work session'

  return {
    date: parseDateFromText(text),
    start_time: minutesToTime(startMinutes),
    end_time: minutesToTime(endMinutes),
    notes: notes.charAt(0).toUpperCase() + notes.slice(1),
    duration_minutes: durationMinutes,
    reason: range
      ? 'Alpha found a start and end time in your note.'
      : 'Alpha found a duration and estimated the time block.',
  }
}
