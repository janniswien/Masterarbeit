export function interpretMonitorOutput(output: string): {currentVerdict: boolean, isDefinite: boolean} {
  if (output.includes("finalVerdict = -2")) {
    return {currentVerdict: false, isDefinite: true}
  }

  const lastVerdictPosition = output.lastIndexOf("finalVerdict")
  const lastVerdictSuffix = lastVerdictPosition !== -1
    ? output.substring(lastVerdictPosition, output.length)
    : ""

  if (lastVerdictSuffix.includes("finalVerdict = -1")) {
    return {currentVerdict: false, isDefinite: false}
  }

  return {currentVerdict: true, isDefinite: false}
}