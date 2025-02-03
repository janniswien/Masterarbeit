import type {MonitorResponse} from "~/services/monitoring/executeMonitor";

export async function receiveMonitorResult(sessionId: number): Promise<MonitorResponse> {
  return await $fetch<MonitorResponse>(`/api/monitors/${sessionId}`)
}