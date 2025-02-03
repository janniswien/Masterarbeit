export async function readSessionTrace(sessionId: number): Promise<string> {
  const response = await $fetch(`/api/traces/${sessionId}`)
  return response.content
}