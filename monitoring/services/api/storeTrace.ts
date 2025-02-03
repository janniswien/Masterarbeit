export async function storeTrace(sessionId: number, traceContent: string) {
  await $fetch(`/api/traces/${sessionId}/overwrite`, {
    method: "POST",
    headers: {"Content-Type": "text/plain"},
    body: traceContent
  })
}