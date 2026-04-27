import { ExpenseCategory, expenseCategoryLabels } from '@/types/enums'

export type ExpenseCategorySuggestion = {
  category: ExpenseCategory
  confidence: 'high' | 'medium' | 'low'
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
