export async function destroySession(sessionId: number) {
  await $fetch(`/api/sessions/${sessionId}`, {method: "DELETE"})
}