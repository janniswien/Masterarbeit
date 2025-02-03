import {interpretMonitorOutput} from "~/services/monitoring/interpretMonitorOutput";
import {exec, type ExecException} from "node:child_process";

export type MonitorResponse = {
  output: string
  verdict: boolean
  isDefinite: boolean
}

export async function executeMonitor(traceFilePath: string): Promise<MonitorResponse> {
  try {
    const output = await receiveMonitorOutput(traceFilePath)
    const interpretation = interpretMonitorOutput(output)
  
    return {
      output,
      verdict: interpretation.currentVerdict,
      isDefinite: interpretation.isDefinite,
    }
  } catch(error) {
    return {
      output: `Error evaluating ${traceFilePath}: ${error}`,
      verdict: false,
      isDefinite: true,
    }
  }
}

async function receiveMonitorOutput(traceFilePath: string) {
  return new Promise<string>((resolve, reject) => {
    const command = `java -jar tessla.jar interpreter specification.tessla ${traceFilePath}`
    exec(command, (error: (ExecException | null), stdout: string, stderr: string) => {
      if (error === null && stderr.length === 0) {
        resolve(stdout)
        return
      }

      console.log(`execution error in ${traceFilePath}: ${error}, ${stderr}, ${stdout}`);
      reject(`ERROR! (${error})`)
    })
  })
}