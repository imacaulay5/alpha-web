export type ContactCaptureResult = {
  name?: string
  contact_name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  notes?: string
  reason: string
}

const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
const phoneRegex = /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/
const addressRegex = /\b\d{1,6}\s+[A-Za-z0-9 .'-]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|way|court|ct)\b/i
const cityStateZipRegex = /\b([A-Za-z .'-]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\b/

function titleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function cleanupLine(line: string) {
  return line
    .replace(/^company\s*:\s*/i, '')
    .replace(/^client\s*:\s*/i, '')
    .replace(/^contact\s*:\s*/i, '')
    .replace(/^name\s*:\s*/i, '')
    .trim()
}

export function captureContactFromText(text: string): ContactCaptureResult {
  const lines = text
    .split(/\n|,/)
    .map((line) => cleanupLine(line))
    .filter(Boolean)

  const email = text.match(emailRegex)?.[0]
  const phone = text.match(phoneRegex)?.[0]
  const address = text.match(addressRegex)?.[0]
  const cityStateZip = text.match(cityStateZipRegex)
  const ignored = new Set([email, phone, address, cityStateZip?.[0]].filter(Boolean))
  const candidateLines = lines.filter((line) => {
    return !Array.from(ignored).some((item) => item && line.includes(item))
      && !emailRegex.test(line)
      && !phoneRegex.test(line)
      && !addressRegex.test(line)
      && !cityStateZipRegex.test(line)
  })
  const companyLine =
    lines.find((line) => /^company\s*:/i.test(line) || /^client\s*:/i.test(line)) ??
    candidateLines[0]
  const contactLine =
    lines.find((line) => /^contact\s*:/i.test(line) || /^name\s*:/i.test(line)) ??
    candidateLines.find((line) => line !== companyLine && line.split(/\s+/).length <= 4)

  return {
    name: companyLine ? titleCase(companyLine) : undefined,
    contact_name: contactLine ? titleCase(contactLine) : undefined,
    email,
    phone,
    address,
    city: cityStateZip?.[1]?.trim(),
    state: cityStateZip?.[2],
    zip_code: cityStateZip?.[3],
    notes: text.trim(),
    reason: 'Alpha looked for company, contact, email, phone, and address details.',
  }
}
