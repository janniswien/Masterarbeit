import fs from "node:fs";

export async function readFile(filePath: string): Promise<string> {
  if (!fs.existsSync(filePath)) {
    return ""
  }

  return new Promise(resolve => fs.readFile(filePath, "utf8", (err, data) => {
    if (!err) {
      resolve(data)
      return
    }

    console.error("error reading trace", err)
    resolve("")
  }))
}