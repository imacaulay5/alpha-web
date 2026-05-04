import { runAiTask } from '@/lib/ai/client'

export type TimeCaptureResult = {
  date: string
  start_time: string
  end_time: string
  notes: string
  duration_minutes: number
  reason: string
}

export async function captureTimeEntryFromText(text: string): Promise<TimeCaptureResult> {
  return runAiTask<TimeCaptureResult>('time_entry', text)
}
