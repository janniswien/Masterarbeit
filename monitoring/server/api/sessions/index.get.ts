import * as fs from "node:fs";
import {readDirectoryFileNames} from "~/services/server/files/readDirectoryFileNames";

export default defineEventHandler(async (event) => ({
  sessions: transformFileNames(await readDirectoryFileNames("./trace-files"))
}))

function transformFileNames(filesNames: string[]): number[] {
  return filesNames.map(fileName => parseInt(fileName.replace(".txt", "")))
}