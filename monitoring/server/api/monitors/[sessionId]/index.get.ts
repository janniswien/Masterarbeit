import {executeMonitor, type MonitorResponse} from "~/services/monitoring/executeMonitor";

export default defineEventHandler(async (event): Promise<MonitorResponse> => {
  return await executeMonitor(`./trace-files/${getRouterParam(event, "sessionId")}.txt`)
})