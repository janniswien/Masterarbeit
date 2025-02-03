export async function createSession(): Promise<number> {
  const {id: sessionId} = await $fetch("/api/sessions", {method: "POST"})
  return sessionId
}