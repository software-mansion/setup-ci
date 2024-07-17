import { PackageManager } from './types'

export const SKIP_INTERACTIVE_COMMAND = 'silent'
export const SKIP_GIT_CHECK_FLAG = 'skip-git-check'

export const LOCK_FILE_TO_MANAGER: Map<string, PackageManager> = new Map([
  ['yarn.lock', 'yarn'],
  ['package-lock.json', 'npm'],
])
