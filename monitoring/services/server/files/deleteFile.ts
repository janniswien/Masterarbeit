import fs from "node:fs";

export function deleteFile(filePath: string): void {
  fs.unlinkSync(filePath);
}