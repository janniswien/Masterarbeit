import fs from "node:fs";

export function writeFile(path: string, content: string): string {
  fs.writeFile(path, content, () => undefined);
  return content
}