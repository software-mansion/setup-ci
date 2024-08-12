import { stat, readdir } from 'fs/promises'
import { join } from 'path'

// Recursively finds all files within directory at specified path and returns list of their paths.
export const expandDirectory = async (path: string): Promise<string[]> => {
  const pathStat = await stat(path)

  if (pathStat.isFile()) {
    return [path]
  }

  const files = await readdir(path)

  let result: string[] = []

  for (const file of files) {
    const fullPath = join(path, file)
    const fileStat = await stat(fullPath)

    if (fileStat.isDirectory()) {
      const expanded = await expandDirectory(fullPath)
      result = result.concat(expanded)
    } else {
      result.push(fullPath)
    }
  }

  return result
}
