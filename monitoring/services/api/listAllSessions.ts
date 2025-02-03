export async function listAllSessions(): Promise<number[]> {
  const {sessions} = await $fetch("/api/sessions", {method: "GET"})
  return sessions
}