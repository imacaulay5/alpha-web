type AiResponse<T> = {
  result: T
  safety: {
    redacted: boolean
  }
}

export async function runAiTask<T>(task: string, payload: unknown): Promise<T> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, payload }),
  })

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(body?.error || 'AI request failed')
  }

  return (body as AiResponse<T>).result
}
