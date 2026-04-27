import { ExpenseCategory, expenseCategoryLabels } from '@/types/enums'

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

const categorySignals: Array<{
  category: ExpenseCategory
  reason: string
  keywords: string[]
}> = [
  {
    category: ExpenseCategory.software,
    reason: 'Software and subscription tools usually belong in Software.',
    keywords: [
      'adobe',
      'app store',
      'aws',
      'azure',
      'chatgpt',
      'figma',
      'github',
      'google workspace',
      'notion',
      'openai',
      'saas',
      'slack',
      'software',
      'stripe',
      'subscription',
      'vercel',
      'zoom',
    ],
  },
  {
    category: ExpenseCategory.travel,
    reason: 'Transportation, lodging, and trip costs usually belong in Travel.',
    keywords: [
      'airbnb',
      'airfare',
      'airline',
      'airport',
      'delta',
      'flight',
      'gas',
      'hotel',
      'lyft',
      'mileage',
      'parking',
      'southwest',
      'taxi',
      'train',
      'travel',
      'uber',
      'united',
    ],
  },
  {
    category: ExpenseCategory.meals,
    reason: 'Food, coffee, and restaurant purchases usually belong in Meals.',
    keywords: [
      'cafe',
      'catering',
      'coffee',
      'doordash',
      'dunkin',
      'food',
      'grubhub',
      'lunch',
      'meal',
      'restaurant',
      'starbucks',
      'ubereats',
    ],
  },
  {
    category: ExpenseCategory.officeSupplies,
    reason: 'Office materials and workspace supplies usually belong in Office Supplies.',
    keywords: [
      'amazon',
      'desk',
      'fedex',
      'notebook',
      'office',
      'paper',
      'pens',
      'printer',
      'shipping',
      'staples',
      'supplies',
      'ups',
    ],
  },
  {
    category: ExpenseCategory.hardware,
    reason: 'Devices, accessories, and equipment usually belong in Hardware.',
    keywords: [
      'apple',
      'best buy',
      'camera',
      'computer',
      'dell',
      'equipment',
      'hardware',
      'keyboard',
      'laptop',
      'monitor',
      'mouse',
    ],
  },
  {
    category: ExpenseCategory.marketing,
    reason: 'Ads, promotion, and audience-building costs usually belong in Marketing.',
    keywords: [
      'ad',
      'ads',
      'campaign',
      'facebook',
      'google ads',
      'instagram',
      'linkedin',
      'mailchimp',
      'marketing',
      'meta',
      'promotion',
      'seo',
    ],
  },
  {
    category: ExpenseCategory.utilities,
    reason: 'Phone, internet, electricity, and similar services usually belong in Utilities.',
    keywords: [
      'at&t',
      'comcast',
      'electric',
      'energy',
      'internet',
      'mobile',
      'phone',
      'utility',
      'verizon',
      'water',
      'xfinity',
    ],
  },
]

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9& ]/g, ' ')
}

export function suggestExpenseCategory(input: {
  merchant?: string
  description?: string
  notes?: string
}): ExpenseCategorySuggestion {
  const text = normalize([input.merchant, input.description, input.notes].filter(Boolean).join(' '))

  if (!text.trim()) {
    return {
      category: ExpenseCategory.other,
      confidence: 'low',
      reason: 'Add a merchant or description and Alpha can suggest a better category.',
    }
  }

  const matches = categorySignals
    .map((signal) => {
      const score = signal.keywords.reduce((total, keyword) => {
        return text.includes(keyword) ? total + 1 : total
      }, 0)

      return { ...signal, score }
    })
    .filter((signal) => signal.score > 0)
    .sort((a, b) => b.score - a.score)

  const best = matches[0]

  if (!best) {
    return {
      category: ExpenseCategory.other,
      confidence: 'low',
      reason: 'No strong match yet. Other is safest until more detail is added.',
    }
  }

  return {
    category: best.category,
    confidence: best.score > 1 ? 'high' : 'medium',
    reason: best.reason,
  }
}

export function getExpenseCategorySuggestionLabel(suggestion: ExpenseCategorySuggestion) {
  return expenseCategoryLabels[suggestion.category]
}

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseDateFromText(text: string): string | undefined {
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

  return undefined
}

function parseAmountFromText(text: string): string | undefined {
  const currencyAmount = text.match(/(?:\$|usd\s*)\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i)
  const plainAmount = text.match(/\b(\d+(?:,\d{3})*\.\d{2})\b/)
  const amount = currencyAmount?.[1] ?? plainAmount?.[1]

  if (!amount) return undefined

  return amount.replace(/,/g, '')
}

function cleanCaptureText(text: string) {
  return text
    .replace(/(?:\$|usd\s*)\s*\d+(?:,\d{3})*(?:\.\d{1,2})?/gi, ' ')
    .replace(/\b\d+(?:,\d{3})*\.\d{2}\b/g, ' ')
    .replace(/\b(20\d{2})[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])\b/g, ' ')
    .replace(/\b(0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])[-/](20\d{2})\b/g, ' ')
    .replace(/\b(today|yesterday)\b/gi, ' ')
    .replace(/\b(at|from|for|on|paid|expense|receipt|purchase)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function inferMerchant(text: string) {
  const cleaned = cleanCaptureText(text)
  if (!cleaned) return undefined

  const words = cleaned.split(' ').slice(0, 4)
  return titleCase(words.join(' '))
}

export function captureExpenseFromText(text: string): ExpenseSmartCaptureResult {
  const suggestion = suggestExpenseCategory({ merchant: text, description: text, notes: text })
  const amount = parseAmountFromText(text)
  const expenseDate = parseDateFromText(text)
  const merchant = inferMerchant(text)
  const description = cleanCaptureText(text)

  return {
    amount,
    merchant,
    description: description || undefined,
    expense_date: expenseDate,
    category: suggestion.category,
    confidence: suggestion.confidence,
    reason: amount
      ? `${suggestion.reason} Alpha also found an amount in your note.`
      : suggestion.reason,
  }
}
