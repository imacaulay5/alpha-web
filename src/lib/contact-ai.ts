import { runAiTask } from '@/lib/ai/client'

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

function emptyToUndefined(value: string | undefined) {
  return value?.trim() || undefined
}

export async function captureContactFromText(text: string): Promise<ContactCaptureResult> {
  const result = await runAiTask<Required<ContactCaptureResult>>('contact_capture', text)

  return {
    ...result,
    name: emptyToUndefined(result.name),
    contact_name: emptyToUndefined(result.contact_name),
    email: emptyToUndefined(result.email),
    phone: emptyToUndefined(result.phone),
    address: emptyToUndefined(result.address),
    city: emptyToUndefined(result.city),
    state: emptyToUndefined(result.state),
    zip_code: emptyToUndefined(result.zip_code),
    notes: emptyToUndefined(result.notes),
  }
}
