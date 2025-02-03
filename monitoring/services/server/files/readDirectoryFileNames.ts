import fs from "node:fs";

export async function readDirectoryFileNames(directoryPath: string): Promise<string[]> {
  return await new Promise(resolve => resolveFiles(resolve, directoryPath))
}

async function resolveFiles(resolve: (value: (string[] | PromiseLike<string[]>)) => void, path: string): Promise<void> {
  fs.readdir(path, (isError, files) => resolve(isError ? [] : files))
}